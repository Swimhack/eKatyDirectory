'use client'

import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { SupportedLanguage } from '@/lib/translations'

const languages = [
  { code: 'en' as SupportedLanguage, label: 'EN', name: 'English', flag: '🇺🇸' },
  { code: 'es' as SupportedLanguage, label: 'ES', name: 'Español', flag: '🇲🇽' },
  { code: 'vi' as SupportedLanguage, label: 'VI', name: 'Tiếng Việt', flag: '🇻🇳' },
]

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const changeLanguage = (lang: SupportedLanguage) => {
    if (lang === language) {
      setIsOpen(false)
      return
    }

    setIsAnimating(true)
    setIsOpen(false)
    
    setTimeout(() => {
      setLanguage(lang)
      setIsAnimating(false)
    }, 150)
  }

  const currentLanguage = languages.find(l => l.code === language) || languages[0]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isAnimating}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 ${
          isAnimating ? 'scale-95 opacity-70' : 'scale-100 opacity-100'
        }`}
        title={`Current: ${currentLanguage.name}`}
      >
        <span className={`text-lg transition-transform duration-200 ${isAnimating ? 'rotate-180' : 'rotate-0'}`}>
          {currentLanguage.flag}
        </span>
        <span className="text-sm font-medium text-gray-700">
          {currentLanguage.label}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                lang.code === language ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
              }`}
            >
              <span className="text-xl">{lang.flag}</span>
              <div className="flex-1">
                <div className="text-sm font-medium">{lang.name}</div>
                <div className="text-xs text-gray-500">{lang.label}</div>
              </div>
              {lang.code === language && (
                <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
