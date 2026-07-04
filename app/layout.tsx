import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Baloo_2, Nunito } from 'next/font/google'
import { StoreProvider } from '@/lib/store'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: ['400', '600', '700', '800'],
})

const baloo = Baloo_2({
  subsets: ['latin'],
  variable: '--font-baloo',
  weight: ['500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'Trilha+ | O Duolingo da vida escolar',
  description:
    'App gamificado de aprendizado e engajamento para a rede municipal de ensino de Caraguatatuba. Trilhas, XP, streaks, squads e recompensas.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#58cc02',
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${nunito.variable} ${baloo.variable} bg-background`}>
      <body className="antialiased">
        <StoreProvider>{children}</StoreProvider>
        <Toaster position="top-center" richColors />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
