// Configuración del emisor y mapeo de nuestros valores del panel a los códigos de ARCA.
// Server-only: lee el certificado desde variables de entorno.
import "server-only";

/** Códigos oficiales de ARCA (WSFEv1). */
export const CBTE_TIPO_FACTURA_C = 11;
export const CONCEPTO_SERVICIOS = 2;

/** Tipos de documento del receptor. */
const DOC_TIPO: Record<string, number> = {
  CUIT: 80,
  DNI: 96,
  "Consumidor final": 99,
};

/** Condición del receptor frente al IVA (obligatoria desde la RG 5616). */
const CONDICION_IVA: Record<string, number> = {
  "Responsable Inscripto": 1,
  Exento: 4,
  "Consumidor Final": 5,
  Monotributista: 6,
};

export function docTipoCodigo(label: string): number | null {
  return DOC_TIPO[label] ?? null;
}

export function condicionIvaCodigo(label: string): number | null {
  return CONDICION_IVA[label] ?? null;
}

export interface EmisorConfig {
  cuit: number;
  ptoVta: number;
  produccion: boolean;
  /** Vacíos cuando se emite por la pasarela: el certificado vive en el VPS. */
  cert: string;
  key: string;
  /**
   * Si está seteada, no hablamos con ARCA desde acá: le mandamos la factura a
   * esta URL y el VPS pide el CAE. ARCA no atiende de forma confiable a las
   * IPs de Vercel; desde un servidor argentino sí.
   */
  gatewayUrl: string;
  gatewayToken: string;
  usaGateway: boolean;
  razonSocial: string;
  domicilio: string;
  inicioActividades: string;
  /** Nº de Ingresos Brutos, o "no" / "Exento" según corresponda. */
  ingresosBrutos: string;
  /** Leyenda de actividad que va al pie, ej: "Informática, desarrollos y tecnología". */
  actividad: string;
  /** "produccion" | "homologacion" — se guarda en cada comprobante emitido. */
  ambiente: string;
}

/** Falta de configuración: mensaje accionable, no un stack trace. */
export class ConfigError extends Error {}

function requerido(nombre: string): string {
  const v = process.env[nombre];
  if (!v) {
    throw new ConfigError(
      `Falta la variable de entorno ${nombre}. Cargala en .env.local (y en Vercel para producción).`,
    );
  }
  return v;
}

/**
 * El certificado y la clave viajan en base64 para que sobrevivan a una env var
 * de una sola línea. Nunca se escriben a disco.
 */
function pem(nombre: string): string {
  const raw = requerido(nombre);
  const decoded = raw.includes("-----BEGIN")
    ? raw
    : Buffer.from(raw, "base64").toString("utf8");
  if (!decoded.includes("-----BEGIN")) {
    throw new ConfigError(
      `${nombre} no parece un PEM válido. Generalo con: base64 -i archivo | tr -d '\\n'`,
    );
  }
  return decoded;
}

export function leerConfig(): EmisorConfig {
  const produccion = process.env.ARCA_PRODUCCION === "true";
  const gatewayUrl = (process.env.ARCA_GATEWAY_URL ?? "").replace(/\/+$/, "");
  const usaGateway = gatewayUrl.length > 0;
  const cuit = Number(requerido("ARCA_CUIT").replace(/\D/g, ""));
  if (!Number.isFinite(cuit) || String(cuit).length !== 11) {
    throw new ConfigError("ARCA_CUIT tiene que ser un CUIT de 11 dígitos.");
  }
  const ptoVta = Number(requerido("ARCA_PTO_VTA"));
  if (!Number.isFinite(ptoVta) || ptoVta <= 0) {
    throw new ConfigError("ARCA_PTO_VTA tiene que ser un número mayor a cero.");
  }
  if (usaGateway && !process.env.ARCA_GATEWAY_TOKEN) {
    throw new ConfigError(
      "Hay ARCA_GATEWAY_URL pero falta ARCA_GATEWAY_TOKEN (el secreto compartido con el VPS).",
    );
  }

  // Sin certificado y sin pasarela no hay forma de pedir un CAE. Pasa en el
  // deploy de Vercel, que a propósito no tiene el certificado: ARCA no atiende
  // a sus IPs, así que se emite levantando el panel localmente.
  if (!usaGateway && !process.env.ARCA_CERT_BASE64) {
    throw new ConfigError(
      "Esta instancia no está configurada para emitir. ARCA no acepta conexiones " +
        "desde los servidores de Vercel, así que la emisión se hace con el panel " +
        "corriendo en tu máquina: cloná el repo, poné el certificado en .env.local " +
        "y levantá con `pnpm dev`. El resto del panel funciona normalmente acá.",
    );
  }

  return {
    cuit,
    ptoVta,
    produccion,
    // Con pasarela el certificado no vive acá, así que no se exige.
    cert: usaGateway
      ? process.env.ARCA_CERT_BASE64
        ? pem("ARCA_CERT_BASE64")
        : ""
      : pem("ARCA_CERT_BASE64"),
    key: usaGateway
      ? process.env.ARCA_KEY_BASE64
        ? pem("ARCA_KEY_BASE64")
        : ""
      : pem("ARCA_KEY_BASE64"),
    gatewayUrl,
    gatewayToken: process.env.ARCA_GATEWAY_TOKEN ?? "",
    usaGateway,
    razonSocial: process.env.ARCA_RAZON_SOCIAL ?? "",
    domicilio: process.env.ARCA_DOMICILIO ?? "",
    inicioActividades: process.env.ARCA_INICIO_ACTIVIDADES ?? "",
    ingresosBrutos: process.env.ARCA_INGRESOS_BRUTOS ?? "no",
    actividad: process.env.ARCA_ACTIVIDAD ?? "",
    ambiente: produccion ? "produccion" : "homologacion",
  };
}

/** Date → "YYYYMMDD" (lo que espera WSFEv1). */
export function aFechaArca(iso: string): string {
  return iso.replace(/-/g, "").slice(0, 8);
}

/** "YYYYMMDD" → "YYYY-MM-DD". */
export function desdeFechaArca(v: string): string {
  const s = String(v);
  if (s.length !== 8) return s;
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}
