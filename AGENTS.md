# AGENTS.md — onedrive-vercel-index（项目说明与工作规范）

## 项目概览
这是一个基于 **Next.js + Vercel + Microsoft Graph API** 的 **OneDrive 公开目录索引站**。它把指定 OneDrive 文件夹以网页形式对外展示，支持浏览、预览、搜索、下载等多种能力。首次部署后通过内置的 OAuth 向导授权，即可无服务器、免费地在 Vercel 上运行。

- 项目名：`onedrive-vercel-index`
- 版本：`0.1.0`
- 上游仓库（模板源头）：https://github.com/spencerwooo/onedrive-vercel-index
- 官方文档：https://ovi.swo.moe/
- 本仓库是上游项目的一份个性化部署/定制副本，已对站点标题、图标、联系人、分享目录等做了定制。

## 技术栈
- 框架：**Next.js 15**（React 18，TypeScript，开启 `reactStrictMode`，`trailingSlash: true`）
- 构建/发布：**Vercel** + **pnpm**（`pnpm-lock.yaml`）
- 状态获取：**SWR**（含 `useSWRInfinite` 无限分页）
- 样式：**Tailwind CSS 3** + PostCSS（深色模式基于 Tailwind `dark:` 变体）
- 图标：**Font Awesome**（在 `_app.tsx` 全局注册，含全部品牌图标）
- 国际化：**next-i18next**（多语言，默认 `zh-CN`）
- 预览能力：markdown / 代码高亮 / PDF / EPUB / Office / 音频 / 视频 / 图片等
- 认证存托：**Redis**（默认对接 Upstash，通过 `REDIS_URL` 指定）

## 目录结构
```
config/                 # 站点与 API 配置（见下文「配置中心」）
public/                 # 静态资源
  locales/<locale>/common.json   # 各语言翻译（de-DE/en/es/zh-CN/hi/id/tr-TR/zh-TW）
  icons/, images/, players/       # 站点图标、演示图、播放器 Logo
src/
  components/           # 前端组件（导航、面包屑、文件列表、预览、多文件下载、搜索等）
    previews/           # 各类文件预览（PDF/Office/视频/音频/Markdown/代码/EPUB 等）
  pages/
    index.tsx           # 首页（根目录）
    [...path].tsx       # 文件/文件夹动态路由（catch-all）
    _app.tsx            # 全局入口：注册图标、进度条、Analytics、翻译
    _document.tsx       # 注入 Google Fonts、站点 favicon、描述信息
    api/                # 服务端 API 路由（见「API 路由」）
    onedrive-vercel-index-oauth/  # 三步骤 OAuth 授权向导（step-1/2/3）
  styles/               # globals.css、markdown-github.css
  types/index.d.ts      # OneDrive API 返回对象的 TypeScript 类型
  utils/                # 工具函数（见「关键工具」）
```

## 配置中心
所有可定制配置集中在根目录 `config/` 下：

### `config/site.config.js`
站点级配置，重要字段：
- `userPrincipalName`：微软账号邮箱，用于 OAuth 首次校验身份；也可用 `NEXT_PUBLIC_USER_PRINCIPLE_NAME` 环境变量覆盖。
- `title` / `icon`：站点标题与导航栏图标（图标放在 `/public` 下）。
- `baseDirectory`：要公开分享的 OneDrive 根目录，默认 `/Share`；设为 `/` 表示分享整个网盘根。
- `maxItems`：单目录最多列出的条目数（分页），受 OneDrive API 200 条上限约束。
- `protectedRoutes`：需要密码保护的目录路径数组（指向存放了 `.password` 文件的目录）。
- `footer` / `links` / `email` / `datetimeFormat`：页脚、社交媒体链接、邮箱、时间格式。
- `googleFontSans` / `googleFontMono` / `googleFontLinks`：Google Fonts 字体定制。
- `kvPrefix`：Redis KV 键前缀（可用 `KV_PREFIX` 环境变量覆盖）。

