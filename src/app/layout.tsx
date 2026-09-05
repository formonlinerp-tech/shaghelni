import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin', 'latin-ext'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'شغّلني - سوق الخدمات المحلية في كركوك',
  description: 'منصة طلب الخدمات المحلية في كركوك. اطلب، قارن العروض، واختر أفضل مقدم خدمة.',
  keywords: ['كركوك', 'خدمات', 'كهربائي', 'سباك', 'مكيف', 'صيانة', 'منزل', 'صيانة سيارات'],
  authors: [{ name: 'شغّلني' }],
  creator: 'شغّلني',
  publisher: 'شغّلني',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'ar_IQ',
    url: 'https://shaghelni.com',
    title: 'شغّلني - سوق الخدمات المحلية في كركوك',
    description: 'منصة طلب الخدمات المحلية في كركوك. اطلب، قارن العروض، واختر أفضل مقدم خدمة.',
    siteName: 'شغّلني',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'شغّلني - سوق الخدمات المحلية في كركوك',
    description: 'منصة طلب الخدمات المحلية في كركوك.',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className={`${inter.variable} rtl`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}