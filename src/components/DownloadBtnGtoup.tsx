import { FC } from 'react'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTranslation } from 'next-i18next'

import { useClipboard } from '../utils/useClipboard' // <--- 导入我们自己的 Hook

const DownloadButton: FC<{
  onClick: () => void
  btnColor: string
  btnText: string
  btnIcon: string
  btnTitle?: string
}> = ({ onClick, btnColor, btnText, btnIcon, btnTitle }) => {
  return (
    <button
      className={`flex items-center space-x-2 rounded-lg border border-gray-500/50 px-4 py-2 text-sm font-medium text-gray-900 transition-all duration-75 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800 dark:focus:ring-gray-700 ${btnColor}`}
      onClick={onClick}
      title={btnTitle}
    >
      <FontAwesomeIcon icon={['fas', btnIcon as any]} />
      <span>{btnText}</span>
    </button>
  )
}

const DownloadButtonGroup: FC<{
  directLink?: string
  downloadUrl?: string
}> = ({ directLink, downloadUrl }) => {
  const { t } = useTranslation()
  const { copy, status } = useClipboard() // <--- 使用我们自己的 Hook

  const handleCopy = (text: string | undefined, message: string) => {
    if (!text) return;
    copy(text) // <--- 调用我们自己的 copy 函数
    toast.success(message)
  }

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {directLink && (
        <DownloadButton
          onClick={() => handleCopy(directLink, t('Copied direct link to clipboard.'))}
          btnColor="hover:bg-yellow-100 dark:hover:bg-yellow-600/50"
          btnText={t('Copy direct link')}
          btnIcon="copy"
        />
      )}
      {downloadUrl && (
        <DownloadButton
          onClick={() => window.open(downloadUrl)}
          btnColor="hover:bg-blue-100 dark:hover:bg-blue-600/50"
          btnText={t('Download')}
          btnIcon="download"
        />
      )}
    </div>
  )
}

export default DownloadButtonGroup