"use client"

import { useMemo } from "react"
import { toast } from "sonner"
import { Check } from "lucide-react"
import { CrudSection, type ExtraColumn } from "@/components/admin/crud-section"
import { Button } from "@/components/ui/button"
import { COBROS_SCHEMA } from "@/lib/admin/schemas"
import { cobroDueDate, cobroPaidForMonth, isRecurrente, monthKey } from "@/lib/admin/cobros"
import { daysUntil } from "@/lib/admin/format"
import { useCollection, type DocRecord } from "@/lib/admin/use-collection"

// Cobrados al fondo; el resto, lo que vence más pronto arriba.
// Para recurrentes, "cobrado" = el mes actual está saldado.
function sortCobros(a: DocRecord, b: DocRecord): number {
  const aDone = cobroPaidForMonth(a) ? 1 : 0
  const bDone = cobroPaidForMonth(b) ? 1 : 0
  if (aDone !== bDone) return aDone - bDone
  const da = daysUntil(cobroDueDate(a)) ?? 99999
  const db = daysUntil(cobroDueDate(b)) ?? 99999
  return da - db
}

export default function CobrosPage() {
  const cobros = useCollection("cobros")

  async function toggleMonth(row: DocRecord) {
    const mk = monthKey()
    const arr = Array.isArray(row.pagadoMeses) ? [...(row.pagadoMeses as string[])] : []
    const next = arr.includes(mk) ? arr.filter((m) => m !== mk) : [...arr, mk]
    try {
      await cobros.update(row.id, { pagadoMeses: next })
      toast.success(arr.includes(mk) ? "Marcado pendiente" : "Cobrado este mes")
    } catch {
      toast.error("No se pudo actualizar")
    }
  }

  const extraColumns = useMemo<ExtraColumn[]>(
    () => [
      {
        key: "esteMes",
        label: "Este mes",
        render: (row: DocRecord) => {
          if (!isRecurrente(row)) return <span className="text-muted-foreground">—</span>
          const paid = cobroPaidForMonth(row)
          return (
            <Button
              size="sm"
              variant={paid ? "secondary" : "default"}
              className="h-7 text-xs"
              onClick={() => toggleMonth(row)}
            >
              {paid ? (
                <>
                  <Check className="size-3.5" /> Cobrado
                </>
              ) : (
                "Cobrar este mes"
              )}
            </Button>
          )
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return <CrudSection schema={COBROS_SCHEMA} extraColumns={extraColumns} sortRows={sortCobros} />
}
