// src/pages/_app.tsx
import { appWithTranslation } from 'next-i18next'
import { Toaster } from 'react-hot-toast'
import type { AppProps } from 'next/app'
import NextNProgress from 'nextjs-progressbar'
import { useEffect } from 'react' // 需要导入 useEffect

import { useSystemTheme } from '../utils/useSystemTheme' // 导入我们自己的 Hook

import '../styles/globals.css'
import '../styles/prism-onedark.css'

import { Analytics } from '@vercel/analytics/react'

function MyApp({ Component, pageProps }: AppProps) {
  const theme = useSystemTheme()

  // 这个 useEffect 负责将主题 class 应用到 HTML 根元素
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  return (
    <>
      <NextNProgress color="#2563EB" height={2} options={{ showSpinner: false }} />
      <Toaster />
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}

export default appWithTranslation(MyApp)