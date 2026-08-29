import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

type Toast = { id: string; type: 'success' | 'error' | 'info'; message: string }

type ToastContextValue = {
  show: (toast: Omit<Toast, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = String(Date.now())
    setToasts((t) => [...t, { ...toast, id }])
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
    }, 3200)
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div style={{ position: 'fixed', right: 18, bottom: 18, zIndex: 9999 }}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 18, y: 6 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.28 }}
            style={{
              minWidth: 220,
              marginTop: 8,
              padding: '12px 14px',
              borderRadius: 8,
              color: '#fff',
              background: t.type === 'success' ? '#16a34a' : t.type === 'error' ? '#dc2626' : '#2563eb',
              boxShadow: '0 10px 30px rgba(16,40,60,0.12)',
            }}
          >
            {t.message}
          </motion.div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}

export default ToastProvider
