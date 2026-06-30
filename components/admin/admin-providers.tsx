"use client";

import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/lib/admin/auth-context";
import { AdminShell } from "@/components/admin/admin-shell";
import { LoginScreen } from "@/components/admin/login-screen";
import { Spinner } from "@/components/ui/spinner";
import { NotificationsProvider } from "@/lib/admin/notifications-context";

function Gate({ children }: { children: ReactNode }) {
  const { loading, allowed } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    );
  }

  if (!allowed) return <LoginScreen />;

  return (
    <NotificationsProvider>
      <AdminShell>{children}</AdminShell>
    </NotificationsProvider>
  );
}

export function AdminProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Gate>{children}</Gate>
      <Toaster richColors position="top-right" />
    </AuthProvider>
  );
}
