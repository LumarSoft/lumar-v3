import { nextMonthlyDate } from "@/lib/admin/format"

/**
 * Fecha efectiva de un cobro:
 * - Puntual (Fijo desarrollo): su vencimiento.
 * - Recurrente mensual: la próxima ocurrencia de su día de cobro.
 */
export function cobroDueDate(c: Record<string, unknown>): string {
  if (c.vencimiento) return String(c.vencimiento)
  const day = Number(c.diaCobro)
  if (Number.isFinite(day) && day >= 1 && day <= 31) return nextMonthlyDate(day)
  return ""
}

export function isRecurrente(c: Record<string, unknown>): boolean {
  return c.categoria === "Recurrente mensual"
}

/** Clave de mes "YYYY-MM". */
export function monthKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

/**
 * ¿El cobro está saldado para el período relevante?
 * - Recurrente: si el mes (mk) está en su array pagadoMeses.
 * - Puntual: si su estado es Cobrar/Cobrado.
 */
export function cobroPaidForMonth(c: Record<string, unknown>, mk: string = monthKey()): boolean {
  if (isRecurrente(c)) {
    return Array.isArray(c.pagadoMeses) && (c.pagadoMeses as string[]).includes(mk)
  }
  return c.estado === "Cobrar" || c.estado === "Cobrado"
}
