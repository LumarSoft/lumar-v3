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

    if (!esWsaa(url)) return original(destino, init);

    const headers = new Headers(
      init?.headers ??
        (typeof input === "object" && "headers" in input
          ? input.headers
          : undefined),
    );
    if (headers.has("SOAPAction")) return original(destino, init);

    headers.set("SOAPAction", '""');
    return original(destino, { ...init, headers });
  };

  global[MARCA] = true;
}
