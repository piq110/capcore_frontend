import { useNotifications } from '../contexts/NotificationContext'

interface NotificationOptions {
  title?: string
  severity?: 'error' | 'warning' | 'info' | 'success'
  variant?: 'filled' | 'outlined' | 'standard'
  duration?: number
  closable?: boolean
  collapsible?: boolean
}

export const useNotification = () => {
  const { addNotification, removeNotification, clearAllNotifications } = useNotifications()

  const showNotification = (message: string, options: NotificationOptions = {}) => {
    return addNotification({
      message,
      ...options,
    })
  }

  const showSuccess = (message: string, options: Omit<NotificationOptions, 'severity'> = {}) => {
    return showNotification(message, { ...options, severity: 'success' })
  }

  const showError = (message: string, options: Omit<NotificationOptions, 'severity'> = {}) => {
    return showNotification(message, { ...options, severity: 'error' })
  }

  const showWarning = (message: string, options: Omit<NotificationOptions, 'severity'> = {}) => {
    return showNotification(message, { ...options, severity: 'warning' })
  }

  const showInfo = (message: string, options: Omit<NotificationOptions, 'severity'> = {}) => {
    return showNotification(message, { ...options, severity: 'info' })
  }

  return {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
    clearAllNotifications,
  }
}

export default useNotification