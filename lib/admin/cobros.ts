import { nextMonthlyDate } from "@/lib/admin/format"

/** Recurrente "activo" = la cuenta que avanza mes a mes (no una instancia ya pagada). */
export function isRecurrente(c: Record<string, unknown>): boolean {
  return c.categoria === "Recurrente mensual" && !c.esInstancia
}

/** Registro histórico de un pago recurrente ya cobrado. */
export function isInstancia(c: Record<string, unknown>): boolean {
  return Boolean(c.esInstancia)
}

/** Clave de mes "YYYY-MM". */
export function monthKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

/** Período actual que se está facturando de un recurrente ("YYYY-MM"). */
export function cobroPeriodo(c: Record<string, unknown>): string {
  return c.periodo ? String(c.periodo) : monthKey()
}

/** Mes siguiente de un período "YYYY-MM". */
export function nextPeriodo(periodo: string): string {
  const [y, m] = periodo.split("-").map(Number)
  const d = new Date(y, m, 1) // m (1-based) como índice 0-based = mes siguiente
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

/** Fecha (YYYY-MM-DD) del día de cobro dentro de un período. */
export function periodoDate(periodo: string, day: number): string {
  const [y, m] = periodo.split("-").map(Number)
  const last = new Date(y, m, 0).getDate() // último día del mes m (1-based)
  const d = Math.min(day, last)
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

/**
 * Fecha efectiva de un cobro:
 * - Puntual o instancia: su vencimiento.
 * - Recurrente activo: el día de cobro dentro de su período (o la próxima ocurrencia si no tiene período).
 */
export function cobroDueDate(c: Record<string, unknown>): string {
  if (c.vencimiento) return String(c.vencimiento)
  if (isRecurrente(c)) {
    const day = Number(c.diaCobro)
    if (!(Number.isFinite(day) && day >= 1 && day <= 31)) return ""
    return c.periodo ? periodoDate(String(c.periodo), day) : nextMonthlyDate(day)
  }
  return ""
}

/**
 * ¿El cobro está saldado?
 * - Recurrente activo: nunca (siempre tiene un período pendiente; el historial son las instancias).
 * - Puntual / instancia: si su estado es Cobrar/Cobrado.
 */
export function cobroPaidForMonth(c: Record<string, unknown>): boolean {
  if (isRecurrente(c)) return false
  return c.estado === "Cobrar" || c.estado === "Cobrado"
}
