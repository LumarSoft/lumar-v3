import type { ReactNode } from "react"
import type { Metadata } from "next"
import { AdminProviders } from "@/components/admin/admin-providers"

// The admin panel reads/writes live data per-user, never prerender it.
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Panel interno · LumarSoft",
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminProviders>{children}</AdminProviders>
}
