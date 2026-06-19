// Formatting helpers for the admin panel.

/** Reference blue-dollar rate (jun-2026). Update when it moves. */
export const REFERENCE_USD_RATE = 1435

const ars = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
})

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

export function formatARS(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—"
  return ars.format(value)
}

export function formatUSD(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—"
  return usd.format(value)
}

export function arsToUsd(valueArs: number, rate = REFERENCE_USD_RATE): number {
  return Math.round(valueArs / rate)
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })
}

/** Whole days from today (local) until the given date. Negative = past. */
export function daysUntil(value: string | null | undefined): number | null {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  const today = new Date()
  const a = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
  const b = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.round((a - b) / 86400000)
}

export interface DueInfo {
  label: string
  color: "gray" | "yellow" | "orange" | "red" | "green"
}

/** Human label + color for a due date (for badges). */
export function dueInfo(value: string | null | undefined): DueInfo | null {
  const days = daysUntil(value)
  if (days === null) return null
  if (days < 0) return { label: `Vencido hace ${Math.abs(days)}d`, color: "red" }
  if (days === 0) return { label: "Vence hoy", color: "red" }
  if (days === 1) return { label: "Vence mañana", color: "orange" }
  if (days <= 7) return { label: `En ${days} días`, color: "orange" }
  if (days <= 30) return { label: `En ${days} días`, color: "yellow" }
  return { label: `En ${days} días`, color: "gray" }
}
