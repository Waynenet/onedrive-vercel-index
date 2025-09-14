import { FC } from 'react'
import Plyr from 'plyr-react'
import type PlyrJS from 'plyr'
import 'plyr/dist/plyr.css' // 保持从 'plyr' 导入 CSS

import { getBaseUrl } from '../../utils/getBaseUrl'
import { DownloadBtnContainer } from './Containers'
import DownloadButtonGroup from '../DownloadBtnGtoup'
import { OdFileObject } from '../../types'

const PlyrComponent: FC<{
  videoName: string
  videoUrl: string
  width?: number
  height?: number
}> = ({ videoName, videoUrl, width, height }) => {
  const plyrSource: PlyrJS.SourceInfo = {
    type: 'video',
    title: videoName,
    sources: [{ src: videoUrl }],
    poster: videoUrl.replace(/mp4/g, 'jpg'),
    // 字幕功能被移除，不再需要 tracks 属性
  }

  const plyrOptions: PlyrJS.Options = {
    ratio: `${width ?? 16}:${height ?? 9}`,
    fullscreen: { iosNative: true },
  }

  return <Plyr id="plyr" source={plyrSource} options={plyrOptions} />
}

const VideoPreview: FC<{ file: OdFileObject }> = ({ file }) => {

  return (
    <div>
      <div className="video-js-container" onContextMenu={e => e.preventDefault()}>
        <PlyrComponent
          videoName={file.name}
          videoUrl={file['@microsoft.graph.downloadUrl']}
          width={file.video?.width}
          height={file.video?.height}
        />
      </div>
      <DownloadBtnContainer>
        <DownloadButtonGroup
          directLink={getBaseUrl() + `/api/raw/?path=${file.path}`}
          downloadUrl={file['@microsoft.graph.downloadUrl']}
        />
      </DownloadBtnContainer>
    </div>
  )
}

export default VideoPreview