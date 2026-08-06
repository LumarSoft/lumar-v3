"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Check,
  Download,
  FileCheck2,
  Mail,
  Send,
  Stethoscope,
  X,
} from "lucide-react";
import { CrudSection, type ExtraColumn } from "@/components/admin/crud-section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/firebase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FACTURAS_SCHEMA } from "@/lib/admin/schemas";
import { formatARS, formatDate } from "@/lib/admin/format";
import {
  construirPayload,
  facturaPeriodo,
  isEmitida,
  isRecurrente,
  labelMes,
  nextPeriodo,
  nombrePdf,
  validarParaEmitir,
  type Cliente,
  type EmitirPayload,
  type Problema,
} from "@/lib/admin/facturas";
import { useCollection, type DocRecord } from "@/lib/admin/use-collection";

/** Resultado del chequeo de conexión con ARCA. */
interface Diagnostico {
  ok: boolean;
  pasos: { paso: string; ok: boolean; detalle?: unknown }[];
}

/** Fila lista para confirmar: o tiene problemas, o tiene payload. */
interface Confirmacion {
  row: DocRecord;
  payload: EmitirPayload;
  problemas: Problema[];
}

// Pendientes arriba, emitidas al fondo. Dentro de cada grupo, por fecha.
function sortFacturas(a: DocRecord, b: DocRecord): number {
  const aDone = isEmitida(a) ? 1 : 0;
  const bDone = isEmitida(b) ? 1 : 0;
  if (aDone !== bDone) return aDone - bDone;
  return String(b.fechaEmision ?? "").localeCompare(
    String(a.fechaEmision ?? ""),
  );
}

function Dato({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1.5">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value || "—"}</span>
    </div>
  );
}

