'use client'

import { useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  message: string
  type?: ToastType
  onClose: () => void
  duration?: number
}

export function Toast({ message, type = 'success', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
    warning: 'bg-yellow-600'
  }

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠'
  }

  return (
    <div
      className={`fixed bottom-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50
                  ${colors[type]} text-white
                  transform transition-all duration-300 ease-in-out
                  animate-slide-up max-w-md`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold" aria-hidden="true">{icons[type]}</span>
        <span className="flex-1">{message}</span>
        <button
          onClick={onClose}
          className="hover:opacity-75 transition-opacity ml-2 text-xl leading-none"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
