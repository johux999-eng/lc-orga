import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'LC Orga · EBS Law Congress',
  description: 'Task Management für den EBS Law Congress',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={dmSans.variable}>
      <body className="font-sans text-slate-100 min-h-screen bg-[#080a12]">
        {children}
      </body>
    </html>
  )
}
