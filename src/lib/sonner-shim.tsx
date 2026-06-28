// Shim for 'sonner' — remove this file and run:
//   npm install sonner
// after which you can replace imports from '@/lib/sonner-shim' with 'sonner'

'use client'

import React, { useState, useEffect, useCallback } from 'react'

let globalAddToast: ((msg: string, type: string) => void) | null = null

export const toast = {
  success: (message: string) => globalAddToast?.(message, 'success'),
  error: (message: string) => globalAddToast?.(message, 'error'),
  info: (message: string) => globalAddToast?.(message, 'info'),
  default: (message: string) => globalAddToast?.(message, 'default'),
}

export function Toaster({ position, richColors, closeButton }: any) {
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: string }[]>([])

  const addToast = useCallback((msg: string, type: string) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, msg, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  useEffect(() => {
    globalAddToast = addToast
    return () => { globalAddToast = null }
  }, [addToast])

  const posClass =
    position === 'top-right'
      ? 'top-4 right-4'
      : position === 'top-left'
      ? 'top-4 left-4'
      : position === 'bottom-right'
      ? 'bottom-4 right-4'
      : 'bottom-4 left-4'

  return (
    <div className={`fixed ${posClass} z-[9999] space-y-2`}>
      {toasts.map((t) => {
        const bg =
          t.type === 'success'
            ? 'bg-green-600'
            : t.type === 'error'
            ? 'bg-red-600'
            : t.type === 'info'
            ? 'bg-blue-600'
            : 'bg-gray-800'
        return (
          <div
            key={t.id}
            className={`${bg} text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-right`}
          >
            {t.msg}
            {closeButton && (
              <button
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                className="ml-2 opacity-70 hover:opacity-100"
              >
                ✕
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default { toast, Toaster }