> ⚠️ 编码注意：本仓库（尤其 `config/site.config.js`）为 **UTF-8** 编码，内含中文（如标题 `WayneのDrive`、保护路由 `/影视/加密` 等）。在 Windows 中文 locale 下若用 `Get-Content`（默认按 GBK 解码）会显示乱码；请用 `Get-Content -Encoding UTF8` 或直接以 UTF-8 读字节解码。

### `config/api.config.js`
OneDrive API 与 OAuth 凭据：
- `clientId` / `obfuscatedClientSecret`：微软应用客户端 ID 与 AES 混淆后的客户端密钥。
- `redirectUri`：OAuth 回调地址（本地通常 `http://localhost`）。
- `authApi` / `driveApi`：微软登录与 Graph API 端点。
- `scope`：OAuth 申请权限。
- `cacheControlHeader`：Vercel 边缘缓存头（`max-age=0, s-maxage=60, stale-while-revalidate`）。

## API 路由（`src/pages/api/`）
- `api/index.ts`：主接口。`GET /api/?path=…&next=…&sort=…` 返回文件或文件夹（含分页）；`POST /api` 用于前端写入 OAuth 拿到的 access/refresh token。包含 `getAccessToken`、`encodePath`、`getAuthTokenPath`、`checkAuthRoute` 等核心逻辑。
- `api/raw.ts`：原始文件下载接口。`GET /api/raw/?path=…`，命中 `proxy=true` 且文件 < 4MB 时流式代理，否则 301 跳转到 `@microsoft.graph.downloadUrl`；带 CORS。
- `api/item.ts`：按 OneDrive item `id` 查询对象信息（用于确定路径）。
- `api/search.ts`：`GET /api/search/?q=…` 搜索；内部对查询词做 `sanitiseQuery` 转义。
- `api/thumbnail.ts`：`GET /api/thumbnail/?path=…&size=large|medium|small` 重定向到文件缩略图。
- `api/name/[name].ts`：自定义下载链接（末尾带扩展名），转交给 `raw` 处理。

所有 API 都会设置缓存头；**受保护路由一律 `Cache-Control: no-cache`**，不被边缘缓存。

## 认证与安全
- **OAuth 向导**：`src/pages/onedrive-vercel-index-oauth/step-1/2/3.tsx` 引导用户完成微软授权，拿到 access/refresh token。
- **token 存取**：`src/utils/odAuthTokenStore.ts` 用 Redis(Upstash) 存取 `access_token`（带过期）与 `refresh_token`，键名带 `siteConfig.kvPrefix` 前缀。
- **token 混淆**：`src/utils/oAuthHandler.ts` 用 CryptoJS AES（密钥 `onedrive-vercel-index`）做 `obfuscateToken`/`revealObfuscatedToken`，token 在传输与存储时均混淆。真实客户端密钥通过 `revealObfuscatedToken(apiConfig.obfuscatedClientSecret)` 还原。
- **受保护目录**：目录中放一个 `.password` 文件即成为密码保护目录。前端把用户输入的密码做 SHA256 后通过 `od-protected-token` 请求头 / `odpt` 查参携带；`src/utils/protectedRouteHandler.ts` 负责 `getStoredToken`、`matchProtectedRoute`、`compareHashedToken`。

