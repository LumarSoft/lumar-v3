"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { useCollection } from "@/lib/admin/use-collection"
import { formatARS } from "@/lib/admin/format"

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

interface DayMark {
  label: string
  amount?: number
  tone: "client" | "pending" | "paid" | "overdue"
}

const TONE_CLASS: Record<DayMark["tone"], string> = {
  client: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  pending: "bg-yellow-500/15 text-yellow-200 border-yellow-500/30",
  paid: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  overdue: "bg-red-500/15 text-red-300 border-red-500/30",
}

function toNum(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export function PaymentsCalendar() {
  const clientes = useCollection("clientes")
  const vencimientos = useCollection("vencimientos")
  const [view, setView] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })

  const loading = clientes.loading || vencimientos.loading

  const { weeks, monthMarks } = useMemo(() => {
    const { year, month } = view
    const first = new Date(year, month, 1)
    // Monday-based offset.
    const startOffset = (first.getDay() + 6) % 7
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const marks: Record<number, DayMark[]> = {}
    const push = (day: number, mark: DayMark) => {
      if (day < 1 || day > daysInMonth) return
      ;(marks[day] ??= []).push(mark)
    }

    // Cobros recurrentes esperados de clientes (por día de cobro).
    for (const c of clientes.data) {
      const day = toNum(c.diaCobro)
      const monto = toNum(c.montoMensual)
      if (day >= 1 && day <= 31 && (c.tipo ? c.tipo === "Recurrente" : monto > 0)) {
        push(day, { label: String(c.cliente ?? "Cliente"), amount: monto, tone: "client" })
      }
    }

    // Vencimientos con fecha en el mes visible.
    for (const v of vencimientos.data) {
      if (!v.vencimiento) continue
      const d = new Date(String(v.vencimiento))
      if (Number.isNaN(d.getTime())) continue
      if (d.getFullYear() !== year || d.getMonth() !== month) continue
      const tone: DayMark["tone"] =
        v.estado === "Pagado" ? "paid" : v.estado === "Vencido" ? "overdue" : "pending"
      push(d.getDate(), { label: String(v.concepto ?? "Vencimiento"), amount: toNum(v.monto), tone })
    }

    // Build week rows.
    const cells: (number | null)[] = []
    for (let i = 0; i < startOffset; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    while (cells.length % 7 !== 0) cells.push(null)
    const rows: (number | null)[][] = []
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))

    return { weeks: rows, monthMarks: marks }
  }, [view, clientes.data, vencimientos.data])

  const today = new Date()
  const isToday = (d: number | null) =>
    d != null &&
    today.getDate() === d &&
    today.getMonth() === view.month &&
    today.getFullYear() === view.year

  function shift(delta: number) {
    setView((v) => {
      const m = v.month + delta
      return { year: v.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Calendario de pagos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cobros recurrentes esperados y vencimientos del mes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => shift(-1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-40 text-center text-sm font-medium">
            {MONTHS[view.month]} {view.year}
          </span>
          <Button variant="ghost" size="icon" onClick={() => shift(1)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className={cn("size-2.5 rounded-full border", TONE_CLASS.client)} /> Cobro recurrente
        </span>
        <span className="flex items-center gap-1.5">
          <span className={cn("size-2.5 rounded-full border", TONE_CLASS.pending)} /> Vto. pendiente
        </span>
        <span className="flex items-center gap-1.5">
          <span className={cn("size-2.5 rounded-full border", TONE_CLASS.paid)} /> Pagado
        </span>
        <span className="flex items-center gap-1.5">
          <span className={cn("size-2.5 rounded-full border", TONE_CLASS.overdue)} /> Vencido
        </span>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-3 sm:p-4">
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner className="size-5 text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1.5">
              {WEEKDAYS.map((w) => (
                <div key={w} className="px-1 pb-1 text-center text-xs font-medium text-muted-foreground">
                  {w}
                </div>
              ))}
              {weeks.flat().map((day, i) => (
                <div
                  key={i}
                  className={cn(
                    "min-h-20 rounded-lg border p-1.5",
                    day == null
                      ? "border-transparent"
                      : "border-border/60 bg-card/30",
                    isToday(day) && "ring-1 ring-brand",
                  )}
                >
                  {day != null ? (
                    <>
                      <div className="mb-1 text-right text-xs text-muted-foreground">{day}</div>
                      <div className="flex flex-col gap-1">
                        {(monthMarks[day] ?? []).slice(0, 3).map((m, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "truncate rounded border px-1 py-0.5 text-[10px] leading-tight",
                              TONE_CLASS[m.tone],
                            )}
                            title={`${m.label}${m.amount ? " · " + formatARS(m.amount) : ""}`}
                          >
                            {m.label}
                          </div>
                        ))}
                        {(monthMarks[day]?.length ?? 0) > 3 ? (
                          <span className="px-1 text-[10px] text-muted-foreground">
                            +{(monthMarks[day]?.length ?? 0) - 3} más
                          </span>
                        ) : null}
                      </div>
                    </>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
