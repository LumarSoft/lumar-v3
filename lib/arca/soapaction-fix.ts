// Workaround de un bug del SDK: WSAA rechaza el login con "no SOAPAction header!".
//
// EL BUG (@ramiidv/arca-common 0.1.0 y 0.2.0, dist/soap-client.js):
//
//     const headers = { 'Content-Type': 'text/xml; charset=utf-8' };
//     if (opts?.soapAction) {                     // '' es falsy…
//         headers['SOAPAction'] = `"${opts.soapAction}"`;   // …así que nunca entra
//     }
//
// El cliente de WSAA llama con `soapAction: ''`, con la intención de mandar un
// SOAPAction vacío. Como la cadena vacía es falsy, el header no se manda nunca.
// WSFE lo tolera (por eso serverStatus funciona), pero WSAA corre sobre Apache
// Axis, que exige el header presente aunque esté vacío, y responde HTTP 500 con
// el fault "no SOAPAction header!".
//
// SOLUCIÓN: interceptamos fetch y agregamos el header en los pedidos a WSAA que
// no lo traigan. El parche se instala una sola vez y no se desinstala, así que
// no hay carrera entre pedidos concurrentes (a diferencia de envolver/restaurar
// fetch en cada llamada).
//
// Se puede borrar este archivo cuando el SDK cambie el `if` por
// `if (opts?.soapAction !== undefined)`.
import "server-only";

const MARCA = Symbol.for("lumarsoft.arca.fix-soapaction");

function urlDe(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

/** Solo el endpoint de autenticación necesita el parche. */
function esWsaa(url: string): boolean {
  return /wsaa|logincms/i.test(url);
}

export function instalarFixSoapAction(): void {
  const global = globalThis as typeof globalThis & { [MARCA]?: boolean };
  if (global[MARCA]) return;

  const original = globalThis.fetch;

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    if (!esWsaa(urlDe(input))) return original(input, init);

    const headers = new Headers(
      init?.headers ??
        (typeof input === "object" && "headers" in input
          ? input.headers
          : undefined),
    );
    if (headers.has("SOAPAction")) return original(input, init);

    headers.set("SOAPAction", '""');
    return original(input, { ...init, headers });
  };

  global[MARCA] = true;
}
