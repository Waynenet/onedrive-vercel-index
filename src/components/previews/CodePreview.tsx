// src/components/previews/CodePreview.tsx
import { FC } from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'

import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrowNight, tomorrow } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { useSystemTheme } from '../../utils/useSystemTheme'

import useFileContent from '../../utils/fetchOnMount'
import { getLanguageByFileName } from '../../utils/getPreviewType'
import FourOhFour from '../FourOhFour'
import Loading from '../Loading'
import DownloadButtonGroup from '../DownloadBtnGtoup'
import { DownloadBtnContainer, PreviewContainer } from './Containers'

const CodePreview: FC<{ file: any }> = ({ file }) => {
  const { asPath } = useRouter()
  const { response: content, error, validating } = useFileContent(`/api/raw/?path=${asPath}`, asPath)

  const theme = useSystemTheme() // <--- 使用我们自己的 Hook (不再需要'dark'参数)
  const { t } = useTranslation()

  if (error) {
    return (
      <PreviewContainer>
        <FourOhFour errorMsg={error} />
      </PreviewContainer>
    )
  }
  if (validating) {
    return (
      <>
        <PreviewContainer>
          <Loading loadingText={t('Loading file content...')} />
        </PreviewContainer>
        <DownloadBtnContainer>
          <DownloadButtonGroup />
        </DownloadBtnContainer>
      </>
    )
  }

  return (
    <>
      <PreviewContainer>
        <SyntaxHighlighter
          language={getLanguageByFileName(file.name)}
          style={theme === 'dark' ? tomorrowNight : tomorrow}
        >
          {content}
        </SyntaxHighlighter>
      </PreviewContainer>
      <DownloadBtnContainer>
        <DownloadButtonGroup />
      </DownloadBtnContainer>
    </>
  )
}

export default CodePreview