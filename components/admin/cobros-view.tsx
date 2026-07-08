"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Inbox,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FormFields, type FormState } from "@/components/admin/form-fields";
import { useCollection, type DocRecord } from "@/lib/admin/use-collection";
import { COBROS_SCHEMA } from "@/lib/admin/schemas";
import { colorForOption, OPTION_COLOR_CLASSES } from "@/lib/admin/colors";
import {
  cobroPeriodo,
  isInstancia,
  isRecurrente,
  monthKey,
  nextPeriodo,
  periodoDate,
} from "@/lib/admin/cobros";
import {
  formatARS,
  formatUSD,
  arsToUsd,
  formatDate,
  daysUntil,
  dueInfo,
} from "@/lib/admin/format";

const MESES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];
function labelMes(periodo: string): string {
  const [y, m] = periodo.split("-").map(Number);
  if (!y || !m) return periodo;
  return `${MESES[m - 1]} ${y}`;
}
function hoyISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function toNum(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Fija el período pendiente de cualquier recurrente que aún no lo tenga guardado,
 * para que deje de depender del reloj (mismo criterio que la versión anterior).
 */
function inferPeriodo(row: DocRecord, allCobros: DocRecord[]): string {
  const paid = allCobros
    .filter(
      (c) => isInstancia(c) && c.cliente === row.cliente && c.periodoPagado,
    )
    .map((c) => String(c.periodoPagado))
    .sort();
  if (paid.length > 0) return nextPeriodo(paid[paid.length - 1]);
  const createdAt = row.createdAt?.toDate?.() as Date | undefined;
  return monthKey(createdAt ?? new Date());
}

const ESTADO_FIELD = COBROS_SCHEMA.fields.find((f) => f.key === "estado")!;

function MetodoBadge({ metodo }: { metodo: unknown }) {
  if (!metodo) return null;
  const field = COBROS_SCHEMA.fields.find((f) => f.key === "metodo");
  return (
    <Badge
      variant="outline"
      className={cn("border", colorForOption(field?.options, String(metodo)))}
    >
      {String(metodo)}
    </Badge>
  );
}

function Money({ monto }: { monto: unknown }) {
  const n = toNum(monto);
  if (!n) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="whitespace-nowrap">
      <span className="font-semibold">{formatARS(n)}</span>
      <span className="ml-1.5 text-xs text-muted-foreground">
        ≈ {formatUSD(arsToUsd(n))}
      </span>
    </span>
  );
}

