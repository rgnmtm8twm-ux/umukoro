import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const host = (await headers()).get('host') ?? 'umukoro.io'
  return {
    metadataBase: new URL(`https://${host}`),
    title: 'Umukoro — Rwanda Assessment Platform',
    description:
      "Practice exams, timed assessments, and instant feedback for Rwandan students. Built for PLE, O'Level, and A'Level preparation.",
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakartaSans.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}
