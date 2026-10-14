import { useState, useCallback } from 'react'

export default function useToast() {
  const [toast, setToast] = useState({ message: '', type: 'success' })

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
  }, [])

  const clearToast = useCallback(() => {
    setToast({ message: '', type: 'success' })
  }, [])

  return { toast, showToast, clearToast }
}
