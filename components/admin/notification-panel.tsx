"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Bell, AlertTriangle, CreditCard, CheckSquare2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import { useNotificationsContext } from "@/lib/admin/notifications-context"
import { useAuth } from "@/lib/admin/auth-context"
import type { NotifTipo } from "@/lib/admin/use-notifications"

function NotifIcon({ tipo }: { tipo: NotifTipo }) {
  if (tipo === "vencimiento")
    return <AlertTriangle className="mt-0.5 size-4 shrink-0 text-orange-400" />
  if (tipo === "cobro") return <CreditCard className="mt-0.5 size-4 shrink-0 text-yellow-400" />
  return <CheckSquare2 className="mt-0.5 size-4 shrink-0 text-blue-400" />
}

function relativeTime(date: Date | null): string {
  if (!date) return ""
  try {
    return formatDistanceToNow(date, { addSuffix: true, locale: es })
  } catch {
    return ""
  }
}

export function NotificationPanel({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { notificaciones, loading, unreadCount, markRead, markAllRead } = useNotificationsContext()
  const { user } = useAuth()
  const email = user?.email ?? ""

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-[360px]"
      >
        {/* Header */}
        <SheetHeader className="shrink-0 border-b border-border px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <SheetTitle className="flex items-center gap-2 text-sm font-semibold">
              <Bell className="size-4" />
              Notificaciones
              {unreadCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground"
                onClick={markAllRead}
              >
                Marcar todas leídas
              </Button>
            )}
          </div>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner className="size-5 text-muted-foreground" />
            </div>
          ) : notificaciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Bell className="size-10 text-muted-foreground/20" />
              <p className="mt-3 text-sm font-medium text-muted-foreground">Sin notificaciones</p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Te avisaremos cuando haya novedades
              </p>
            </div>
          ) : (
            <ul>
              {notificaciones.map((n, i) => {
                const isUnread = email ? !n.leidoPor.includes(email) : false

                const inner = (
                  <div
                    className={cn(
                      "flex gap-3 px-4 py-3.5 transition-colors",
                      isUnread
                        ? "bg-secondary/50 hover:bg-secondary/70"
                        : "hover:bg-secondary/20",
                    )}
                    onClick={() => {
                      if (isUnread) markRead(n.id)
                    }}
                  >
                    <NotifIcon tipo={n.tipo} />

                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-sm leading-snug",
                          isUnread ? "font-semibold" : "font-normal text-muted-foreground",
                        )}
                      >
                        {n.titulo}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{n.cuerpo}</p>
                      {n.creadoEn && (
                        <p className="mt-1.5 text-[11px] text-muted-foreground/50">
                          {relativeTime(n.creadoEn)}
                        </p>
                      )}
                    </div>

                    {/* Unread dot */}
                    {isUnread && (
                      <div className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                )

                return (
                  <li
                    key={n.id}
                    className={cn("cursor-pointer", i < notificaciones.length - 1 && "border-b border-border/50")}
                  >
                    {n.href ? (
                      <Link
                        href={n.href}
                        onClick={() => {
                          onOpenChange(false)
                          if (isUnread) markRead(n.id)
                        }}
                      >
                        {inner}
                      </Link>
                    ) : (
                      inner
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
