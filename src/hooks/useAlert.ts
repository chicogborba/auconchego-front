import { useState } from 'react'

interface AlertState {
  isOpen: boolean
  title: string
  message: string
  type: 'info' | 'success' | 'error' | 'warning'
  onConfirm?: () => void
}

export function useAlert() {
  const [alert, setAlert] = useState<AlertState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  })

  const showAlert = (
    title: string,
    message: string,
    type: 'info' | 'success' | 'error' | 'warning' = 'info',
    onConfirm?: () => void
  ) => {
    setAlert({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
    })
  }

  const closeAlert = () => {
    setAlert((prev) => ({ ...prev, isOpen: false }))
  }

  return {
    alert,
    showAlert,
    closeAlert,
  }
}