export function CobrosView() {
  const cobros = useCollection("cobros");
  const clientes = useCollection("clientes");

  const clientOptions = useMemo(
    () =>
      Array.from(
        new Set(
          clientes.data.map((c) => String(c.cliente ?? "")).filter(Boolean),
        ),
      ).map((v) => ({ value: v })),
    [clientes.data],
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DocRecord | null>(null);
  const [form, setForm] = useState<FormState>({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DocRecord | null>(null);
  const [showHistorial, setShowHistorial] = useState(false);

  // Autocorrección: fija el período pendiente que no esté guardado.
  useEffect(() => {
    if (cobros.loading) return;
    for (const row of cobros.data) {
      if (isRecurrente(row) && !row.periodo) {
        const periodo = inferPeriodo(row, cobros.data);
        cobros.update(row.id, { periodo }).catch(() => {});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cobros.loading]);

  const currentMk = monthKey(new Date());

  const { recurrentes, puntuales, instancias, resumen } = useMemo(() => {
    const recurrentes = cobros.data
      .filter(isRecurrente)
      .sort((a, b) =>
        String(a.cliente ?? a.concepto ?? "").localeCompare(
          String(b.cliente ?? b.concepto ?? ""),
          "es",
        ),
      );
    const puntuales = cobros.data
      .filter((c) => c.categoria === "Fijo desarrollo" && !c.esInstancia)
      .sort((a, b) => {
        const da = daysUntil(a.vencimiento ? String(a.vencimiento) : "") ?? 1e9;
        const db = daysUntil(b.vencimiento ? String(b.vencimiento) : "") ?? 1e9;
        return da - db;
      });
    const instancias = cobros.data
      .filter(isInstancia)
      .sort((a, b) =>
        String(b.periodoPagado ?? "").localeCompare(
          String(a.periodoPagado ?? ""),
        ),
      );

    // MRR = suma de las cuentas recurrentes activas.
    const mrr = recurrentes.reduce((a, c) => a + toNum(c.monto), 0);
    // Cobrado este mes = instancias con período pagado del mes actual.
    const cobradoMes = instancias
      .filter((c) => String(c.periodoPagado ?? "") === currentMk)
      .reduce((a, c) => a + toNum(c.monto), 0);
    // Por cobrar = recurrentes cuyo período pendiente es este mes o anterior
    // (o sea, todavía no se cobraron) + puntuales no cobrados.
    const porCobrarRec = recurrentes
      .filter((c) => cobroPeriodo(c) <= currentMk)
      .reduce((a, c) => a + toNum(c.monto), 0);
    const porCobrarPunt = puntuales
      .filter((c) => c.estado !== "Cobrar" && c.estado !== "Cobrado")
      .reduce((a, c) => a + toNum(c.monto), 0);

    return {
      recurrentes,
      puntuales,
      instancias,
      resumen: {
        mrr,
        cobradoMes,
        porCobrar: porCobrarRec + porCobrarPunt,
      },
    };
  }, [cobros.data, currentMk]);

  function openCreate() {
    setEditing(null);
    setForm({});
    setDialogOpen(true);
  }
  function openEdit(row: DocRecord) {
    setEditing(row);
    const next: FormState = {};
    for (const f of COBROS_SCHEMA.fields) next[f.key] = row[f.key];
    setForm(next);
    setDialogOpen(true);
  }
  function setField(key: string, value: string | number | undefined) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    for (const f of COBROS_SCHEMA.fields) {
      if (f.required && !String(form[f.key] ?? "").trim()) {
        toast.error(`Falta completar: ${f.label}`);
        return;
      }
    }
    const payload: Record<string, unknown> = {};
    for (const f of COBROS_SCHEMA.fields) {
      const v = form[f.key];
      if (v === undefined || v === "") continue;
      payload[f.key] =
        f.type === "currency" || f.type === "number" ? Number(v) : v;
    }
    setSaving(true);
    try {
      if (editing) {
        await cobros.update(editing.id, payload);
        toast.success("Guardado");
      } else {
        await cobros.add(payload);
        toast.success("Cobro creado");
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await cobros.remove(deleteTarget.id);
      toast.success("Eliminado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setDeleteTarget(null);
    }
  }

  async function cobrarMes(row: DocRecord) {
    const periodo = cobroPeriodo(row);
    const dia = Number(row.diaCobro) || 1;
    try {
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
      });
      await cobros.update(row.id, { periodo: nextPeriodo(periodo) });
      toast.success(
        `Cobrado ${labelMes(periodo)}. Próximo: ${labelMes(nextPeriodo(periodo))}.`,
      );
      const cli = clientes.data.find((c) => c.cliente === row.cliente);
      if (cli?.proximaRevision) {
        const d = daysUntil(String(cli.proximaRevision));
        if (d !== null && d <= 0) {
          toast.warning(
            `Revisá el monto de ${String(row.cliente)} por inflación — puede corresponder aumento.`,
          );
        }
      }
    } catch {
      toast.error("No se pudo registrar el cobro");
    }
  }

  if (cobros.loading || clientes.loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cobros</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Cuentas recurrentes, cobros puntuales y el historial de lo ya
            cobrado.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" /> Nuevo cobro
        </Button>
      </div>

      {cobros.error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground">
          {cobros.error}
        </div>
      ) : null}

      {/* Resumen */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recurrente / mes (MRR)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tracking-tight">
              {formatARS(resumen.mrr)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              ≈ {formatUSD(arsToUsd(resumen.mrr))}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cobrado este mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tracking-tight text-emerald-400">
              {formatARS(resumen.cobradoMes)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {labelMes(currentMk)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Por cobrar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tracking-tight">
              {formatARS(resumen.porCobrar)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              recurrente pendiente + puntuales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Cuentas recurrentes ─────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Cuentas recurrentes
          </h2>
          <Badge variant="outline" className="border-border">
            {recurrentes.length}
          </Badge>
        </div>

        {recurrentes.length === 0 ? (
          <EmptyRow text="No hay cuentas recurrentes." />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {recurrentes.map((row) => {
              const periodo = cobroPeriodo(row);
              const overdue = periodo < currentMk;
              const dueBadge = dueInfo(
                periodoDate(periodo, Number(row.diaCobro) || 1),
              );
              const cobrosDelCliente = instancias.filter(
                (c) => c.cliente === row.cliente,
              ).length;
              return (
                <div
                  key={row.id}
                  className="rounded-xl border border-border bg-card/40 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {String(row.cliente ?? row.concepto ?? "Cobro")}
                      </p>
                      {row.cliente && row.concepto ? (
                        <p className="truncate text-xs text-muted-foreground">
                          {String(row.concepto)}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => openEdit(row)}
                      >
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
                  </div>

                  <div className="mt-2">
                    <Money monto={row.monto} />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "border",
                        overdue
                          ? OPTION_COLOR_CLASSES.red
                          : OPTION_COLOR_CLASSES.blue,
                      )}
                    >
                      Pendiente: {labelMes(periodo)}
                    </Badge>
                    {dueBadge ? (
                      <Badge
                        variant="outline"
                        className={cn(
                          "border",
                          OPTION_COLOR_CLASSES[dueBadge.color],
                        )}
                      >
                        {dueBadge.label}
                      </Badge>
                    ) : null}
                    {row.diaCobro ? (
                      <span className="text-xs text-muted-foreground">
                        día {String(row.diaCobro)}
                      </span>
                    ) : null}
                    <MetodoBadge metodo={row.metodo} />
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <Button
                      size="sm"
                      className="h-8"
                      onClick={() => cobrarMes(row)}
                    >
                      <CheckCircle2 className="size-4" /> Cobrar{" "}
                      {labelMes(periodo)}
                    </Button>
                    {cobrosDelCliente > 0 ? (
                      <span className="text-xs text-muted-foreground">
                        ✓ {cobrosDelCliente} cobrado(s)
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Cobros puntuales ────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Cobros puntuales (desarrollo)
          </h2>
          <Badge variant="outline" className="border-border">
            {puntuales.length}
          </Badge>
        </div>

        {puntuales.length === 0 ? (
          <EmptyRow text="No hay cobros puntuales." />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {puntuales.map((row) => {
              const paid = row.estado === "Cobrar" || row.estado === "Cobrado";
              const dueBadge = row.vencimiento
                ? dueInfo(String(row.vencimiento))
                : null;
              return (
                <div
                  key={row.id}
                  className={cn(
                    "rounded-xl border border-border bg-card/40 p-4",
                    paid && "opacity-60",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {String(row.concepto ?? "Cobro")}
                      </p>
                      {row.cliente ? (
                        <p className="truncate text-xs text-muted-foreground">
                          {String(row.cliente)}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => openEdit(row)}
                      >
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
                  </div>

                  <div className="mt-2">
                    <Money monto={row.monto} />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {row.estado ? (
                      <Badge
                        variant="outline"
                        className={cn(
                          "border",
                          colorForOption(ESTADO_FIELD.options, String(row.estado)),
                        )}
                      >
                        {String(row.estado)}
                      </Badge>
                    ) : null}
                    {row.vencimiento ? (
                      <span className="text-xs text-muted-foreground">
                        vence {formatDate(String(row.vencimiento))}
                      </span>
                    ) : null}
                    {dueBadge ? (
                      <Badge
                        variant="outline"
                        className={cn(
                          "border",
                          OPTION_COLOR_CLASSES[dueBadge.color],
                        )}
                      >
                        {dueBadge.label}
                      </Badge>
                    ) : null}
                    <MetodoBadge metodo={row.metodo} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Historial de pagos ──────────────────────────────────────────── */}
      <section className="space-y-3">
        <button
          type="button"
          onClick={() => setShowHistorial((s) => !s)}
          className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
        >
          {showHistorial ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
          Historial de pagos
          <Badge variant="outline" className="border-border normal-case">
            {instancias.length}
          </Badge>
        </button>

        {showHistorial ? (
          instancias.length === 0 ? (
            <EmptyRow text="Todavía no registraste ningún cobro." />
          ) : (
            <div className="divide-y divide-border/60 rounded-xl border border-border bg-card/40">
              {instancias.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between gap-3 px-4 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm">
                      {String(row.cliente ?? row.concepto ?? "Cobro")}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {[
                        row.periodoPagado
                          ? labelMes(String(row.periodoPagado))
                          : null,
                        row.fechaCobro
                          ? `cobrado ${formatDate(String(row.fechaCobro))}`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Money monto={row.monto} />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteTarget(row)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : null}
      </section>

      {/* Crear / editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar cobro" : "Nuevo cobro"}</DialogTitle>
            <DialogDescription className="sr-only">
              Formulario de cobro
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <div className="py-2">
              <FormFields
                fields={COBROS_SCHEMA.fields}
                form={form}
                onChange={setField}
                clientOptions={clientOptions}
              />
            </div>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Guardando…" : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Borrar */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este cobro?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.esInstancia
                ? "Vas a borrar un pago del historial. No cambia el período pendiente de la cuenta recurrente."
                : "Esta acción no se puede deshacer."}
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
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-card/20 px-4 py-6 text-sm text-muted-foreground">
      <Inbox className="size-4 shrink-0" />
      {text}
    </div>
  );
}
