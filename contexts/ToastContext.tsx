'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Toast, ToastType } from '@/components/Toast'

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: ToastType; duration: number }>>([])
  const [nextId, setNextId] = useState(0)

  const showToast = useCallback((message: string, type: ToastType = 'success', duration: number = 3000) => {
    const id = nextId
    setNextId(prev => prev + 1)
    setToasts(prev => [...prev, { id, message, type, duration }])
  }, [nextId])

  const success = useCallback((message: string, duration?: number) => {
    showToast(message, 'success', duration)
  }, [showToast])

  const error = useCallback((message: string, duration?: number) => {
    showToast(message, 'error', duration)
  }, [showToast])

  const info = useCallback((message: string, duration?: number) => {
    showToast(message, 'info', duration)
  }, [showToast])

  const warning = useCallback((message: string, duration?: number) => {
    showToast(message, 'warning', duration)
  }, [showToast])

  const closeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => closeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
