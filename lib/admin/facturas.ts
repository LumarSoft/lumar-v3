// Lógica de facturación electrónica (ARCA) del panel.
// Este archivo NO habla con ARCA: solo prepara, valida y nombra.
// La emisión vive en /api/facturas/emitir (server-only, necesita el certificado).

import { monthKey, nextPeriodo, periodoDate } from "@/lib/admin/cobros";
import { siguienteDiaHabil, sumarDiasHabiles } from "@/lib/admin/feriados";

export { monthKey, nextPeriodo, periodoDate };

/** Plantilla recurrente: la cuenta que avanza mes a mes. */
export function isRecurrente(f: Record<string, unknown>): boolean {
  return f.tipo === "Recurrente mensual" && !f.esInstancia;
}

/** Comprobante ya emitido (o intento fallido) de un mes concreto. */
export function isInstancia(f: Record<string, unknown>): boolean {
  return Boolean(f.esInstancia);
}

export function isEmitida(f: Record<string, unknown>): boolean {
  return f.estado === "Emitida" && Boolean(f.cae);
}

/** Período que le toca emitir a una recurrente ("YYYY-MM"). */
export function facturaPeriodo(f: Record<string, unknown>): string {
  return f.periodo ? String(f.periodo) : monthKey();
}

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

/** "2026-08" → "ago 2026" */
export function labelMes(periodo: string): string {
  const [y, m] = periodo.split("-").map(Number);
  if (!y || !m || m < 1 || m > 12) return periodo;
  return `${MESES[m - 1]} ${y}`;
}

/** Hoy en formato YYYY-MM-DD, hora local (no UTC). */
export function hoyISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/** Primer día del período: "2026-08" → "2026-08-01". */
export function primerDia(periodo: string): string {
  return periodoDate(periodo, 1);
}

/** Último día del período: "2026-08" → "2026-08-31". */
export function ultimoDia(periodo: string): string {
  const [y, m] = periodo.split("-").map(Number);
  const last = new Date(y, m, 0).getDate();
  return periodoDate(periodo, last);
}