## 关键工具（`src/utils/`）
- `fetchWithSWR.ts`：`fetcher`（axios+SWR）与 `useProtectedSWRInfinite`（无限分页，自动附加受保护 token）。
- `fetchOnMount.ts`：`useFileContent`，组件挂载时以 blob 方式拉取 raw 文件内容用于文本预览。
- `getPreviewType.ts`：扩展名→预览类型映射（image/text/markdown/code/pdf/video/audio/ms-office/epub/url）。
- `getFileIcon.ts`：扩展名→FontAwesome 图标（`getFileIcon`、`getExtension`、`getRawExtension`、`hasKey`）。
- `fileDetails.ts`：`humanFileSize`（文件大小人性化）与 `formatModifiedDateTime`（用 dayjs 按 `siteConfig.datetimeFormat` 格式化时间）。
- `getBaseUrl.ts` / `getReadablePath.ts`：取站点基地址 / 把路径做成可读但仍合法的 URL。
- `protectedRouteHandler.ts` / `oAuthHandler.ts` / `odAuthTokenStore.ts`：见上文「认证与安全」。
- `useDeviceOS.ts` / `useLocalStorage.ts`：设备系统检测 / 带事件同步的 localStorage hook。

## 前端组件（`src/components/`）
- 布局与导航：`Navbar`（导航 + Ctrl/⌘+K 搜索）、`Breadcrumb`、`Footer`、`SwitchLayout`（列表/网格切换）、`SwitchLang`（语言切换）。
- 列表：`FileListing`（核心，含文件预览逻辑）、`FolderGridLayout`、`FolderListLayout`。
- 下载：`DownloadBtnGtoup`、`MultiFileDownloader`（多文件/整文件夹 zip 下载）、`CustomEmbedLinkMenu`（自定义直链）。
- 其它：`Auth`（密码弹窗）、`SearchModal`（搜索弹窗）、`Loading`、`FourOhFour`（404）。
- 预览：`previews/` 下 `DefaultPreview`、`MarkdownPreview`、`CodePreview`、`TextPreview`、`PDFPreview`、`EPUBPreview`、`OfficePreview`、`ImagePreview`、`AudioPreview`、`VideoPreview`、`URLPreview`、`Containers`。部分涉及浏览器的预览（Office/音视频/PDF/EPUB）用 `dynamic(..., { ssr: false })` 关闭 SSR。

## 常用脚本（`package.json`）
- `pnpm dev`：本地开发（Next dev，会按需刷新翻译文件）。
- `pnpm build` / `pnpm start`：生产构建 / 启动。
- `pnpm lint`：ESLint（Next + Prettier 配置）。
- `pnpm format`：Prettier 格式化 `src/**/*.{js,ts,jsx,tsx}`（`printWidth:120`、无分号、单引号）。
- `pnpm extract`：i18next 翻译提取（配置见 `i18next-parser.config.js`）。
- 新依赖建议忽略 peer 冲突（`.npmrc` 已设 `strict-peer-dependencies=false`）。

## 环境变量
- `REDIS_URL`：Upstash(Redis) 连接串，token 持久化必需。
- `KV_PREFIX`（可选）：KV 键前缀，避免多站共用 Redis 冲突。
- `NEXT_PUBLIC_USER_PRINCIPLE_NAME`（可选）：覆盖 `siteConfig.userPrincipalName`，避免邮箱暴露到客户端 JS 中。

## 工作规范（务必遵守）
- **禁止批量删除**：不得执行 `del /s`、`rd /s`、`rmdir /s`、`Remove-Item -Recurse`、`rm -rf` 等任何递归/批量删除命令。
- **删除文件时**：只能一次删除一个「明确写出完整路径」的文件，例如 `Remove-Item "C:\path\to\file.txt"`。
- 确实需要批量删除时：停止操作，向用户说明并请用户手动删除。
- Windows 下读取中文内容请留意 UTF-8 编码；做文件迁移/删除前先核对解析出的绝对路径，确保落在工作区目录内。
- 修改代码前先参考现有结构，保持风格一致（Prettier 配置已在 `package.json` 中声明）。

## 已知注意点
- `next.config.js` 开启 `trailingSlash: true`，这是 Next i18n 配合 API 路由所必需的（否则 API 可能 404）。
- 站点标题、页脚、保护路由等在 `config/site.config.js` 中有中文内容，改动后有条件的可跑一次 `pnpm build` 验证。
- 数据全部来自 OneDrive Graph API，本地无业务数据库（token 除外，存 Redis）。