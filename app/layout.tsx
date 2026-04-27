import type { Metadata } from 'next'
import { Playfair_Display } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'LC Orga · EBS Law Congress',
  description: 'Task Management für den EBS Law Congress',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={playfair.variable}>
      <body className="font-sans text-lc-ink min-h-screen bg-lc-cream">
        {children}
      </body>
    </html>
  )
}