/** Suma días corridos a una fecha YYYY-MM-DD. */
export function sumarDias(iso: string, dias: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const fecha = new Date(y, m - 1, d + dias);
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(
    fecha.getDate(),
  ).padStart(2, "0")}`;
}

/**
 * Primer día hábil del período: saltea fines de semana y feriados nacionales.
 * No contempla los "puentes" turísticos, que se fijan por decreto cada año.
 */
export function primerDiaHabil(periodo: string): string {
  return siguienteDiaHabil(primerDia(periodo));
}

/** Días hábiles entre la emisión y el vencimiento de pago. */
export const DIAS_VENCIMIENTO = 5;

/**
 * Ventana que acepta ARCA entre la fecha del comprobante y la del envío.
 * Manual WSFEv1: ±5 días para productos, ±10 para servicios (siempre servicios acá).
 */
export const VENTANA_FECHA_DIAS = 10;

/**
 * Fecha del comprobante. Una recurrente se emite el primer día hábil del mes
 * del período; una fija, el día que se cargó (o hoy).
 */
export function fechaEmisionEfectiva(
  f: Record<string, unknown>,
  periodo: string,
): string {
  if (f.fechaEmision) return String(f.fechaEmision);
  return isRecurrente(f) ? primerDiaHabil(periodo) : hoyISO();
}

/**
 * Rango de servicio efectivo de una factura.
 * Si la fila no lo define, para una recurrente se asume el mes completo del
 * período y el pago vence 5 días corridos después de la emisión.
 */
export function rangoServicio(
  f: Record<string, unknown>,
  periodo: string,
  fechaEmision: string,
): { desde: string; hasta: string; vtoPago: string } {
  const desde = f.servicioDesde ? String(f.servicioDesde) : primerDia(periodo);
  const hasta = f.servicioHasta ? String(f.servicioHasta) : ultimoDia(periodo);
  const vtoPago = f.vtoPago
    ? String(f.vtoPago)
    : sumarDiasHabiles(fechaEmision, DIAS_VENCIMIENTO);
  return { desde, hasta, vtoPago };
}

/** Texto → slug apto para nombre de archivo. */
export function slugify(value: string): string {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // saca tildes
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/**
 * Nombre del PDF: concepto-cliente-periodo-fecha.pdf
 * Ej: desarrollo-web-end-srl-2026-08-2026-08-06.pdf
 */
export function nombrePdf(input: {
  concepto: string;
  cliente: string;
  periodo: string;
  fecha: string;
}): string {
  return [
    slugify(input.concepto),
    slugify(input.cliente),
    input.periodo,
    input.fecha,
  ]
    .filter(Boolean)
    .join("-")
    .concat(".pdf");
}

// ── Validación previa a emitir ───────────────────────────────────────────
// Emitir es irreversible (una factura con CAE solo se revierte con nota de
// crédito), así que chequeamos todo ANTES de tocar ARCA.

export interface Cliente {
  cliente?: string;
  razonSocial?: string;
  docTipo?: string;
  docNro?: string | number;
  condicionIva?: string;
  email?: string;
  domicilio?: string;
}

/** Un problema que impide emitir, en castellano y accionable. */
export interface Problema {
  campo: string;
  mensaje: string;
}

export function validarParaEmitir(
  f: Record<string, unknown>,
  cli: Cliente | undefined,
): Problema[] {
  const problemas: Problema[] = [];

  const importe = Number(f.importe);
  if (!Number.isFinite(importe) || importe <= 0) {
    problemas.push({
      campo: "Importe",
      mensaje: "Tiene que ser un número mayor a cero.",
    });
  }

  if (!String(f.concepto ?? "").trim()) {
    problemas.push({ campo: "Concepto", mensaje: "Falta completarlo." });
  }

  if (!cli) {
    problemas.push({
      campo: "Cliente",
      mensaje: "No encontré la ficha del cliente. Creála en Clientes.",
    });
    return problemas; // sin cliente, el resto de los chequeos no aplica
  }

  if (!cli.condicionIva) {
    problemas.push({
      campo: "Condición IVA",
      mensaje: `Cargá la condición frente al IVA de ${cli.cliente ?? "el cliente"}. ARCA la exige desde la RG 5616.`,
    });
  }

  const esConsumidorFinal = cli.docTipo === "Consumidor final";
  if (!esConsumidorFinal) {
    const doc = String(cli.docNro ?? "").replace(/\D/g, "");
    if (!cli.docTipo) {
      problemas.push({
        campo: "Tipo de documento",
        mensaje: "Elegí CUIT, DNI o Consumidor final en la ficha del cliente.",
      });
    }
    if (!doc) {
      problemas.push({
        campo: "CUIT / DNI",
        mensaje: "Falta el número de documento en la ficha del cliente.",
      });
    } else if (cli.docTipo === "CUIT" && doc.length !== 11) {
      problemas.push({
        campo: "CUIT",
        mensaje: `El CUIT tiene que tener 11 dígitos (tiene ${doc.length}).`,
      });
    } else if (cli.docTipo === "DNI" && (doc.length < 7 || doc.length > 8)) {
      problemas.push({
        campo: "DNI",
        mensaje: `El DNI tiene que tener 7 u 8 dígitos (tiene ${doc.length}).`,
      });
    }
  }

  // Ventana que acepta ARCA para CbteFch (manual WSFEv1): ±5 días corridos
  // para productos (Concepto 1) y ±10 para servicios (Concepto 2 y 3).
  // Siempre emitimos servicios, así que la ventana es de 10.
  const periodo = isRecurrente(f) ? facturaPeriodo(f) : monthKey();
  const fecha = fechaEmisionEfectiva(f, periodo);
  const diff = Math.abs(
    Math.round(
      (new Date(fecha).getTime() - new Date(hoyISO()).getTime()) / 86400000,
    ),
  );
  if (diff > VENTANA_FECHA_DIAS) {
    problemas.push({
      campo: "Fecha emisión",
      mensaje:
        `La fecha del comprobante (${fecha}) está a ${diff} días de hoy y ARCA solo acepta ` +
        `±${VENTANA_FECHA_DIAS} para servicios. Ajustala en la factura antes de emitir.`,
    });
  }

  return problemas;
}

/** Lo que se le manda al endpoint de emisión. */
export interface EmitirPayload {
  facturaId: string;
  periodo: string;
  concepto: string;
  cliente: string;
  importe: number;
  fechaEmision: string;
  servicioDesde: string;
  servicioHasta: string;
  vtoPago: string;
  receptor: {
    razonSocial: string;
    docTipo: string;
    docNro: string;
    condicionIva: string;
    domicilio: string;
  };
  /** Código interno del servicio, para la tabla del PDF. */
  codigo: string;
  /** Ej: "Transferencia Bancaria". Solo informativo. */
  condicionVenta: string;
  /** Mail de facturación del cliente. Vacío = no hay a dónde mandarla. */
  emailDestino: string;
  enviarMail?: boolean;
}

/** Arma el payload exacto que se va a enviar, para poder mostrarlo antes de confirmar. */
export function construirPayload(
  f: Record<string, unknown> & { id: string },
  cli: Cliente | undefined,
): EmitirPayload {
  const periodo = isRecurrente(f)
    ? facturaPeriodo(f)
    : monthKey(f.fechaEmision ? new Date(String(f.fechaEmision)) : new Date());
  const fechaEmision = fechaEmisionEfectiva(f, periodo);
  const { desde, hasta, vtoPago } = rangoServicio(f, periodo, fechaEmision);
  const nombre = String(f.cliente ?? "");
  return {
    facturaId: f.id,
    periodo,
    concepto: String(f.concepto ?? ""),
    cliente: nombre,
    importe: Number(f.importe) || 0,
    fechaEmision,
    servicioDesde: desde,
    servicioHasta: hasta,
    vtoPago,
    codigo: String(f.codigo ?? ""),
    condicionVenta: String(f.condicionVenta ?? "Transferencia Bancaria"),
    emailDestino: cli?.email?.trim() ?? "",
    receptor: {
      razonSocial: cli?.razonSocial || nombre,
      docTipo: cli?.docTipo ?? "",
      docNro: String(cli?.docNro ?? "").replace(/\D/g, ""),
      condicionIva: cli?.condicionIva ?? "",
      domicilio: cli?.domicilio ?? "",
    },
  };
}
