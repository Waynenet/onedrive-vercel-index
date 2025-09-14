// src/components/previews/MarkdownPreview.tsx

import { FC, CSSProperties } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import { useTranslation } from 'next-i18next'

// vvvvvvvvvv 这是核心修复 vvvvvvvvvv
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrowNight, tomorrow } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { useSystemTheme } from '../../utils/useSystemTheme'
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

import 'katex/dist/katex.min.css'

import useFileContent from '../../utils/fetchOnMount'
import FourOhFour from '../FourOhFour'
import Loading from '../Loading'
import DownloadButtonGroup from '../DownloadBtnGtoup'
import { DownloadBtnContainer, PreviewContainer } from './Containers'
import { OdFileObject } from '../../types'

const MarkdownPreview: FC<{
  file: OdFileObject
  path: string
  standalone?: boolean
}> = ({ file, path, standalone = true }) => {
  const parentPath = standalone ? path.substring(0, path.lastIndexOf('/')) : path

  const { response: content, error, validating } = useFileContent(`/api/raw/?path=${parentPath}/${file.name}`, path)
  const { t } = useTranslation()
  const theme = useSystemTheme() // <-- 获取系统主题

  const isUrlAbsolute = (url: string) => url.indexOf('://') > 0 || url.indexOf('//') === 0

  const customRenderer = {
    img: ({ src, ...props }: { src?: string; alt?: string; title?: string; width?: string | number; height?: string | number; style?: CSSProperties }) => {
      const finalSrc = isUrlAbsolute(src as string) ? src : `/api/?path=${parentPath}/${src}&raw=true`
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={finalSrc} {...props} />
    },
    // vvvvvvvvvv 这是核心修复：直接使用 SyntaxHighlighter vvvvvvvvvv
    code({ node, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '')
      const language = match ? match[1] : 'text'

      // 内联代码
      if (!className) {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        )
      }

      // 代码块
      return (
        <SyntaxHighlighter
          language={language}
          style={theme === 'dark' ? tomorrowNight : tomorrow}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      )
    },
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
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