import type { Metadata } from 'next'
import { Fira_Sans, Fira_Code } from 'next/font/google'
import './globals.css'
import ClientLayout from '@/components/ClientLayout'

const firaSans = Fira_Sans({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-fira-sans',
  display: 'swap',
})

const firaCode = Fira_Code({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-fira-code',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Movie Dashboard - Anime Collection',
  description: 'Anime dashboard with data management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${firaSans.variable} ${firaCode.variable}`} style={{ margin: 0, display: 'flex' }}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
