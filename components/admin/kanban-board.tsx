"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { db } from "@/lib/firebase/client";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  Plus,
  Pencil,
  Trash2,
  MoreVertical,
  LayoutGrid,
  List,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MemberAvatar } from "@/components/admin/member-avatar";
import { useCollection, type DocRecord } from "@/lib/admin/use-collection";
import { TAREAS_SCHEMA, TAREAS_ESTADOS } from "@/lib/admin/schemas";
import { MEMBERS } from "@/lib/admin/members";
import { colorForOption, OPTION_COLOR_CLASSES } from "@/lib/admin/colors";
import { dueInfo, formatDate } from "@/lib/admin/format";
import { useNotificationsContext } from "@/lib/admin/notifications-context";

type FormState = Record<string, string | undefined>;

const PRIORIDAD_FIELD = TAREAS_SCHEMA.fields.find(
  (f) => f.key === "prioridad",
)!;
const ASIGNADO_FIELD = TAREAS_SCHEMA.fields.find((f) => f.key === "asignado")!;
const TIPO_FIELD = TAREAS_SCHEMA.fields.find((f) => f.key === "tipo")!;

function TaskCard({
  task,
  onEdit,
  onDelete,
  onMove,
}: {
  task: DocRecord;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (estado: string) => void;
}) {
  const di = task.vence ? dueInfo(String(task.vence)) : null;
  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData("text/plain", task.id)}
      className="group cursor-grab rounded-lg border border-border bg-card/60 p-3 active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm leading-snug">{task.tarea}</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <MoreVertical className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="size-3.5" /> Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {TAREAS_ESTADOS.filter((s) => s.value !== task.estado).map((s) => (
              <DropdownMenuItem key={s.value} onClick={() => onMove(s.value)}>
                Mover a {s.value}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="size-3.5" /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {(task.tipo || task.cliente) && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {task.tipo ? (
            <Badge
              variant="outline"
              className={cn(
                "border",
                colorForOption(TIPO_FIELD.options, String(task.tipo)),
              )}
            >
              {String(task.tipo)}
            </Badge>
          ) : null}
          {task.cliente ? (
            <span className="truncate text-xs text-muted-foreground">
              {String(task.cliente)}
            </span>
          ) : null}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <MemberAvatar name={task.asignado} />
          {task.prioridad ? (
            <Badge
              variant="outline"
              className={cn(
                "border",
                colorForOption(PRIORIDAD_FIELD.options, String(task.prioridad)),
              )}
            >
              {String(task.prioridad)}
            </Badge>
          ) : null}
        </div>
        {di ? (
          <Badge
            variant="outline"
            className={cn("border", OPTION_COLOR_CLASSES[di.color])}
          >
            {di.label}
          </Badge>
        ) : null}
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const { data, loading, add, update, remove } = useCollection("tareas");
  const clientes = useCollection("clientes");
  const [tab, setTab] = useState<"tablero" | "backlog">("tablero");
  const [filterMember, setFilterMember] = useState<string>("all");
  const [filterTipo, setFilterTipo] = useState<string>("all");
  const [filterCliente, setFilterCliente] = useState<string>("all");
  const [showCompleted, setShowCompleted] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DocRecord | null>(null);
  const [form, setForm] = useState<FormState>({});
  const [saving, setSaving] = useState(false);

  const { existingIds } = useNotificationsContext();

  // Opciones de cliente, en vivo desde la colección Clientes.
  const clienteOptions = useMemo(() => {
    const names = clientes.data
      .map((c) => String(c.cliente ?? ""))
      .filter(Boolean);
    return Array.from(new Set(names));
  }, [clientes.data]);

  const visible = useMemo(() => {
    let rows =
      filterMember === "all"
        ? data
        : data.filter((t) => t.asignado === filterMember);
    if (filterTipo !== "all") rows = rows.filter((t) => t.tipo === filterTipo);
    if (filterCliente !== "all")
      rows = rows.filter((t) => t.cliente === filterCliente);
    if (!showCompleted) rows = rows.filter((t) => t.estado !== "Hecho");
    return rows;
  }, [data, filterMember, filterTipo, filterCliente, showCompleted]);

  // En el backlog, las completadas van al fondo.
  const backlogRows = useMemo(
    () =>
      [...visible].sort(
        (a, b) =>
          (a.estado === "Hecho" ? 1 : 0) - (b.estado === "Hecho" ? 1 : 0),
      ),
    [visible],
  );

  function openCreate(estado?: string) {
    setEditing(null);
    setForm({ estado: estado ?? "To do" });
    setDialogOpen(true);
  }
  function openEdit(task: DocRecord) {
    setEditing(task);
    const next: FormState = {};
    for (const f of TAREAS_SCHEMA.fields) next[f.key] = task[f.key];
    setForm(next);
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!String(form.tarea ?? "").trim()) {
      toast.error("Falta el nombre de la tarea");
      return;
    }
    const payload: Record<string, unknown> = {};
    for (const f of TAREAS_SCHEMA.fields) {
      const v = form[f.key];
      if (v !== undefined && v !== "") payload[f.key] = v;
    }
    if (!payload.estado) payload.estado = "To do";
    setSaving(true);
    try {
      if (editing) await update(editing.id, payload);
      else await add(payload);
      toast.success(editing ? "Guardado" : "Tarea creada");

      // Fire a notification when a task is assigned/reassigned.
      const newAsignado = String(payload.asignado ?? "");
      const oldAsignado = editing ? String(editing.asignado ?? "") : "";
      const taskName = String(payload.tarea ?? "");
      if (newAsignado && newAsignado !== oldAsignado) {
        // Use a timestamp-based key so each reassignment generates its own notif
        const key = `tarea_asig_${editing?.id ?? "new"}_${Date.now()}`;
        if (!existingIds.has(key)) {
          await setDoc(doc(db, "notificaciones", key), {
            tipo: "tarea",
            titulo: editing
              ? `Tarea reasignada a ${newAsignado}`
              : `Nueva tarea asignada a ${newAsignado}`,
            cuerpo: taskName,
            href: "/admin/tareas",
            leidoPor: [],
            creadoEn: serverTimestamp(),
          });
        }
      }

      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function move(id: string, estado: string) {
    try {
      await update(id, { estado });
    } catch {
      toast.error("No se pudo mover");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {TAREAS_SCHEMA.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {TAREAS_SCHEMA.description}
          </p>
        </div>
        <Button onClick={() => openCreate()}>
          <Plus className="size-4" /> Nueva tarea
        </Button>
      </div>

      {/* Vista + filtro por persona */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-border p-0.5">
          <button
            type="button"
            onClick={() => setTab("tablero")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-colors",
              tab === "tablero"
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <LayoutGrid className="size-3.5" /> Tablero
          </button>
          <button
            type="button"
            onClick={() => setTab("backlog")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-colors",
              tab === "backlog"
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <List className="size-3.5" /> Backlog
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setFilterMember("all")}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              filterMember === "all"
                ? "border-border bg-secondary text-foreground"
                : "border-transparent text-muted-foreground hover:bg-secondary/50",
            )}
          >
            Todos
          </button>
          {MEMBERS.map((m) => (
            <button
              key={m.email}
              type="button"
              onClick={() => setFilterMember(m.name)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
                filterMember === m.name
                  ? "border-border bg-secondary text-foreground"
                  : "border-transparent text-muted-foreground hover:bg-secondary/50",
              )}
            >
              <MemberAvatar name={m.name} className="size-4 text-[8px]" />
              {m.name}
            </button>
          ))}
          <span className="mx-1 self-center text-border">|</span>
          <button
            type="button"
            onClick={() => setShowCompleted((s) => !s)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              showCompleted
                ? "border-border bg-secondary text-foreground"
                : "border-transparent text-muted-foreground hover:bg-secondary/50",
            )}
          >
            {showCompleted ? "Ocultar completadas" : "Mostrar completadas"}
          </button>
        </div>
      </div>

      {/* Filtros por tipo y cliente */}
      <div className="flex flex-wrap gap-2">
        <Select value={filterTipo} onValueChange={setFilterTipo}>
          <SelectTrigger className="h-8 w-44 text-xs">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {TIPO_FIELD.options?.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCliente} onValueChange={setFilterCliente}>
          <SelectTrigger className="h-8 w-52 text-xs">
            <SelectValue placeholder="Cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los clientes</SelectItem>
            {clienteOptions.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="size-5 text-muted-foreground" />
        </div>
      ) : tab === "tablero" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {TAREAS_ESTADOS.map((col) => {
            const cards = visible.filter(
              (t) => (t.estado ?? "To do") === col.value,
            );
            return (
              <div
                key={col.value}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData("text/plain");
                  if (id) move(id, col.value);
                }}
                className="flex min-h-[120px] flex-col gap-2 rounded-xl border border-border/60 bg-secondary/20 p-2.5"
              >
                <div className="flex items-center justify-between px-1 py-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "size-2 rounded-full",
                        OPTION_COLOR_CLASSES[col.color ?? "gray"],
                      )}
                    />
                    <span className="text-sm font-medium">{col.value}</span>
                    <span className="text-xs text-muted-foreground">
                      {cards.length}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6"
                    onClick={() => openCreate(col.value)}
                  >
                    <Plus className="size-3.5" />
                  </Button>
                </div>
                {cards.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={() => openEdit(task)}
                    onDelete={() => remove(task.id)}
                    onMove={(estado) => move(task.id, estado)}
                  />
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        // Vista Backlog (tabla)
        <div className="overflow-x-auto rounded-xl border border-border bg-card/40">
          {backlogRows.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No hay tareas.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarea</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Asignado</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Vence</TableHead>
                  <TableHead className="w-20 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backlogRows.map((t) => {
                  const di = t.vence ? dueInfo(String(t.vence)) : null;
                  return (
                    <TableRow key={t.id}>
                      <TableCell>{t.tarea}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {t.cliente ? String(t.cliente) : "—"}
                      </TableCell>
                      <TableCell>
                        {t.tipo ? (
                          <Badge
                            variant="outline"
                            className={cn(
                              "border",
                              colorForOption(
                                TIPO_FIELD.options,
                                String(t.tipo),
                              ),
                            )}
                          >
                            {String(t.tipo)}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <MemberAvatar name={t.asignado} />
                          <span className="text-xs">
                            {t.asignado ? String(t.asignado) : ""}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {t.estado ? (
                          <Badge
                            variant="outline"
                            className={cn(
                              "border",
                              colorForOption(TAREAS_ESTADOS, String(t.estado)),
                            )}
                          >
                            {String(t.estado)}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        {t.prioridad ? (
                          <Badge
                            variant="outline"
                            className={cn(
                              "border",
                              colorForOption(
                                PRIORIDAD_FIELD.options,
                                String(t.prioridad),
                              ),
                            )}
                          >
                            {String(t.prioridad)}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        {t.vence ? (
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <span>{formatDate(String(t.vence))}</span>
                            {di ? (
                              <Badge
                                variant="outline"
                                className={cn(
                                  "border",
                                  OPTION_COLOR_CLASSES[di.color],
                                )}
                              >
                                {di.label}
                              </Badge>
                            ) : null}
                          </div>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => openEdit(t)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-destructive"
                            onClick={() => remove(t.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {/* Dialog crear/editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar tarea" : "Nueva tarea"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Formulario de tarea
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="tarea">
                Tarea <span className="text-destructive">*</span>
              </Label>
              <Input
                id="tarea"
                value={form.tarea ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, tarea: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Cliente</Label>
                <Select
                  value={form.cliente}
                  onValueChange={(v) => setForm((p) => ({ ...p, cliente: v }))}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        clienteOptions.length
                          ? "Elegí"
                          : "Creá un cliente primero"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {clienteOptions.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select
                  value={form.tipo}
                  onValueChange={(v) => setForm((p) => ({ ...p, tipo: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Elegí" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPO_FIELD.options?.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Asignado a</Label>
                <Select
                  value={form.asignado}
                  onValueChange={(v) => setForm((p) => ({ ...p, asignado: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Elegí" />
                  </SelectTrigger>
                  <SelectContent>
                    {ASIGNADO_FIELD.options?.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Prioridad</Label>
                <Select
                  value={form.prioridad}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, prioridad: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Elegí" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORIDAD_FIELD.options?.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Estado</Label>
                <Select
                  value={form.estado}
                  onValueChange={(v) => setForm((p) => ({ ...p, estado: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Elegí" />
                  </SelectTrigger>
                  <SelectContent>
                    {TAREAS_ESTADOS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vence">Vence</Label>
                <Input
                  id="vence"
                  type="date"
                  value={form.vence ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, vence: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notas">Notas</Label>
              <Textarea
                id="notas"
                rows={3}
                value={form.notas ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notas: e.target.value }))
                }
              />
            </div>
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
    </div>
  );
}
