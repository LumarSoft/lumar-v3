"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Eye, EyeOff, Copy, Inbox } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Spinner } from "@/components/ui/spinner"
import { useCollection, type DocRecord } from "@/lib/admin/use-collection"
import { colorForOption, OPTION_COLOR_CLASSES } from "@/lib/admin/colors"
import { formatARS, formatUSD, arsToUsd, formatDate, dueInfo } from "@/lib/admin/format"
import type { FieldDef, SectionSchema } from "@/lib/admin/schemas"

type FormState = Record<string, string | number | undefined>

function SecretCell({ value }: { value: string }) {
  const [shown, setShown] = useState(false)
  if (!value) return <span className="text-muted-foreground">—</span>
  return (
    <div className="flex items-center gap-1.5">
      <code className="max-w-[220px] truncate font-mono text-xs">
        {shown ? value : "•".repeat(Math.min(value.length, 12))}
      </code>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-6"
        onClick={() => setShown((s) => !s)}
        title={shown ? "Ocultar" : "Mostrar"}
      >
        {shown ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-6"
        onClick={() => {
          navigator.clipboard.writeText(value)
          toast.success("Copiado")
        }}
        title="Copiar"
      >
        <Copy className="size-3.5" />
      </Button>
    </div>
  )
}

function renderCell(field: FieldDef, row: DocRecord) {
  const value = row[field.key]
  if (value === undefined || value === null || value === "") {
    if (field.type === "secret") return <SecretCell value="" />
    return <span className="text-muted-foreground">—</span>
  }
  switch (field.type) {
    case "select":
      return (
        <Badge variant="outline" className={cn("border", colorForOption(field.options, String(value)))}>
          {String(value)}
        </Badge>
      )
    case "currency":
      return (
        <div className="whitespace-nowrap">
          <span className="font-medium">{formatARS(Number(value))}</span>
          <span className="ml-1.5 text-xs text-muted-foreground">
            ≈ {formatUSD(arsToUsd(Number(value)))}
          </span>
        </div>
      )
    case "date": {
      const di = field.showDaysLeft ? dueInfo(String(value)) : null
      return (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span>{formatDate(String(value))}</span>
          {di ? (
            <Badge variant="outline" className={cn("border", OPTION_COLOR_CLASSES[di.color])}>
              {di.label}
            </Badge>
          ) : null}
        </div>
      )
    }
    case "secret":
      return <SecretCell value={String(value)} />
    default:
      return <span className="line-clamp-2">{String(value)}</span>
  }
}

export function CrudSection({ schema }: { schema: SectionSchema }) {
  const { data, loading, error, add, update, remove } = useCollection(schema.collection)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<DocRecord | null>(null)
  const [form, setForm] = useState<FormState>({})
  const [deleteTarget, setDeleteTarget] = useState<DocRecord | null>(null)
  const [saving, setSaving] = useState(false)

  const tableFields = useMemo(
    () => schema.fields.filter((f) => f.inTable !== false),
    [schema.fields],
  )

  const filterField = useMemo(
    () => (schema.filterKey ? schema.fields.find((f) => f.key === schema.filterKey) : undefined),
    [schema],
  )
  const [filter, setFilter] = useState<string>("all")
  const visible = useMemo(() => {
    if (filter === "all" || !schema.filterKey) return data
    return data.filter((r) => String(r[schema.filterKey as string]) === filter)
  }, [data, filter, schema.filterKey])

  function openCreate() {
    setEditing(null)
    setForm({})
    setDialogOpen(true)
  }

  function openEdit(row: DocRecord) {
    setEditing(row)
    const next: FormState = {}
    for (const f of schema.fields) next[f.key] = row[f.key]
    setForm(next)
    setDialogOpen(true)
  }

  function setField(key: string, value: string | number | undefined) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    // Validate required fields.
    for (const f of schema.fields) {
      if (f.required && !String(form[f.key] ?? "").trim()) {
        toast.error(`Falta completar: ${f.label}`)
        return
      }
    }
    // Build clean payload (drop undefined).
    const payload: Record<string, unknown> = {}
    for (const f of schema.fields) {
      const v = form[f.key]
      if (v === undefined || v === "") continue
      payload[f.key] = f.type === "currency" || f.type === "number" ? Number(v) : v
    }
    setSaving(true)
    try {
      if (editing) {
        await update(editing.id, payload)
        toast.success("Guardado")
      } else {
        await add(payload)
        toast.success(`${schema.itemNoun} creado`)
      }
      setDialogOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await remove(deleteTarget.id)
      toast.success("Eliminado")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar")
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{schema.title}</h1>
          {schema.description ? (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{schema.description}</p>
          ) : null}
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" /> Nuevo
        </Button>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground">
          {error}
        </div>
      ) : null}

      {filterField?.options ? (
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              filter === "all"
                ? "border-border bg-secondary text-foreground"
                : "border-transparent text-muted-foreground hover:bg-secondary/50",
            )}
          >
            Todos
          </button>
          {filterField.options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setFilter(o.value)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                filter === o.value
                  ? "border-border bg-secondary text-foreground"
                  : "border-transparent text-muted-foreground hover:bg-secondary/50",
              )}
            >
              {o.value}
            </button>
          ))}
        </div>
      ) : null}

      <div className="rounded-xl border border-border bg-card/40">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner className="size-5 text-muted-foreground" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-secondary">
              <Inbox className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Todavía no hay {schema.title.toLowerCase()}.</p>
            <Button variant="secondary" size="sm" onClick={openCreate}>
              <Plus className="size-4" /> Agregar el primero
            </Button>
          </div>
        ) : visible.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Nada en este filtro.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {tableFields.map((f) => (
                    <TableHead key={f.key}>{f.label}</TableHead>
                  ))}
                  <TableHead className="w-20 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((row) => (
                  <TableRow key={row.id}>
                    {tableFields.map((f) => (
                      <TableCell key={f.key}>{renderCell(f, row)}</TableCell>
                    ))}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(row)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteTarget(row)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Create / edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? `Editar ${schema.itemNoun}` : `Nuevo ${schema.itemNoun}`}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Formulario de {schema.itemNoun}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {schema.fields.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <Label htmlFor={f.key}>
                  {f.label}
                  {f.required ? <span className="ml-0.5 text-destructive">*</span> : null}
                </Label>
                {f.type === "select" ? (
                  <Select
                    value={form[f.key] ? String(form[f.key]) : undefined}
                    onValueChange={(v) => setField(f.key, v)}
                  >
                    <SelectTrigger id={f.key}>
                      <SelectValue placeholder="Elegí una opción" />
                    </SelectTrigger>
                    <SelectContent>
                      {f.options?.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : f.type === "textarea" ? (
                  <Textarea
                    id={f.key}
                    value={(form[f.key] as string) ?? ""}
                    placeholder={f.placeholder}
                    onChange={(e) => setField(f.key, e.target.value)}
                    rows={3}
                  />
                ) : f.type === "secret" ? (
                  <Textarea
                    id={f.key}
                    value={(form[f.key] as string) ?? ""}
                    placeholder={f.placeholder}
                    onChange={(e) => setField(f.key, e.target.value)}
                    rows={2}
                    className="font-mono text-xs"
                  />
                ) : (
                  <Input
                    id={f.key}
                    type={f.type === "currency" || f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                    value={(form[f.key] as string | number | undefined) ?? ""}
                    placeholder={f.placeholder}
                    onChange={(e) => setField(f.key, e.target.value)}
                  />
                )}
                {f.helpText ? <p className="text-xs text-muted-foreground">{f.helpText}</p> : null}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este {schema.itemNoun}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