export default function FacturasPage() {
  const facturas = useCollection("facturas");
  const clientes = useCollection("clientes");
  const [confirmacion, setConfirmacion] = useState<Confirmacion | null>(null);
  const [emitiendo, setEmitiendo] = useState(false);
  const [enviarMail, setEnviarMail] = useState(true);
  const [diagnostico, setDiagnostico] = useState<
    "cargando" | Diagnostico | null
  >(null);

  const clientePorNombre = useMemo(() => {
    const map = new Map<string, Cliente>();
    for (const c of clientes.data)
      map.set(String(c.cliente ?? ""), c as Cliente);
    return map;
  }, [clientes.data]);

  function abrirConfirmacion(row: DocRecord) {
    const cli = clientePorNombre.get(String(row.cliente ?? ""));
    const payload = construirPayload(row as DocRecord & { id: string }, cli);
    const problemas = validarParaEmitir(row, cli);
    setEnviarMail(Boolean(payload.emailDestino));
    setConfirmacion({ row, payload, problemas });
  }

  async function emitir() {
    if (!confirmacion || confirmacion.problemas.length > 0) return;
    const { row, payload } = confirmacion;
    setEmitiendo(true);
    try {
      // El endpoint corre con el service account (saltea las reglas de
      // Firestore), así que le mandamos el ID token para que valide quién es.
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        toast.error("Se venció la sesión. Recargá la página.");
        return;
      }

      const res = await fetch("/api/facturas/emitir", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...payload, enviarMail }),
      });
      const data = await res.json();

      if (!res.ok || !data.cae) {
        // No tocamos la fila: sigue en Borrador y se puede reintentar.
        toast.error(data.error ?? "ARCA rechazó el comprobante", {
          description: data.detalle,
          duration: 10000,
        });
        return;
      }

      const datosArca = {
        estado: "Emitida",
        cae: data.cae,
        caeVto: data.caeVto,
        ptoVta: data.ptoVta,
        cbteNro: data.cbteNro,
        cbteTipo: data.cbteTipo,
        ambiente: data.ambiente,
      };

      if (isRecurrente(row)) {
        // La instancia guarda el comprobante real de ese mes…
        await facturas.add({
          ...datosArca,
          concepto: `${payload.concepto} (${labelMes(payload.periodo)})`,
          tipo: "Recurrente mensual",
          esInstancia: true,
          cliente: row.cliente ?? null,
          importe: payload.importe,
          fechaEmision: payload.fechaEmision,
          servicioDesde: payload.servicioDesde,
          servicioHasta: payload.servicioHasta,
          vtoPago: payload.vtoPago,
          periodoEmitido: payload.periodo,
        });
        // …y la plantilla avanza al mes siguiente.
        await facturas.update(row.id, {
          periodo: nextPeriodo(payload.periodo),
        });
      } else {
        await facturas.update(row.id, datosArca);
      }

      toast.success(`CAE ${data.cae} — ${labelMes(payload.periodo)}`, {
        description:
          enviarMail && payload.emailDestino
            ? `Comprobante autorizado y enviado a ${payload.emailDestino}.`
            : "Comprobante autorizado por ARCA.",
      });
      setConfirmacion(null);

      // El CAE ya existe aunque haya fallado el PDF o el mail: se avisa aparte.
      for (const aviso of (data.avisos ?? []) as string[]) {
        toast.warning(aviso, { duration: 10000 });
      }

      if (data.pdfBase64) {
        guardarArchivo(base64ABlob(data.pdfBase64), data.archivo);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "No se pudo conectar con ARCA",
      );
    } finally {
      setEmitiendo(false);
    }
  }

  function base64ABlob(b64: string): Blob {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: "application/pdf" });
  }

  function guardarArchivo(blob: Blob, nombre: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  /** Re-descarga de una factura ya emitida. Va con token: no sirve un <a href>. */
  async function redescargar(row: DocRecord) {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/facturas/${row.id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: null }));
        toast.error(error ?? "No se pudo descargar el PDF");
        return;
      }
      const cli = clientePorNombre.get(String(row.cliente ?? ""));
      const payload = construirPayload(row as DocRecord & { id: string }, cli);
      guardarArchivo(
        await res.blob(),
        nombrePdf({
          concepto: payload.concepto,
          cliente: payload.cliente,
          periodo: String(row.periodoEmitido ?? payload.periodo),
          fecha: payload.fechaEmision,
        }),
      );
    } catch {
      toast.error("No se pudo descargar el PDF");
    }
  }

  const extraColumns = useMemo<ExtraColumn[]>(
    () => [
      {
        key: "comprobante",
        label: "Comprobante",
        render: (row: DocRecord) => {
          if (!isEmitida(row)) {
            return <span className="text-muted-foreground">—</span>;
          }
          const nro = `${String(row.ptoVta ?? 0).padStart(5, "0")}-${String(
            row.cbteNro ?? 0,
          ).padStart(8, "0")}`;
          return (
            <div className="whitespace-nowrap text-xs">
              <div className="font-mono font-medium">{nro}</div>
              <div className="text-muted-foreground">
                CAE {String(row.cae)}
                {row.ambiente === "homologacion" ? (
                  <Badge
                    variant="outline"
                    className="ml-1.5 border-yellow-500/40 text-yellow-500"
                  >
                    prueba
                  </Badge>
                ) : null}
              </div>
            </div>
          );
        },
      },
      {
        key: "emitir",
        label: "Emisión",
        render: (row: DocRecord) => {
          if (isEmitida(row)) {
            return (
              <div className="flex items-center gap-1.5 whitespace-nowrap text-xs text-emerald-400">
                <FileCheck2 className="size-3.5" />
                Emitida
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  title="Descargar PDF"
                  onClick={() => redescargar(row)}
                >
                  <Download className="size-3.5" />
                </Button>
              </div>
            );
          }
          const periodo = isRecurrente(row) ? facturaPeriodo(row) : null;
          return (
            <Button
              size="sm"
              className="h-7 whitespace-nowrap text-xs"
              onClick={() => abrirConfirmacion(row)}
            >
              <Send className="size-3.5" />
              Emitir{periodo ? ` ${labelMes(periodo)}` : ""}
            </Button>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [facturas.data, clientePorNombre],
  );

  const bloqueada = (confirmacion?.problemas.length ?? 0) > 0;

  /** Chequeo de conexión con ARCA. No emite nada, solo lee. */
  async function probarConexion() {
    setDiagnostico("cargando");
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/facturas/diagnostico", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDiagnostico(await res.json());
    } catch (err) {
      setDiagnostico({
        ok: false,
        pasos: [
          {
            paso: "Conexión",
            ok: false,
            detalle: err instanceof Error ? err.message : "Error de red",
          },
        ],
      });
    }
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button variant="secondary" size="sm" onClick={probarConexion}>
          <Stethoscope className="size-4" /> Probar conexión con ARCA
        </Button>
      </div>

      <CrudSection
        schema={FACTURAS_SCHEMA}
        extraColumns={extraColumns}
        sortRows={sortFacturas}
      />

      {/* Chequeo de conexión con ARCA */}
      <Dialog
        open={diagnostico !== null}
        onOpenChange={(open) => !open && setDiagnostico(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Conexión con ARCA</DialogTitle>
            <DialogDescription>
              Solo lectura: este chequeo no emite ningún comprobante.
            </DialogDescription>
          </DialogHeader>

          <div
            data-lenis-prevent
            className="-mx-6 space-y-2 px-6"
            style={{
              maxHeight: "max(180px, calc(85vh - 12rem))",
              overflowY: "auto",
              scrollbarWidth: "thin",
              scrollbarColor: "var(--muted-foreground) transparent",
            }}
          >
            {diagnostico === "cargando" ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Consultando a ARCA…
              </p>
            ) : (
              diagnostico?.pasos.map((p) => (
                <div
                  key={p.paso}
                  className="rounded-lg border border-border bg-card/40 p-3 text-sm"
                >
                  <div className="flex items-center gap-2 font-medium">
                    {p.ok ? (
                      <Check className="size-4 shrink-0 text-emerald-400" />
                    ) : (
                      <X className="size-4 shrink-0 text-destructive" />
                    )}
                    {p.paso}
                  </div>
                  {p.detalle !== undefined ? (
                    <pre className="mt-1.5 overflow-x-auto text-xs whitespace-pre-wrap text-muted-foreground">
                      {typeof p.detalle === "string"
                        ? p.detalle
                        : JSON.stringify(p.detalle, null, 2)}
                    </pre>
                  ) : null}
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDiagnostico(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmacion !== null}
        onOpenChange={(open) => !open && setConfirmacion(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {bloqueada ? "Falta completar datos" : "Confirmar emisión"}
            </DialogTitle>
            <DialogDescription>
              {bloqueada
                ? "Corregí esto antes de emitir. ARCA rechazaría el comprobante."
                : "Esto se manda a ARCA y no se puede deshacer: una factura con CAE solo se revierte con nota de crédito."}
            </DialogDescription>
          </DialogHeader>

          <div
            data-lenis-prevent
            className="-mx-6 space-y-4 px-6"
            style={{
              maxHeight: "max(180px, calc(85vh - 12rem))",
              overflowY: "auto",
              scrollbarWidth: "thin",
              scrollbarColor: "var(--muted-foreground) transparent",
            }}
          >
            {confirmacion && bloqueada ? (
              <ul className="space-y-2">
                {confirmacion.problemas.map((p) => (
                  <li
                    key={p.campo}
                    className="flex gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm"
                  >
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
                    <div>
                      <span className="font-medium">{p.campo}</span>
                      <p className="text-muted-foreground">{p.mensaje}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}

            {confirmacion && !bloqueada ? (
              <div className="divide-y divide-border rounded-lg border border-border bg-card/40 p-3 text-sm">
                <Dato
                  label="Cliente"
                  value={confirmacion.payload.receptor.razonSocial}
                />
                <Dato
                  label={confirmacion.payload.receptor.docTipo || "Documento"}
                  value={
                    confirmacion.payload.receptor.docNro || "Consumidor final"
                  }
                />
                <Dato
                  label="Condición IVA"
                  value={confirmacion.payload.receptor.condicionIva}
                />
                <Dato label="Concepto" value={confirmacion.payload.concepto} />
                <Dato
                  label="Período del servicio"
                  value={`${formatDate(confirmacion.payload.servicioDesde)} → ${formatDate(
                    confirmacion.payload.servicioHasta,
                  )}`}
                />
                <Dato
                  label="Fecha del comprobante"
                  value={formatDate(confirmacion.payload.fechaEmision)}
                />
                <Dato
                  label="Vencimiento de pago"
                  value={formatDate(confirmacion.payload.vtoPago)}
                />
                <div className="flex justify-between gap-4 pt-2 text-base">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold">
                    {formatARS(confirmacion.payload.importe)}
                  </span>
                </div>
              </div>
            ) : null}

            {confirmacion && !bloqueada ? (
              confirmacion.payload.emailDestino ? (
                <div className="flex items-start gap-2.5 rounded-lg border border-border bg-card/40 p-3">
                  <Checkbox
                    id="enviarMail"
                    checked={enviarMail}
                    onCheckedChange={(v) => setEnviarMail(v === true)}
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor="enviarMail"
                    className="cursor-pointer text-sm font-normal leading-snug"
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      <Mail className="size-3.5" /> Enviar la factura por mail
                    </span>
                    <span className="text-muted-foreground">
                      Con el PDF adjunto a {confirmacion.payload.emailDestino}
                    </span>
                  </Label>
                </div>
              ) : (
                <p className="rounded-lg border border-border bg-card/40 p-3 text-xs text-muted-foreground">
                  {confirmacion.payload.receptor.razonSocial} no tiene mail de
                  facturación cargado, así que no se envía nada. Podés agregarlo
                  en Clientes.
                </p>
              )
            ) : null}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmacion(null)}>
              {bloqueada ? "Cerrar" : "Cancelar"}
            </Button>
            {!bloqueada ? (
              <Button onClick={emitir} disabled={emitiendo}>
                {emitiendo ? "Pidiendo CAE…" : "Emitir en ARCA"}
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
