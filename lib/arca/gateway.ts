// Emisión a través de la pasarela del VPS.
//
// POR QUÉ: ARCA no atiende de forma confiable a IPs fuera de Argentina. Desde
// Vercel, WSAA responde pero servicios1.afip.gov.ar tira "fetch failed". El VPS
// de apis.flyspirits.com.ar sí llega, así que oficia de intermediario: le
// mandamos los datos, pide el CAE y nos lo devuelve.
//
// El certificado vive solo en el VPS. Acá nos quedamos con el PDF, Firestore y
// el mail — la parte que no necesita hablar con ARCA.
//
// Del otro lado: flyspirits-api/src/lumarsoft/
import "server-only";
import type { EmisorConfig } from "@/lib/arca/config";
import {
  ArcaRechazo,
  type DatosEmision,
  type ResultadoEmision,
} from "@/lib/arca/emitir";

/** El VPS puede tardar: WSAA + WSFE encadenados sobre SOAP no son rápidos. */
const TIMEOUT_MS = 45_000;

async function pedir(
  cfg: EmisorConfig,
  ruta: string,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(`${cfg.gatewayUrl}${ruta}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.gatewayToken}`,
        ...init?.headers,
      },
      signal: controller.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(timer);
  }
}

function errorDeRed(err: unknown): ArcaRechazo {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("aborted") || msg.includes("abort")) {
    return new ArcaRechazo(
      "La pasarela no respondió a tiempo",
      "El VPS tardó más de 45s. Puede que ARCA esté lento. La factura NO se emitió, salvo que ARCA haya alcanzado a dar el CAE: revisá el diagnóstico antes de reintentar.",
    );
  }
  return new ArcaRechazo(
    "No se pudo contactar la pasarela de facturación",
    `${msg}. Verificá que el VPS esté levantado y que ARCA_GATEWAY_URL sea correcta.`,
  );
}

/** Pide el CAE al VPS. Misma firma que emitirFacturaC para que sean intercambiables. */
export async function emitirViaGateway(
  cfg: EmisorConfig,
  datos: DatosEmision,
): Promise<ResultadoEmision> {
  let res: Response;
  try {
    res = await pedir(cfg, "/emitir", {
      method: "POST",
      body: JSON.stringify(datos),
    });
  } catch (err) {
    throw errorDeRed(err);
  }

  const data = await res.json().catch(() => null);

  if (!res.ok || !data?.cae) {
    // 422 = ARCA rechazó el comprobante; el resto, problema de la pasarela.
    throw new ArcaRechazo(
      data?.error ?? `La pasarela respondió ${res.status}`,
      data?.detalle,
    );
  }

  return {
    cae: String(data.cae),
    caeVto: String(data.caeVto),
    cbteNro: Number(data.cbteNro),
    ptoVta: Number(data.ptoVta),
    cbteTipo: Number(data.cbteTipo),
    importe: Number(data.importe),
    qrUrl: String(data.qrUrl),
    observaciones: Array.isArray(data.observaciones) ? data.observaciones : [],
  };
}

export interface PasoGateway {
  paso: string;
  ok: boolean;
  detalle?: unknown;
}

/** Trae el diagnóstico del VPS para mostrarlo junto al nuestro. */
export async function diagnosticoViaGateway(
  cfg: EmisorConfig,
): Promise<PasoGateway[]> {
  const pasos: PasoGateway[] = [];

  // ¿Está viva la pasarela y llega a ARCA?
  try {
    const res = await pedir(cfg, "/health");
    const data = await res.json().catch(() => null);
    pasos.push({
      paso: "Pasarela del VPS",
      ok: res.ok && data?.alcanzaArca === true,
      detalle: data ?? `Respondió ${res.status}`,
    });
    if (!res.ok) return pasos;
  } catch (err) {
    pasos.push({
      paso: "Pasarela del VPS",
      ok: false,
      detalle: {
        error: err instanceof Error ? err.message : String(err),
        url: cfg.gatewayUrl,
        queSignifica:
          "No se pudo contactar el VPS. Revisá que esté levantado, que la URL sea correcta y que el token coincida.",
      },
    });
    return pasos;
  }

  // Certificado, WSAA y puntos de venta, vistos desde el VPS.
  try {
    const res = await pedir(cfg, "/diagnostico");
    const data = await res.json().catch(() => null);
    for (const p of (data?.pasos ?? []) as PasoGateway[]) {
      pasos.push({ ...p, paso: `${p.paso} (en el VPS)` });
    }
    if (!data?.pasos) {
      pasos.push({
        paso: "Diagnóstico del VPS",
        ok: false,
        detalle: data ?? `Respondió ${res.status}`,
      });
    }
  } catch (err) {
    pasos.push({
      paso: "Diagnóstico del VPS",
      ok: false,
      detalle: err instanceof Error ? err.message : String(err),
    });
  }

  return pasos;
}
