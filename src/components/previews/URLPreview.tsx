// src/components/previews/URLPreview.tsx

import { FC } from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'

import FourOhFour from '../FourOhFour'
import Loading from '../Loading'
// vvvvvvvvvv 这是核心修复 vvvvvvvvvv
import DownloadButtonGroup from '../DownloadBtnGtoup' // 导入默认导出的 DownloadButtonGroup
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
import useFileContent from '../../utils/fetchOnMount'
import { DownloadBtnContainer, PreviewContainer } from './Containers'
import { getBaseUrl } from '../../utils/getBaseUrl'

/**
 * Clean the URL and returns a new URL to be rendered as a hyperlink
 *
 * @param url The URL to be parsed
 * @returns The parsed URL
 */
function parseDotUrl(url: string): string {
  // Return empty string if url is not a valid string
  if (typeof url !== 'string') {
    return ''
  }
  // The URL may be a single line of string with the URL in it, when in fact it is not a valid URL.
  // This extracts the URL from the string.
  const urlRegex = new RegExp(/https?:\/\/[^\s/$.?#].[^\s]*/)
  const hyperlink = url.match(urlRegex)
  return hyperlink ? hyperlink[0] : ''
}

const URLPreview: FC<{ file: any }> = ({ file }) => {
  const { asPath } = useRouter()
  const { response: content, error, validating } = useFileContent(`/api/raw/?path=${asPath}`, asPath)

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
      <PreviewContainer>
        <Loading loadingText={t('Loading file content...')} />
      </PreviewContainer>
    )
  }

  const directLink = getBaseUrl() + `/api/raw/?path=${asPath}`
  const hyperlink = parseDotUrl(content)

  return (
    <div>
      <PreviewContainer>
        <div className="space-y-4">
          <p className="text-lg font-bold">{t('This is an URL redirect')}</p>
          <p className="text-sm font-medium opacity-80">{t('Redirecting to:')}</p>
          <a
            className="block w-full truncate rounded border border-gray-400/20 bg-gray-50 p-2 font-mono text-sm dark:bg-gray-800"
            href={hyperlink}
            target="_blank"
            rel="noopener noreferrer"
          >
            {hyperlink}
          </a>
        </div>
      </PreviwContainer>

      <DownloadBtnContainer>
        {/* vvvvvvvvvv 使用正确的组件 vvvvvvvvvv */}
        <DownloadButtonGroup directLink={directLink} downloadUrl={hyperlink} />
        {/* ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ */}
      </DownloadBtnContainer>
    </div>
  )
}

export default URLPreview