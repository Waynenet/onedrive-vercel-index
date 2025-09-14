// src/components/previews/MarkdownPreview.tsx

import { FC, CSSProperties } from 'react'
import ReactMarkdown, { Components } from 'react-markdown'
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

  const customRenderer: Components = {
    img: ({ src, alt, ...props }) => {
      const finalSrc = isUrlAbsolute(src as string) ? src : `/api/?path=${parentPath}/${src}&raw=true`
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={finalSrc} alt={alt} {...props} />
    },

    // vvvvvvvvvv 这是核心修复 vvvvvvvvvv
    // 我们在参数中解构出 ref，这样它就不会被包含在 `{...props}` 中
    code({ node, className, children, ref, ...props }) {
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
      const match = /language-(\w+)/.exec(className || '')

      if (!match) {
        return (
          // 对于内联代码，它是一个真正的 <code> DOM 元素，所以我们应该把 ref 传给它
          <code className={className} ref={ref} {...props}>
            {children}
          </code>
        )
      }

      // 对于代码块，我们使用 SyntaxHighlighter。
      // 因为 ref 已经被解构出来，所以这里的 {...props} 不再包含它，
      // 从而避免了类型冲突。
      return (
        <SyntaxHighlighter
          language={match[1]}
          style={(theme === 'dark' ? tomorrowNight : tomorrow) as any} // 保持 style 的类型断言
          {...props} // 这里的 props 已经不包含 ref 了
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      )
    },
  }

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