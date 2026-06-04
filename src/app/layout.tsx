import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '短视频脚本审核工具',
  description: '专业审核 · 精准定位 · 高效优化',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
