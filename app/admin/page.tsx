"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Users, Receipt, TrendingUp, Target, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MemberAvatar } from "@/components/admin/member-avatar"
import { useCollection } from "@/lib/admin/use-collection"
import { formatARS, formatUSD, formatDate, dueInfo, daysUntil } from "@/lib/admin/format"
import { cobroDueDate, cobroPaidForMonth, cobroPeriodo, isRecurrente } from "@/lib/admin/cobros"
import { OPTION_COLOR_CLASSES } from "@/lib/admin/colors"
import { MEMBERS } from "@/lib/admin/members"
import { todayStr } from "@/lib/admin/activity"
import { useAuth } from "@/lib/admin/auth-context"
import { useDollarRate } from "@/lib/admin/use-dollar"
import { cn } from "@/lib/utils"
import { useNotificationsContext } from "@/lib/admin/notifications-context"
import { ensureNotification } from "@/lib/admin/use-notifications"

const META_USD = 3000
const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

function toNum(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function inMonth(dateStr: unknown, year: number, month: number): boolean {
  if (!dateStr) return false
  const d = new Date(String(dateStr))
  if (Number.isNaN(d.getTime())) return false
  return d.getFullYear() === year && d.getMonth() === month
}

/** Últimos 11 meses + actual + próximo. */
function buildMonthOptions(): { key: string; label: string; year: number; month: number }[] {
  const now = new Date()
  const out: { key: string; label: string; year: number; month: number }[] = []
  for (let i = 1; i >= -11; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    out.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`,
      year: d.getFullYear(),
      month: d.getMonth(),
    })
  }
  return out
}

function Kpi({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Users
  label: string
  value: string
  sub?: string
}) {
  return (
    <Card className="border-border/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { rate, source } = useDollarRate()
  const clientes = useCollection("clientes")
  const cobros = useCollection("cobros")
  const tareas = useCollection("tareas")
  const vencimientos = useCollection("vencimientos")
  const checkins = useCollection("checkins")

  const monthOptions = useMemo(buildMonthOptions, [])
  const now = new Date()
  const [monthKey, setMonthKey] = useState(`${now.getFullYear()}-${now.getMonth()}`)
  const selected = monthOptions.find((m) => m.key === monthKey) ?? monthOptions[0]

  const loading =
    clientes.loading ||
    cobros.loading ||
    tareas.loading ||
    vencimientos.loading ||
    checkins.loading

  const { existingIds } = useNotificationsContext()

  // ── Notificaciones (no-op si la key ya existe) ──────────────────────────
  useEffect(() => {
    if (vencimientos.loading) return
    for (const v of vencimientos.data) {
      if (!v.vencimiento || v.estado === "Pagar") continue
      const days = daysUntil(String(v.vencimiento))
      if (days === null || days > 7) continue
      const when = days < 0 ? `vencido hace ${Math.abs(days)} día(s)` : days === 0 ? "vence hoy" : `vence en ${days} día(s)`
      ensureNotification(`venc_${v.id}`, existingIds, {
        tipo: "vencimiento",
        titulo: `Vencimiento próximo — ${String(v.concepto ?? "")}`,
        cuerpo: `${when}${v.monto ? ` · $${Number(v.monto).toLocaleString("es-AR")}` : ""}`,
        href: "/admin/vencimientos",
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vencimientos.loading, vencimientos.data])

  useEffect(() => {
    if (cobros.loading) return
    for (const c of cobros.data) {
      if (cobroPaidForMonth(c)) continue
      const due = cobroDueDate(c)
      if (!due) continue
      const days = daysUntil(due)
      if (days === null || days > 7) continue
      const when = days < 0 ? `vencido hace ${Math.abs(days)} día(s)` : days === 0 ? "vence hoy" : `vence en ${days} día(s)`
      const key = isRecurrente(c) ? `cobro_${c.id}_${cobroPeriodo(c)}` : `cobro_${c.id}`
      ensureNotification(key, existingIds, {
        tipo: "cobro",
        titulo: `Cobro pendiente — ${String(c.concepto ?? c.cliente ?? "")}`,
        cuerpo: `${when}${c.monto ? ` · $${Number(c.monto).toLocaleString("es-AR")}` : ""}`,
        href: "/admin/cobros",
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cobros.loading, cobros.data])

  // Revisión de monto por inflación (cada cliente tiene su próxima revisión).
  useEffect(() => {
    if (clientes.loading) return
    for (const c of clientes.data) {
      if (!c.proximaRevision) continue
      const days = daysUntil(String(c.proximaRevision))
      if (days === null || days > 7) continue
      ensureNotification(`revision_${c.id}_${c.proximaRevision}`, existingIds, {
        tipo: "revision",
        titulo: `Revisar monto — ${String(c.cliente ?? "")}`,
        cuerpo:
          days < 0
            ? `La revisión venció hace ${Math.abs(days)} día(s). Actualizá por inflación y agendá la próxima (+3 meses).`
            : `Toca revisar el monto por inflación ${days === 0 ? "hoy" : `en ${days} día(s)`}.`,
        href: "/admin/clientes",
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientes.loading, clientes.data])

  // Check-in del día: si pasaron las 20hs y alguien no cargó, avisar (una vez por día).
  useEffect(() => {
    if (checkins.loading) return
    if (new Date().getHours() < 20) return
    const today = todayStr()
    const hechos = new Set(checkins.data.filter((c) => c.fecha === today).map((c) => String(c.miembro)))
    for (const m of MEMBERS) {
      if (hechos.has(m.name)) continue
      ensureNotification(`checkin_${today}_${m.name}`, existingIds, {
        tipo: "checkin",
        titulo: `Falta el check-in de ${m.name}`,
        cuerpo: `Son más de las 20hs y ${m.name} todavía no registró su actividad de hoy.`,
        href: "/admin/actividad",
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkins.loading, checkins.data])

  const stats = useMemo(() => {
    const { year, month } = selected
    // Recurrencia = SOLO las cuentas recurrentes activas (no instancias pagadas ni puntuales).
    const recurrenciaArs = cobros.data
      .filter((c) => isRecurrente(c))
      .reduce((acc, c) => acc + toNum(c.monto), 0)
    const recurrenciaUsd = Math.round(recurrenciaArs / rate)
    const progress = Math.min(100, Math.round((recurrenciaUsd / META_USD) * 100))
    const brechaUsd = Math.max(0, META_USD - recurrenciaUsd)

    // Cobrado del mes = pagos reales (instancias + puntuales cobrados) con fecha en el mes.
    const mk = `${year}-${String(month + 1).padStart(2, "0")}`
    const cobradoMes = cobros.data
      .filter((c) => inMonth(c.vencimiento, year, month) && cobroPaidForMonth(c))
      .reduce((a, c) => a + toNum(c.monto), 0)
    // Por cobrar = la recurrente activa cuyo período es este mes + puntuales pendientes del mes.
    const porCobrarMes = cobros.data.filter((c) =>
      isRecurrente(c)
        ? cobroPeriodo(c) === mk
        : inMonth(c.vencimiento, year, month) && !cobroPaidForMonth(c),
    )
    const sumPorCobrar = porCobrarMes.reduce((a, c) => a + toNum(c.monto), 0)

    const vencimientosMes = vencimientos.data.filter((v) => inMonth(v.vencimiento, year, month))
    const gastoMes = vencimientosMes.reduce((a, v) => a + toNum(v.monto), 0)

    const tareasAbiertas = tareas.data.filter((t) => t.estado !== "Hecho").length

    const proximosVtos = vencimientos.data
      .filter((v) => v.estado !== "Pagar" && v.vencimiento)
      .map((v) => ({ id: String(v.id), concepto: v.concepto, tipo: v.tipo, vencimiento: v.vencimiento, _days: daysUntil(String(v.vencimiento)) ?? 9999 }))
      .filter((v) => v._days <= 30)
      .sort((a, b) => a._days - b._days)
      .slice(0, 6)

    const revisiones = clientes.data
      .filter((c) => c.proximaRevision)
      .map((c) => ({ id: String(c.id), cliente: c.cliente, proximaRevision: c.proximaRevision, _days: daysUntil(String(c.proximaRevision)) ?? 9999 }))
      .filter((c) => c._days <= 30)
      .sort((a, b) => a._days - b._days)
      .slice(0, 6)

    const today = todayStr()
    const checkedInToday = new Set(checkins.data.filter((c) => c.fecha === today).map((c) => String(c.miembro)))

    return {
      recurrenciaArs,
      recurrenciaUsd,
      progress,
      brechaUsd,
      clientesCount: clientes.data.length,
      cobradoMes,
      sumPorCobrar,
      porCobrarCount: porCobrarMes.length,
      gastoMes,
      tareasAbiertas,
      proximosVtos,
      revisiones,
      checkedInToday,
    }
  }, [selected, clientes.data, cobros.data, tareas.data, vencimientos.data, checkins.data, rate])

  const firstName = user?.displayName?.split(" ")[0] ?? "equipo"

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Hola, {firstName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Datos de {selected.label.toLowerCase()}. Norte: 570 → 3.000 USD/mes recurrente.
          </p>
        </div>
        <Select value={monthKey} onValueChange={setMonthKey}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((m) => (
              <SelectItem key={m.key} value={m.key}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          icon={TrendingUp}
          label="Recurrencia mensual"
          value={formatARS(stats.recurrenciaArs)}
          sub={`≈ ${formatUSD(stats.recurrenciaUsd)} · dólar ${source === "vivo" ? "oficial" : "ref."} $${rate}`}
        />
        <Kpi icon={Receipt} label="Cobrado del mes" value={formatARS(stats.cobradoMes)} sub={selected.label} />
        <Kpi
          icon={Receipt}
          label="Por cobrar del mes"
          value={formatARS(stats.sumPorCobrar)}
          sub={`${stats.porCobrarCount} cobro(s)`}
        />
        <Kpi icon={Target} label="Tareas abiertas" value={String(stats.tareasAbiertas)} sub="sin terminar" />
      </div>

      {/* Progreso a la meta — solo recurrente */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Progreso a la meta · 3.000 USD/mes recurrente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-end justify-between">
            <span className="text-2xl font-semibold">{formatUSD(stats.recurrenciaUsd)}</span>
            <span className="text-sm text-muted-foreground">
              Faltan {formatUSD(stats.brechaUsd)} · {stats.progress}%
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${stats.progress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">
            Solo cuenta el cobro recurrente (no los pagos puntuales de desarrollo). Equivale a 1.000 USD por socio.
          </p>
        </CardContent>
      </Card>

      {/* Revisiones + cobros del mes */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Revisiones de monto (inflación)</CardTitle>
            <Link href="/admin/clientes" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              Ver <ArrowRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.revisiones.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nada que revisar en los próximos 30 días.</p>
            ) : (
              stats.revisiones.map((c) => {
                const di = dueInfo(String(c.proximaRevision))
                return (
                  <div key={c.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card/40 px-3 py-2">
                    <span className="truncate text-sm">{String(c.cliente)}</span>
                    {di ? (
                      <Badge variant="outline" className={cn("shrink-0 border", OPTION_COLOR_CLASSES[di.color])}>
                        {di.label}
                      </Badge>
                    ) : null}
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Próximos vencimientos</CardTitle>
            <Link href="/admin/vencimientos" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              Ver todos <ArrowRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.proximosVtos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nada vence en los próximos 30 días.</p>
            ) : (
              stats.proximosVtos.map((v) => {
                const di = dueInfo(String(v.vencimiento))
                return (
                  <div key={v.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card/40 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm">{String(v.concepto)}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[v.tipo, v.vencimiento ? formatDate(String(v.vencimiento)) : null].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    {di ? (
                      <Badge variant="outline" className={cn("shrink-0 border", OPTION_COLOR_CLASSES[di.color])}>
                        {di.label}
                      </Badge>
                    ) : null}
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actividad de hoy */}
      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Actividad de hoy</CardTitle>
          <Link href="/admin/actividad" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            Ver <ArrowRight className="size-3" />
          </Link>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-3">
          {MEMBERS.map((m) => {
            const done = stats.checkedInToday.has(m.name)
            return (
              <div key={m.email} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card/40 px-3 py-2">
                <div className="flex items-center gap-2.5">
                  <MemberAvatar name={m.name} />
                  <span className="text-sm">{m.name}</span>
                </div>
                <Badge variant="outline" className={cn("border", done ? OPTION_COLOR_CLASSES.green : OPTION_COLOR_CLASSES.gray)}>
                  {done ? "✓ check-in" : "pendiente"}
                </Badge>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
