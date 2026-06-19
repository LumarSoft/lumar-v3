"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Flame, Check, Trash2, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { MemberAvatar } from "@/components/admin/member-avatar"
import { useCollection } from "@/lib/admin/use-collection"
import { useAuth } from "@/lib/admin/auth-context"
import { MEMBERS, memberByEmail } from "@/lib/admin/members"
import { todayStr, computeStreak } from "@/lib/admin/activity"
import { formatDate } from "@/lib/admin/format"

export function ActivityFeed() {
  const { user } = useAuth()
  const { data, loading, add, remove } = useCollection("checkins")
  const [text, setText] = useState("")
  const [saving, setSaving] = useState(false)

  const me = memberByEmail(user?.email)
  const today = todayStr()

  const streaks = useMemo(() => {
    const map: Record<string, Set<string>> = {}
    for (const c of data) {
      const name = String(c.miembro ?? "")
      const fecha = String(c.fecha ?? "")
      if (!name || !fecha) continue
      ;(map[name] ??= new Set()).add(fecha)
    }
    const out: Record<string, { streak: number; today: boolean }> = {}
    for (const m of MEMBERS) {
      const set = map[m.name] ?? new Set()
      out[m.name] = { streak: computeStreak(set), today: set.has(today) }
    }
    return out
  }, [data, today])

  const grouped = useMemo(() => {
    const byDate: Record<string, typeof data> = {}
    for (const c of data) {
      const fecha = String(c.fecha ?? "")
      ;(byDate[fecha] ??= []).push(c)
    }
    return Object.entries(byDate).sort((a, b) => (a[0] < b[0] ? 1 : -1))
  }, [data])

  async function submit() {
    if (!me) {
      toast.error("No identificamos tu usuario en el equipo.")
      return
    }
    if (!text.trim()) {
      toast.error("Escribí qué hiciste hoy.")
      return
    }
    setSaving(true)
    try {
      await add({ miembro: me.name, texto: text.trim(), fecha: today })
      setText("")
      toast.success("Check-in registrado 🔥")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Actividad diaria</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Check-in diario. 1 línea de qué moviste hoy. No zero days.
        </p>
      </div>

      {/* Rachas */}
      <div className="grid gap-3 sm:grid-cols-3">
        {MEMBERS.map((m) => {
          const s = streaks[m.name]
          return (
            <Card key={m.email} className="border-border/60">
              <CardContent className="flex items-center justify-between gap-3 py-4">
                <div className="flex items-center gap-2.5">
                  <MemberAvatar name={m.name} className="size-8 text-xs" />
                  <div>
                    <p className="text-sm font-medium">{m.name}</p>
                    <p
                      className={cn(
                        "text-xs",
                        s?.today ? "text-emerald-400" : "text-muted-foreground",
                      )}
                    >
                      {s?.today ? "Check-in hecho hoy" : "Falta el de hoy"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold">
                  <Flame className={cn("size-4", s?.streak ? "text-orange-400" : "text-muted-foreground")} />
                  {s?.streak ?? 0}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Form de hoy */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {me ? `Tu check-in de hoy, ${me.name}` : "Check-in de hoy"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ej: mandé el presupuesto de los módulos de Heroica + 2 mensajes de outbound a PAS."
            rows={2}
          />
          <div className="flex justify-end">
            <Button onClick={submit} disabled={saving}>
              <Send className="size-4" /> {saving ? "Guardando…" : "Registrar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Historial */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner className="size-5 text-muted-foreground" />
          </div>
        ) : grouped.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Todavía no hay check-ins.</p>
        ) : (
          grouped.map(([fecha, items]) => (
            <div key={fecha} className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium">
                  {fecha === today ? "Hoy" : formatDate(fecha)}
                </h3>
                <div className="h-px flex-1 bg-border" />
              </div>
              {items.map((c) => (
                <div
                  key={c.id}
                  className="group flex items-start gap-3 rounded-lg border border-border/60 bg-card/40 px-3 py-2"
                >
                  <MemberAvatar name={String(c.miembro)} className="mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium">{String(c.miembro)}</p>
                    <p className="text-sm text-muted-foreground">{String(c.texto)}</p>
                  </div>
                  {me && c.miembro === me.name ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => remove(c.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  ) : (
                    <Check className="mt-1 size-3.5 text-emerald-500/60" />
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
