'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, SupportedLanguage } from '@/lib/translations'

interface LanguageContextType {
  language: SupportedLanguage
  setLanguage: (lang: SupportedLanguage) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>('en')

  useEffect(() => {
    // Load saved language preference
    const savedLang = localStorage.getItem('ekaty_language') as SupportedLanguage
    if (savedLang && ['en', 'es', 'vi'].includes(savedLang)) {
      setLanguageState(savedLang)
    }
  }, [])

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang)
    localStorage.setItem('ekaty_language', lang)
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('languageChange', { 
      detail: { language: lang } 
    }))
  }

  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = translations[language]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    return value || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
