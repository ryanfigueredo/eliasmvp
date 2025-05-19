import '../styles/styles.css'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'

import { ReactNode } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Sistema Elias',
  description: 'Plataforma de gestão - White Label',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
