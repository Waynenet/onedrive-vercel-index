import { FC } from 'react'
import { useTranslation } from 'next-i18next'

import { OdFileObject } from '../../types'
import { DownloadBtnContainer, PreviewContainer } from './Containers'
import DownloadButtonGroup from '../DownloadBtnGtoup'
import { getBaseUrl } from '../../utils/getBaseUrl'

const OfficePreview: FC<{ file: OdFileObject }> = ({ file }) => {
  const { t } = useTranslation()

  const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
    file['@microsoft.graph.downloadUrl']
  )}`

  return (
    <div>
      <PreviewContainer>
        <div className="w-full h-[80vh] overflow-hidden">
          <iframe
            src={officeViewerUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            title={file.name}
          >
            {t('Loading Office document...')}
          </iframe>
        </div>
      </PreviewContainer>
      <DownloadBtnContainer>
        <DownloadButtonGroup
          directLink={getBaseUrl() + `/api/raw/?path=${file.path}`}
          downloadUrl={file['@microsoft.graph.downloadUrl']}
        />
      </DownloadBtnContainer>
    </div>
  )
}

export default OfficePreview