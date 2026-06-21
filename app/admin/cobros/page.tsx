"use client"

import { useMemo } from "react"
import { toast } from "sonner"
import { CrudSection, type ExtraColumn } from "@/components/admin/crud-section"
import { Button } from "@/components/ui/button"
import { COBROS_SCHEMA } from "@/lib/admin/schemas"
import {
  cobroDueDate,
  cobroPaidForMonth,
  cobroPeriodo,
  isRecurrente,
  nextPeriodo,
  periodoDate,
} from "@/lib/admin/cobros"
import { daysUntil } from "@/lib/admin/format"
import { useCollection, type DocRecord } from "@/lib/admin/use-collection"

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
function labelMes(periodo: string): string {
  const [y, m] = periodo.split("-").map(Number)
  return `${MESES[m - 1]} ${y}`
}
function hoyISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

// Saldados al fondo; el resto, lo que vence más pronto arriba.
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
  const clientes = useCollection("clientes")

  async function cobrarMes(row: DocRecord) {
    const periodo = cobroPeriodo(row)
    const dia = Number(row.diaCobro) || 1
    try {
      // 1) Registro real del pago de ese mes (asiento histórico).
      await cobros.add({
        concepto: `${String(row.concepto ?? "Cobro")} (${labelMes(periodo)})`,
        categoria: "Recurrente mensual",
        esInstancia: true,
        cliente: row.cliente ?? null,
        monto: row.monto ?? null,
        estado: "Cobrar",
        vencimiento: periodoDate(periodo, dia),
        periodoPagado: periodo,
        fechaCobro: hoyISO(),
        metodo: row.metodo ?? null,
      })
      // 2) La cuenta recurrente avanza al mes siguiente.
      await cobros.update(row.id, { periodo: nextPeriodo(periodo) })
      toast.success(`Cobrado ${labelMes(periodo)}. Próximo: ${labelMes(nextPeriodo(periodo))}.`)
      // 3) Aviso de aumento si la revisión del cliente ya venció.
      const cli = clientes.data.find((c) => c.cliente === row.cliente)
      if (cli?.proximaRevision) {
        const d = daysUntil(String(cli.proximaRevision))
        if (d !== null && d <= 0) {
          toast.warning(`Revisá el monto de ${String(row.cliente)} por inflación — puede corresponder aumento.`)
        }
      }
    } catch {
      toast.error("No se pudo registrar el cobro")
    }
  }

  const extraColumns = useMemo<ExtraColumn[]>(
    () => [
      {
        key: "esteMes",
        label: "Cobro del mes",
        render: (row: DocRecord) => {
          if (!isRecurrente(row)) {
            return row.esInstancia ? (
              <span className="text-xs text-emerald-400">pago registrado</span>
            ) : (
              <span className="text-muted-foreground">—</span>
            )
          }
          const periodo = cobroPeriodo(row)
          const count = cobros.data.filter((c) => c.esInstancia && c.cliente === row.cliente).length
          return (
            <div className="flex items-center gap-2 whitespace-nowrap">
              <Button size="sm" className="h-7 text-xs" onClick={() => cobrarMes(row)}>
                Cobrar {labelMes(periodo)}
              </Button>
              {count > 0 ? <span className="text-xs text-muted-foreground">✓ {count}</span> : null}
            </div>
          )
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cobros.data, clientes.data],
  )

  return <CrudSection schema={COBROS_SCHEMA} extraColumns={extraColumns} sortRows={sortCobros} />
}
