"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useCollection } from "@/lib/admin/use-collection"
import { formatARS, formatDate } from "@/lib/admin/format"
import { useNotificationsContext } from "@/lib/admin/notifications-context"
import { ensureNotification } from "@/lib/admin/use-notifications"

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

type Tone = "recurrente" | "pendiente" | "pagado" | "vencido" | "tarea" | "evento"

interface DayMark {
  label: string
  amount?: number
  tone: Tone
  /** Si es un evento creado a mano, su id (para poder editarlo). */
  eventId?: string
}

const TONE_CLASS: Record<Tone, string> = {
  recurrente: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  pendiente: "bg-yellow-500/15 text-yellow-200 border-yellow-500/30",
  pagado: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  vencido: "bg-red-500/15 text-red-300 border-red-500/30",
  tarea: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  evento: "bg-teal-500/15 text-teal-300 border-teal-500/30",
}

function toNum(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function estadoTone(estado: unknown): Tone {
  return estado === "Pagar" || estado === "Cobrar" ? "pagado" : estado === "Vencido" ? "vencido" : "pendiente"
}

export function PaymentsCalendar() {
  const cobros = useCollection("cobros")
  const vencimientos = useCollection("vencimientos")
  const tareas = useCollection("tareas")
  const eventos = useCollection("eventos")
  const { existingIds } = useNotificationsContext()

  const [view, setView] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })

  // Dialog de evento puntual
  const [eventOpen, setEventOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [evForm, setEvForm] = useState({ fecha: "", titulo: "", hora: "", notas: "" })
  const [saving, setSaving] = useState(false)

  const loading = cobros.loading || vencimientos.loading || tareas.loading || eventos.loading

  const { weeks, monthMarks } = useMemo(() => {
    const { year, month } = view
    const first = new Date(year, month, 1)
    const startOffset = (first.getDay() + 6) % 7
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const marks: Record<number, DayMark[]> = {}
    const push = (day: number, mark: DayMark) => {
      if (day < 1 || day > daysInMonth) return
      ;(marks[day] ??= []).push(mark)
    }
    const dayInView = (dateStr: unknown): number | null => {
      if (!dateStr) return null
      const d = new Date(String(dateStr))
      if (Number.isNaN(d.getTime())) return null
      if (d.getFullYear() !== year || d.getMonth() !== month) return null
      return d.getDate()
    }

    // Cobros: puntuales por vencimiento; recurrentes por día de cobro (cada mes).
    for (const c of cobros.data) {
      let day = dayInView(c.vencimiento)
      if (!day) {
        const dc = Number(c.diaCobro)
        if (Number.isFinite(dc) && dc >= 1 && dc <= 31) day = Math.min(dc, daysInMonth)
      }
      if (day) push(day, { label: String(c.concepto ?? c.cliente ?? "Cobro"), amount: toNum(c.monto), tone: estadoTone(c.estado) })
    }
    // Vencimientos propios.
    for (const v of vencimientos.data) {
      const day = dayInView(v.vencimiento)
      if (day) push(day, { label: String(v.concepto ?? "Vencimiento"), amount: toNum(v.monto), tone: estadoTone(v.estado) })
    }
    // Tareas con fecha.
    for (const t of tareas.data) {
      const day = dayInView(t.vence)
      if (day) push(day, { label: `📋 ${String(t.tarea ?? "Tarea")}`, tone: "tarea" })
    }
    // Eventos puntuales (editables).
    for (const e of eventos.data) {
      const day = dayInView(e.fecha)
      if (day) push(day, { label: `${e.hora ? String(e.hora) + " " : ""}${String(e.titulo ?? "Evento")}`, tone: "evento", eventId: String(e.id) })
    }

    const cells: (number | null)[] = []
    for (let i = 0; i < startOffset; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    while (cells.length % 7 !== 0) cells.push(null)
    const rows: (number | null)[][] = []
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))

    return { weeks: rows, monthMarks: marks }
  }, [view, cobros.data, vencimientos.data, tareas.data, eventos.data])

  const today = new Date()
  const isToday = (d: number | null) =>
    d != null && today.getDate() === d && today.getMonth() === view.month && today.getFullYear() === view.year

  function shift(delta: number) {
    setView((v) => {
      const m = v.month + delta
      return { year: v.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 }
    })
  }

  function openEvent(day?: number) {
    const fecha = day
      ? `${view.year}-${String(view.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      : ""
    setEditingId(null)
    setEvForm({ fecha, titulo: "", hora: "", notas: "" })
    setEventOpen(true)
  }

  function openEditEvent(eventId: string) {
    const ev = eventos.data.find((e) => e.id === eventId)
    if (!ev) return
    setEditingId(eventId)
    setEvForm({
      fecha: String(ev.fecha ?? ""),
      titulo: String(ev.titulo ?? ""),
      hora: ev.hora ? String(ev.hora) : "",
      notas: ev.notas ? String(ev.notas) : "",
    })
    setEventOpen(true)
  }

  async function saveEvent() {
    if (!evForm.titulo.trim() || !evForm.fecha) {
      toast.error("Falta título y fecha")
      return
    }
    setSaving(true)
    try {
      const payload = {
        titulo: evForm.titulo.trim(),
        fecha: evForm.fecha,
        hora: evForm.hora || null,
        notas: evForm.notas || null,
      }
      if (editingId) {
        await eventos.update(editingId, payload)
        toast.success("Evento actualizado")
      } else {
        const ref = await eventos.add(payload)
        await ensureNotification(`evento_${ref.id}`, existingIds, {
          tipo: "evento",
          titulo: `Evento — ${evForm.titulo.trim()}`,
          cuerpo: `${formatDate(evForm.fecha)}${evForm.hora ? ` · ${evForm.hora}` : ""}`,
          href: "/admin/calendario",
        })
        toast.success("Evento creado")
      }
      setEventOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar el evento")
    } finally {
      setSaving(false)
    }
  }

  async function deleteEvent() {
    if (!editingId) return
    try {
      await eventos.remove(editingId)
      toast.success("Evento eliminado")
      setEventOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Calendario</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cobros, vencimientos, tareas y eventos. Tocá un día para agregar un evento.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => openEvent()}>
            <Plus className="size-4" /> Evento
          </Button>
          <Button variant="ghost" size="icon" onClick={() => shift(-1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-36 text-center text-sm font-medium">
            {MONTHS[view.month]} {view.year}
          </span>
          <Button variant="ghost" size="icon" onClick={() => shift(1)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {(
          [
            ["pendiente", "Pendiente"],
            ["pagado", "Pagado/Cobrado"],
            ["vencido", "Vencido"],
            ["tarea", "Tarea"],
            ["evento", "Evento"],
          ] as [Tone, string][]
        ).map(([tone, label]) => (
          <span key={tone} className="flex items-center gap-1.5">
            <span className={cn("size-2.5 rounded-full border", TONE_CLASS[tone])} /> {label}
          </span>
        ))}
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
                  onClick={() => day != null && openEvent(day)}
                  className={cn(
                    "min-h-20 rounded-lg border p-1.5",
                    day == null ? "border-transparent" : "cursor-pointer border-border/60 bg-card/30 hover:bg-card/60",
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
                            onClick={(e) => {
                              e.stopPropagation()
                              if (m.eventId) openEditEvent(m.eventId)
                            }}
                            className={cn(
                              "truncate rounded border px-1 py-0.5 text-[10px] leading-tight",
                              TONE_CLASS[m.tone],
                              m.eventId && "cursor-pointer hover:brightness-125",
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

      {/* Dialog nuevo evento */}
      <Dialog open={eventOpen} onOpenChange={setEventOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar evento" : "Nuevo evento"}</DialogTitle>
            <DialogDescription className="sr-only">Evento puntual del calendario</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="ev-titulo">Título</Label>
              <Input
                id="ev-titulo"
                value={evForm.titulo}
                placeholder="Ej: Reunión con cliente X"
                onChange={(e) => setEvForm((f) => ({ ...f, titulo: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="ev-fecha">Fecha</Label>
                <Input
                  id="ev-fecha"
                  type="date"
                  value={evForm.fecha}
                  onChange={(e) => setEvForm((f) => ({ ...f, fecha: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ev-hora">Hora</Label>
                <Input
                  id="ev-hora"
                  type="time"
                  value={evForm.hora}
                  onChange={(e) => setEvForm((f) => ({ ...f, hora: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-notas">Notas</Label>
              <Textarea
                id="ev-notas"
                rows={2}
                value={evForm.notas}
                onChange={(e) => setEvForm((f) => ({ ...f, notas: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            {editingId ? (
              <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={deleteEvent}>
                Eliminar
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setEventOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={saveEvent} disabled={saving}>
                {saving ? "Guardando…" : editingId ? "Guardar" : "Crear evento"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
