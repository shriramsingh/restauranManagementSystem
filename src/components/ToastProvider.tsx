'use client'

import { Toaster } from '@/lib/sonner-shim'

export default function ToastProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </>
  )
}
