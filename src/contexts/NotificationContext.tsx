import React, { createContext, useContext, useState, useCallback } from 'react'
import { Box, Portal } from '@mui/material'
import InfoBar from '../components/common/InfoBar'

interface Notification {
  id: string
  title?: string
  message: string
  severity?: 'error' | 'warning' | 'info' | 'success'
  variant?: 'filled' | 'outlined' | 'standard'
  duration?: number // Auto-dismiss after this many milliseconds (0 = no auto-dismiss)
  closable?: boolean
  collapsible?: boolean
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => string
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: React.ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newNotification: Notification = {
      id,
      closable: true,
      duration: 0, // No auto-dismiss by default
      ...notification,
    }

    setNotifications(prev => [...prev, newNotification])

    // Auto-dismiss if duration is set
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id))
      }, newNotification.duration)
    }

    return id
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearAllNotifications,
      }}
    >
      {children}
      
      {/* Notification Container */}
      <Portal>
        <Box
          sx={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 9999,
            maxWidth: 400,
            width: '100%',
            pointerEvents: 'none',
            '& > *': {
              pointerEvents: 'auto',
            },
          }}
        >
          {notifications.map((notification) => (
            <InfoBar
              key={notification.id}
              title={notification.title}
              message={notification.message}
              severity={notification.severity}
              variant={notification.variant}
              closable={notification.closable}
              collapsible={notification.collapsible}
              onClose={() => removeNotification(notification.id)}
              sx={{ mb: 1 }}
            />
          ))}
        </Box>
      </Portal>
    </NotificationContext.Provider>
  )
}