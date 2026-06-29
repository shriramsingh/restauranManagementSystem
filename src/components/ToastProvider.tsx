'use client'

import { Toaster } from 'sonner'

export default function ToastProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </>
  )
}
