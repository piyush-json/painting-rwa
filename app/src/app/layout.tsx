import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '../providers/providers'
import { DataAccessProvider } from '../providers/data-access-provider'
import { Header } from '../components/header'
import { Footer } from '../components/footer'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'ArtShare - Fractional Art Investment Platform',
  description:
    'Invest in high-value artworks through fractional ownership on Solana'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <DataAccessProvider>
            <div className='min-h-screen flex flex-col'>
              <Header />
              <main className='flex-1'>{children}</main>
              <Footer />
            </div>
          </DataAccessProvider>
        </Providers>
      </body>
    </html>
  )
}
