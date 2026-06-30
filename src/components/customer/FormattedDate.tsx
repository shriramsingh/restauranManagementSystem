'use client'

import { useState, useEffect } from 'react'

interface FormattedDateProps {
  date: string | Date
}

export default function FormattedDate({ date }: FormattedDateProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return <>{new Date(date).toLocaleString()}</>
}