import { FC, useState } from 'react'
import axios from 'axios'
import Plyr from 'plyr-react'
import type PlyrJS from 'plyr'
import 'plyr-react/dist/plyr.css'
import { useAsync } from 'react-async-hook'
import { useTranslation } from 'next-i18next'

import { getBaseUrl } from '../../utils/getBaseUrl'
import FourOhFour from '../FourOhFour'
import { DownloadBtnContainer } from './Containers'
import DownloadButtonGroup from '../DownloadBtnGtoup'
import { OdFileObject } from '../../types'

const PlyrComponent: FC<{
  videoName: string
  videoUrl: string
  width?: number
  height?: number
  captions?: PlyrJS.Track[]
}> = ({ videoName, videoUrl, width, height, captions }) => {
  const plyrSource: PlyrJS.SourceInfo = {
    type: 'video',
    title: videoName,
    sources: [],
    poster: videoUrl.replace(/mp4/g, 'jpg'),
    tracks: captions,
  }

  const plyrOptions: PlyrJS.Options = {
    ratio: `${width ?? 16}:${height ?? 9}`,
    fullscreen: { iosNative: true },
  }

  if (videoUrl) {
    plyrSource['sources'] = [{ src: videoUrl }]
  }
  return <Plyr id="plyr" source={plyrSource} options={plyrOptions} />
}

const VideoPreview: FC<{ file: OdFileObject }> = ({ file }) => {
  const { t } = useTranslation()

  const {
    loading,
    error,
    result: CCHandler,
  } = useAsync(async () => {
    const { data } = await axios.get(file['@microsoft.graph.downloadUrl'])
    // @ts-ignore - subtitle-conv lacks type definitions
    const { SubtitleConv } = await import('subtitle-conv')
    const handler = new SubtitleConv(data, 'vtt')
    await handler.parse()
    return handler
  }, [file])

  const {
    result: vttURL,
  } = useAsync(async () => {
    if (loading || error || !CCHandler) return
    const vtt = await CCHandler.stringify()
    return URL.createObjectURL(new Blob([vtt], { type: 'text/vtt' }))
  }, [CCHandler])

  if (error) {
    return (
      <div className="dark:bg-gray-900 p-3 text-red-500">
        <FourOhFour errorMsg={t('Failed to load subtitle.')} />
      </div>
    )
  }

  return (
    <div>
      <div className="video-js-container" onContextMenu={e => e.preventDefault()}>
        <PlyrComponent
          videoName={file.name}
          videoUrl={file['@microsoft.graph.downloadUrl']}
          width={file.video?.width}
          height={file.video?.height}
          captions={
            vttURL
              ? [{ kind: 'captions', label: file.name, src: vttURL, default: true }]
              : undefined // 如果没有 vttURL，不传递 tracks 属性
          }
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