"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"
import { useNotifications, type Notificacion } from "@/lib/admin/use-notifications"
import { useAuth } from "@/lib/admin/auth-context"

interface NotificationsContextValue {
  notificaciones: Notificacion[]
  loading: boolean
  unreadCount: number
  existingIds: Set<string>
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { notificaciones, loading, unreadCount, markRead, markAllRead } = useNotifications(
    user?.email,
  )

  // Pre-compute set of existing IDs so callers can cheaply check before creating
  const existingIds = useMemo(() => new Set(notificaciones.map((n) => n.id)), [notificaciones])

  const value: NotificationsContextValue = {
    notificaciones,
    loading,
    unreadCount,
    existingIds,
    markRead,
    markAllRead,
  }

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export function useNotificationsContext(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error("useNotificationsContext must be used within NotificationsProvider")
  return ctx
}
