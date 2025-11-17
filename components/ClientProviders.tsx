'use client'

import { LanguageProvider } from '@/contexts/LanguageContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { ReactNode } from 'react'

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </ToastProvider>
  )
}
