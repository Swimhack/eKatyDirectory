'use client'

import { useState, useEffect } from 'react'

export default function LanguageSwitcher() {
  const [isSpanish, setIsSpanish] = useState(false)

  useEffect(() => {
    // Load language preference from localStorage
    const savedLang = localStorage.getItem('ekaty_language')
    setIsSpanish(savedLang === 'es')
  }, [])

  const toggleLanguage = () => {
    const newLang = !isSpanish
    setIsSpanish(newLang)
    localStorage.setItem('ekaty_language', newLang ? 'es' : 'en')
    
    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('languageChange', { 
      detail: { language: newLang ? 'es' : 'en' } 
    }))
    
    // Reload page to apply translations
    window.location.reload()
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      title={isSpanish ? 'Switch to English' : 'Cambiar a Español'}
    >
      <span className="text-lg">🌐</span>
      <span className="text-sm font-medium text-gray-700">
        {isSpanish ? 'ES' : 'EN'}
      </span>
    </button>
  )
}
