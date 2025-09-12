import { FC } from 'react'
import { useTranslation } from 'next-i18next'

import { OdFileObject } from '../../types'
import { DownloadBtnContainer, PreviewContainer } from './Containers'
import DownloadButtonGroup from '../DownloadBtnGtoup'
import { getBaseUrl } from '../../utils/getBaseUrl'

const OfficePreview: FC<{ file: OdFileObject }> = ({ file }) => {
  const { t } = useTranslation()

  // 构建 Microsoft Office Web Viewer 的 URL
  const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
    file['@microsoft.graph.downloadUrl']
  )}`

  // 从 parentReference 中获取父目录路径，并与文件名拼接，以获取完整的文件 API 路径
  // Drive API 路径通常以 /drive/root: 开头，我们需要将其替换为空字符串
  const filePath = `${file.parentReference.path.replace('/drive/root:', '')}/${file.name}`

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
          // 使用新构建的正确路径
          directLink={getBaseUrl() + `/api/raw/?path=${filePath}`}
          downloadUrl={file['@microsoft.graph.downloadUrl']}
        />
      </DownloadBtnContainer>
    </div>
  )
}

export default OfficePreview