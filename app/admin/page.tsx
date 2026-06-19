"use client"

import Link from "next/link"
import { useEffect, useMemo } from "react"
import { Users, Receipt, TrendingUp, Target, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { MemberAvatar } from "@/components/admin/member-avatar"
import { useCollection, type DocRecord } from "@/lib/admin/use-collection"
import { formatARS, formatUSD, arsToUsd, formatDate, dueInfo, daysUntil } from "@/lib/admin/format"
import { colorForOption, OPTION_COLOR_CLASSES } from "@/lib/admin/colors"
import { PROYECTOS_SCHEMA } from "@/lib/admin/schemas"
import { MEMBERS } from "@/lib/admin/members"
import { todayStr } from "@/lib/admin/activity"
import { useAuth } from "@/lib/admin/auth-context"
import { cn } from "@/lib/utils"
import { useNotificationsContext } from "@/lib/admin/notifications-context"
import { ensureNotification } from "@/lib/admin/use-notifications"

const META_USD = 3000

function toNum(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
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
  const clientes = useCollection("clientes")
  const cobros = useCollection("cobros")
  const proyectos = useCollection("proyectos")
  const tareas = useCollection("tareas")
  const vencimientos = useCollection("vencimientos")
  const checkins = useCollection("checkins")

  const loading =
    clientes.loading ||
    cobros.loading ||
    proyectos.loading ||
    tareas.loading ||
    vencimientos.loading ||
    checkins.loading

  const { existingIds } = useNotificationsContext()

  // Generate notifications for upcoming vencimientos and cobros (≤ 7 days).
  // ensureNotification is a no-op if the key already exists in Firestore.
  useEffect(() => {
    if (vencimientos.loading) return
    for (const v of vencimientos.data) {
      if (!v.vencimiento || v.estado === "Pagado") continue
      const days = daysUntil(String(v.vencimiento))
      if (days === null || days > 7) continue
      const key = `venc_${v.id}`
      const when =
        days < 0
          ? `vencido hace ${Math.abs(days)} día(s)`
          : days === 0
            ? "vence hoy"
            : `vence en ${days} día(s)`
      ensureNotification(key, existingIds, {
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
      if (!c.vencimiento || c.estado === "Cobrado") continue
      const days = daysUntil(String(c.vencimiento))
      if (days === null || days > 7) continue
      const key = `cobro_${c.id}`
      const when =
        days < 0
          ? `vencido hace ${Math.abs(days)} día(s)`
          : days === 0
            ? "vence hoy"
            : `vence en ${days} día(s)`
      ensureNotification(key, existingIds, {
        tipo: "cobro",
        titulo: `Cobro pendiente — ${String(c.concepto ?? c.cliente ?? "")}`,
        cuerpo: `${when}${c.monto ? ` · $${Number(c.monto).toLocaleString("es-AR")}` : ""}`,
        href: "/admin/cobros",
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cobros.loading, cobros.data])

  const stats = useMemo(() => {
    const recurrenciaArs = clientes.data.reduce((acc, c) => acc + toNum(c.montoMensual), 0)
    const recurrenciaUsd = arsToUsd(recurrenciaArs)
    const progress = Math.min(100, Math.round((recurrenciaUsd / META_USD) * 100))
    const brechaUsd = Math.max(0, META_USD - recurrenciaUsd)

    const pendientes = cobros.data.filter((c) => c.estado === "Pendiente")
    const sumPendiente = pendientes.reduce((acc, c) => acc + toNum(c.monto), 0)

    const proyectosAlta = proyectos.data.filter(
      (p) => p.prioridad === "Alta" && p.estado !== "Produccion",
    )
    const backlogAbierto = tareas.data.filter((t) => t.estado !== "Hecho")

    const proximosVtos = vencimientos.data
      .filter((v) => v.estado !== "Pagado" && v.vencimiento)
      .map((v): DocRecord & { _days: number } => ({
        ...v,
        _days: daysUntil(String(v.vencimiento)) ?? 9999,
      }))
      .filter((v) => v._days <= 30)
      .sort((a, b) => a._days - b._days)
      .slice(0, 6)

    const today = todayStr()
    const checkedInToday = new Set(
      checkins.data.filter((c) => c.fecha === today).map((c) => String(c.miembro)),
    )

    return {
      recurrenciaArs,
      recurrenciaUsd,
      progress,
      brechaUsd,
      clientesCount: clientes.data.length,
      pendientes,
      sumPendiente,
      proyectosAlta,
      backlogAbierto: backlogAbierto.length,
      proximosVtos,
      checkedInToday,
    }
  }, [clientes.data, cobros.data, proyectos.data, tareas.data, vencimientos.data, checkins.data])

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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Hola, {firstName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Estado del negocio de un vistazo. Norte: 570 → 3.000 USD/mes recurrente.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          icon={TrendingUp}
          label="Recurrencia mensual"
          value={formatARS(stats.recurrenciaArs)}
          sub={`≈ ${formatUSD(stats.recurrenciaUsd)} / mes`}
        />
        <Kpi icon={Users} label="Clientes" value={String(stats.clientesCount)} sub="en cartera" />
        <Kpi
          icon={Receipt}
          label="Por cobrar"
          value={formatARS(stats.sumPendiente)}
          sub={`${stats.pendientes.length} cobro(s) pendiente(s)`}
        />
        <Kpi
          icon={Target}
          label="Tareas abiertas"
          value={String(stats.backlogAbierto)}
          sub="sin terminar"
        />
      </div>

      {/* Progreso a la meta */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Progreso a la meta · 3.000 USD/mes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-end justify-between">
            <span className="text-2xl font-semibold">{formatUSD(stats.recurrenciaUsd)}</span>
            <span className="text-sm text-muted-foreground">
              Faltan {formatUSD(stats.brechaUsd)} · {stats.progress}%
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${stats.progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Equivale a 1.000 USD por socio. Palancas: subir recurrentes, John BOT a 4 números, y el
            SaaS para PAS.
          </p>
        </CardContent>
      </Card>

      {/* Listas */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Proyectos prioridad alta */}
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Proyectos prioridad alta</CardTitle>
            <Link
              href="/admin/proyectos"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Ver todos <ArrowRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.proyectosAlta.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nada urgente. 👌</p>
            ) : (
              stats.proyectosAlta.map((p) => {
                const estadoField = PROYECTOS_SCHEMA.fields.find((f) => f.key === "estado")
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card/40 px-3 py-2"
                  >
                    <span className="truncate text-sm">{p.proyecto}</span>
                    {p.estado ? (
                      <Badge
                        variant="outline"
                        className={cn("shrink-0 border", colorForOption(estadoField?.options, String(p.estado)))}
                      >
                        {String(p.estado)}
                      </Badge>
                    ) : null}
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Cobros pendientes */}
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Cobros pendientes</CardTitle>
            <Link
              href="/admin/cobros"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Ver todos <ArrowRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.pendientes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay cobros pendientes.</p>
            ) : (
              stats.pendientes.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card/40 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm">{c.concepto}</p>
                    {c.cliente ? (
                      <p className="truncate text-xs text-muted-foreground">{String(c.cliente)}</p>
                    ) : null}
                  </div>
                  <span className="shrink-0 text-sm font-medium">{formatARS(toNum(c.monto))}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actividad + vencimientos */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Actividad de hoy</CardTitle>
            <Link
              href="/admin/actividad"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Ver <ArrowRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {MEMBERS.map((m) => {
              const done = stats.checkedInToday.has(m.name)
              return (
                <div
                  key={m.email}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card/40 px-3 py-2"
                >
                  <div className="flex items-center gap-2.5">
                    <MemberAvatar name={m.name} />
                    <span className="text-sm">{m.name}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "border",
                      done ? OPTION_COLOR_CLASSES.green : OPTION_COLOR_CLASSES.gray,
                    )}
                  >
                    {done ? "✓ check-in" : "pendiente"}
                  </Badge>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Próximos vencimientos</CardTitle>
            <Link
              href="/admin/vencimientos"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
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
                  <div
                    key={v.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card/40 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm">{String(v.concepto)}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[v.tipo, v.vencimiento ? formatDate(String(v.vencimiento)) : null]
                          .filter(Boolean)
                          .join(" · ")}
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
    </div>
  )
}
