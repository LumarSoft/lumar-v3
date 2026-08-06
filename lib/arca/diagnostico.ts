// Herramientas para entender por qué falla la conexión con ARCA.
//
// El SDK tira `HTTP 500: Internal Server Error` a secas cuando WSAA rechaza el
// certificado, porque no lee el cuerpo de la respuesta. Pero WSAA devuelve las
// fallas como SOAP Fault DENTRO de ese 500, y ahí está el motivo real.
import "server-only";
import { X509Certificate, createPrivateKey } from "node:crypto";

/** Saca el <faultstring> de una respuesta SOAP de error. */
export function extraerFault(xml: string): string | null {
  const m = xml.match(/<faultstring>([\s\S]*?)<\/faultstring>/i);
  return m ? m[1].trim() : null;
}

/**
 * Ejecuta `fn` espiando las respuestas de WSAA para quedarse con el cuerpo de
 * las que fallan. Si `fn` tira, re-lanza el error con el motivo real de ARCA.
 *
 * Parchea `fetch` global, así que se usa solo en el diagnóstico (que es un
 * pedido puntual y manual), no en el camino de emisión.
 */
export async function conDetalleWsaa<T>(fn: () => Promise<T>): Promise<T> {
  const original = globalThis.fetch;
  let cuerpoFallo: string | null = null;

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const res = await original(input, init);
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    if (!res.ok && url.includes("wsaa")) {
      cuerpoFallo = await res
        .clone()
        .text()
        .catch(() => null);
    }
    return res;
  };

  try {
    return await fn();
  } catch (err) {
    const base = err instanceof Error ? err.message : String(err);
    const fault = cuerpoFallo ? extraerFault(cuerpoFallo) : null;
    if (fault) {
      const e = new Error(`${base}\n\nARCA respondió: ${fault}`);
      (e as Error & { fault?: string }).fault = fault;
      throw e;
    }
    throw err;
  } finally {
    globalThis.fetch = original;
  }
}

/** Traduce las fallas conocidas de WSAA a algo accionable. */
export function explicarFault(fault: string): string | null {
  const f = fault.toLowerCase();

  if (
    f.includes("cert.untrusted") ||
    f.includes("certificado no es de confianza")
  ) {
    return (
      "El certificado no está dado de alta en este ambiente. La causa más común " +
      "es haberlo generado en 'Administración de Certificados Digitales' " +
      "(producción) mientras el .env apunta a homologación. Para homologación " +
      "el certificado se saca por el servicio WSASS."
    );
  }
  if (f.includes("cert.expired")) {
    return "El certificado venció. Hay que generar uno nuevo y volver a darlo de alta.";
  }
  if (f.includes("cert.notyetvalid")) {
    return "El certificado todavía no entró en vigencia. Suele resolverse esperando unos minutos.";
  }
  if (f.includes("sign.invalid") || f.includes("cms.sign")) {
    return (
      "La firma no validó: la clave privada no corresponde al certificado. " +
      "Verificá que ARCA_KEY_BASE64 sea el .key con el que generaste el .csr."
    );
  }
  if (f.includes("alreadyauthenticated") || f.includes("ya posee un ta")) {
    return (
      "Ya hay un ticket de acceso vigente que este servidor no tiene guardado. " +
      "Los tickets duran 12hs; hay que esperar a que expire."
    );
  }
  if (f.includes("no soapaction header")) {
    return (
      "Bug del SDK: no manda el header SOAPAction que WSAA exige. Lo corrige " +
      "lib/arca/soapaction-fix.ts — si ves esto, ese parche no se está aplicando."
    );
  }
  if (f.includes("computador no autorizado") || f.includes("wsn")) {
    return (
      "El certificado existe pero no está autorizado al servicio wsfe. En WSASS " +
      "falta el paso 'Crear Autorización a Servicio' apuntando a wsfe."
    );
  }
  return null;
}

export interface InfoCertificado {
  sujeto: string;
  emisor: string;
  validoDesde: string;
  validoHasta: string;
  vigente: boolean;
  claveCoincide: boolean;
}

/**
 * Lee el certificado sin hablar con ARCA: vigencia, quién lo emitió y —lo más
 * útil— si la clave privada realmente corresponde a ese certificado.
 */
export function inspeccionarCertificado(
  certPem: string,
  keyPem: string,
): InfoCertificado {
  const cert = new X509Certificate(certPem);
  const ahora = Date.now();

  let claveCoincide = false;
  try {
    claveCoincide = cert.checkPrivateKey(createPrivateKey(keyPem));
  } catch {
    claveCoincide = false;
  }

  return {
    sujeto: cert.subject.replace(/\n/g, " · "),
    emisor: cert.issuer.replace(/\n/g, " · "),
    validoDesde: cert.validFrom,
    validoHasta: cert.validTo,
    vigente:
      new Date(cert.validFrom).getTime() <= ahora &&
      ahora <= new Date(cert.validTo).getTime(),
    claveCoincide,
  };
}
