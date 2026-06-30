"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotificationsContext } from "@/lib/admin/notifications-context";
import { NotificationPanel } from "@/components/admin/notification-panel";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { unreadCount } = useNotificationsContext();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen(true)}
        title="Notificaciones"
        aria-label="Abrir bandeja de notificaciones"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 animate-in zoom-in-50 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground"
            aria-label={`${unreadCount} notificaciones sin leer`}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>
      <NotificationPanel open={open} onOpenChange={setOpen} />
    </>
  );
}
