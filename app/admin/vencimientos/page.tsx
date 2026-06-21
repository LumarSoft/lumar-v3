"use client"

import { CrudSection } from "@/components/admin/crud-section"
import { VENCIMIENTOS_SCHEMA } from "@/lib/admin/schemas"
import { daysUntil } from "@/lib/admin/format"
import type { DocRecord } from "@/lib/admin/use-collection"

// Pagados al fondo; el resto, lo que vence más pronto arriba.
// Reconoce el valor nuevo ("Pagar") y el viejo ("Pagado") por si quedan datos previos.
const isPagado = (estado: unknown) => estado === "Pagar" || estado === "Pagado"
function sortVencimientos(a: DocRecord, b: DocRecord): number {
  const aDone = isPagado(a.estado) ? 1 : 0
  const bDone = isPagado(b.estado) ? 1 : 0
  if (aDone !== bDone) return aDone - bDone
  const da = daysUntil(a.vencimiento ? String(a.vencimiento) : "") ?? 99999
  const db = daysUntil(b.vencimiento ? String(b.vencimiento) : "") ?? 99999
  return da - db
}

export default function VencimientosPage() {
  return <CrudSection schema={VENCIMIENTOS_SCHEMA} sortRows={sortVencimientos} />
}
