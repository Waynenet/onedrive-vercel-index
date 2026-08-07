import { useEffect, useState } from 'react'

import config from '../../config/site.config'

// 兼容旧的 document.write 写法与 %YEAR% 占位符两种页脚配置
const yearPlaceholder = /<script>[\s\S]*?document\.write[\s\S]*?<\/script>/i

const Footer = () => {
  const [year, setYear] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setYear(String(new Date().getFullYear()))
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  const html = config.footer.replace(yearPlaceholder, year).replace('%YEAR%', year)

  return (
    <div
      className="w-full border-t border-gray-900/10 p-4 text-center text-xs font-medium text-gray-400 dark:border-gray-500/30"
      dangerouslySetInnerHTML={{ __html: html }}
    ></div>
  )
}

export default Footer
