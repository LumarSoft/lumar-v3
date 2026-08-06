// Ajustes de red para hablar con ARCA desde un servidor fuera de Argentina.
//
// PROBLEMA 1 — SOAPAction ausente (bug del SDK):
//   @ramiidv/arca-common hace `if (opts?.soapAction)` y WSAA lo llama con '',
//   que es falsy: el header nunca se manda. WSFE lo tolera, WSAA no, y responde
//   HTTP 500 con el fault "no SOAPAction header!".
//
// PROBLEMA 2 — servicios1 inalcanzable desde el exterior:
//   Desde Vercel (región iad1, EE.UU.) `wsaa.afip.gov.ar` responde pero
//   `servicios1.afip.gov.ar` tira "fetch failed". Está reportado que los
//   servicios de ARCA responden de forma errática desde IPs no argentinas.
//   ARCA además publica los mismos hosts bajo el dominio `afip.gob.ar`, que
//   suele resolver distinto. ARCA_USAR_DOMINIO_GOB=true reescribe el host para
//   probar esa vía sin tocar el SDK, que no permite override del endpoint WSFE.
//
// Ambos parches se instalan una sola vez y no se desinstalan, así que no hay
// carrera entre pedidos concurrentes.
import "server-only";

const MARCA = Symbol.for("lumarsoft.arca.fix-red");

function urlDe(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

/** Solo el endpoint de autenticación necesita el header SOAPAction. */
function esWsaa(url: string): boolean {
  return /wsaa|logincms/i.test(url);
}

function esArca(url: string): boolean {
  return /\.afip\.(gov|gob)\.ar/i.test(url);
}

/**
 * PROBLEMA 3 — el error real queda oculto.
 *
 * `fetch` de Node reporta cualquier fallo de red o TLS como "fetch failed" y
 * mete el motivo en `err.cause`. El SDK hace `new ArcaSoapError(err.message)`,
 * o sea que descarta el cause: nos quedamos con "fetch failed" pelado y sin
 * saber si fue DNS, certificado, TLS o un firewall.
 *
 * Como ya interceptamos el fetch, le pegamos el motivo al mensaje antes de que
 * el SDK lo pierda.
 */
function conCausa(err: unknown, url: string): Error {
  const base = err instanceof Error ? err : new Error(String(err));
  const causa = (base as Error & { cause?: unknown }).cause;

  const detalles: string[] = [];
  let actual: unknown = causa;
  // Las causas pueden venir anidadas (AggregateError, por ejemplo).
  for (let i = 0; i < 4 && actual; i++) {
    const c = actual as { code?: string; message?: string; cause?: unknown };
    const txt = [c.code, c.message].filter(Boolean).join(": ");
    if (txt && !detalles.includes(txt)) detalles.push(txt);
    if (Array.isArray((actual as { errors?: unknown[] }).errors)) {
      for (const e of (actual as { errors: unknown[] }).errors) {
        const ce = e as { code?: string; message?: string };
        const t = [ce.code, ce.message].filter(Boolean).join(": ");
        if (t && !detalles.includes(t)) detalles.push(t);
      }
    }
    actual = c.cause;
  }

  const host = (() => {
    try {
      return new URL(url).host;
    } catch {
      return url;
    }
  })();

  const enriquecido = new Error(
    detalles.length
      ? `${base.message} [${host}] — causa: ${detalles.join(" | ")}`
      : `${base.message} [${host}] — sin causa disponible`,
  );
  (enriquecido as Error & { cause?: unknown }).cause = causa;
  return enriquecido;
}

export function instalarFixRed(): void {
  const global = globalThis as typeof globalThis & { [MARCA]?: boolean };
  if (global[MARCA]) return;

  const original = globalThis.fetch;
  const usarGob = process.env.ARCA_USAR_DOMINIO_GOB === "true";

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    let url = urlDe(input);
    if (!esArca(url)) return original(input, init);

    let destino: RequestInfo | URL = input;
    if (usarGob && url.includes(".afip.gov.ar")) {
      url = url.replace(".afip.gov.ar", ".afip.gob.ar");
      destino = url;
    }

    let opciones = init;
    if (esWsaa(url)) {
      const headers = new Headers(
        init?.headers ??
          (typeof input === "object" && "headers" in input
            ? input.headers
            : undefined),
      );
      if (!headers.has("SOAPAction")) {
        headers.set("SOAPAction", '""');
        opciones = { ...init, headers };
      }
    }

    try {
      return await original(destino, opciones);
    } catch (err) {
      throw conCausa(err, url);
    }
  };

  global[MARCA] = true;
}
