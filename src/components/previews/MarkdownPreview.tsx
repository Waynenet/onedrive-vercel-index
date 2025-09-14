// src/components/previews/MarkdownPreview.tsx

import { FC, CSSProperties } from 'react'
import ReactMarkdown, { Components } from 'react-markdown' // 导入 Components 类型
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import { useTranslation } from 'next-i18next'

import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrowNight, tomorrow } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { useSystemTheme } from '../../utils/useSystemTheme'

import 'katex/dist/katex.min.css'

import useFileContent from '../../utils/fetchOnMount'
import FourOhFour from '../FourOhFour'
import Loading from '../Loading'
import DownloadButtonGroup from '../DownloadBtnGtoup'
import { DownloadBtnContainer, PreviewContainer } from './Containers'
import { OdFileObject } from '../../types'

const MarkdownPreview: FC<{
  file: Pick<OdFileObject, 'name'> & { '@microsoft.graph.downloadUrl'?: string }
  path: string
  standalone?: boolean
}> = ({ file, path, standalone = true }) => {
  const parentPath = standalone ? path.substring(0, path.lastIndexOf('/')) : path

  const contentFetchUrl =
    standalone || file['@microsoft.graph.downloadUrl']
      ? `/api/raw/?path=${parentPath}/${file.name}`
      : `/api/raw/?path=${path}`
  const { response: content, error, validating } = useFileContent(contentFetchUrl, path)
  
  const { t } = useTranslation()
  const theme = useSystemTheme()

  const isUrlAbsolute = (url: string) => url.indexOf('://') > 0 || url.indexOf('//') === 0

  // vvvvvvvvvv 这是核心修复 vvvvvvvvvv
  // 1. 明确地为 customRenderer 标注 Components 类型
  const customRenderer: Components = {
    // 2. 为 img 的 props 添加明确的类型，并解构出 alt
    img: ({ src, alt, ...props }) => {
      const finalSrc = isUrlAbsolute(src as string) ? src : `/api/?path=${parentPath}/${src}&raw=true`
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={finalSrc} alt={alt} {...props} />
    },
    // 3. 在 code 的参数中，只解构我们确定存在的属性
    code({ node, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '')
      
      // 内联代码 (没有 language-前缀)
      if (!match) {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        )
      }

      // 代码块
      return (
        <SyntaxHighlighter
          language={match[1]}
          style={theme === 'dark' ? tomorrowNight : tomorrow}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      )
    },
  }
  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

  if (error) {
    return (
      <PreviewContainer>
        <FourOhFour errorMsg={error} />
      </PreviewContainer>
    )
  }
  if (validating) {
    return (
      <PreviewContainer>
        <Loading loadingText={t('Loading file content...')} />
      </PreviewContainer>
    )
  }

  if (!content) {
    return (
      <PreviewContainer>
        <Loading loadingText={t('Loading file content...')} />
      </PreviewContainer>
    )
  }

  return (
    <div>
      <PreviewContainer>
        <div className="markdown-body">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex, rehypeRaw]}
            components={customRenderer}
          >
            {content}
          </ReactMarkdown>
        </div>
      </PreviewContainer>
      {standalone && (
        <DownloadBtnContainer>
          <DownloadButtonGroup />
        </DownloadBtnContainer>
      )}
    </div>
  )
}

export default MarkdownPreview