// Ajustes de red para hablar con ARCA. Todos scopeados a los hosts de ARCA:
// ninguna otra conexión de la app se ve afectada.
//
// ── PROBLEMA 1: TLS, "dh key too small" ─────────────────────────────────
// Los servidores de ARCA negocian Diffie-Hellman con una clave de 1024 bits.
// OpenSSL 3 exige 2048 a partir de SECLEVEL=2, que es el default en el runtime
// de Vercel. Resultado: `ERR_SSL_DH_KEY_TOO_SMALL` y el pedido nunca sale.
// (Node en otras máquinas puede aceptarlo — por eso anda en local y en el VPS.)
//
// No se puede bajar el SECLEVEL solo para un host con `fetch`, así que los
// pedidos a ARCA se hacen con node:https, que sí acepta opciones TLS por
// conexión. El resto de la app (Firestore, Resend) sigue con TLS estricto.
//
// ── PROBLEMA 2: el SDK no manda el header SOAPAction ────────────────────
// En @ramiidv/arca-common el soap-client hace `if (opts?.soapAction)` y WSAA lo
// llama con '', que es falsy: el header nunca sale. WSFE lo tolera; WSAA corre
// sobre Apache Axis y responde HTTP 500 con "no SOAPAction header!".
//
// ── PROBLEMA 3: el error real queda oculto ──────────────────────────────
// `fetch` reporta todo como "fetch failed" y guarda el motivo en `err.cause`.
// El SDK hace `new ArcaSoapError(err.message)`, o sea que lo descarta. Acá lo
// pegamos al mensaje antes de que se pierda.
import "server-only";
import https from "node:https";

const MARCA = Symbol.for("lumarsoft.arca.fix-red");

function urlDe(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

function esArca(url: string): boolean {
  return /\.afip\.(gov|gob)\.ar/i.test(url);
}

/** Solo el endpoint de autenticación necesita el header SOAPAction. */
function esWsaa(url: string): boolean {
  return /wsaa|logincms/i.test(url);
}

/** Estos códigos de estado no admiten body en un Response. */
const SIN_BODY = new Set([101, 103, 204, 205, 304]);

/**
 * Hace el pedido con node:https para poder bajar el nivel de seguridad TLS
 * solo en esta conexión, y devuelve un Response normal para que el SDK no note
 * la diferencia.
 */
function pedirConTlsRelajado(
  url: string,
  init: RequestInit | undefined,
  headers: Headers,
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const cabeceras: Record<string, string> = {};
    headers.forEach((v, k) => {
      cabeceras[k] = v;
    });

    const req = https.request(
      {
        hostname: u.hostname,
        port: u.port || 443,
        path: `${u.pathname}${u.search}`,
        method: (init?.method ?? "GET").toUpperCase(),
        headers: cabeceras,
        // La razón de ser de todo este rodeo.
        ciphers: "DEFAULT@SECLEVEL=1",
        minVersion: "TLSv1.2",
        timeout: 45_000,
      },
      (res) => {
        const partes: Buffer[] = [];
        res.on("data", (c: Buffer) => partes.push(c));
        res.on("end", () => {
          const estado = res.statusCode ?? 0;
          const cuerpo = Buffer.concat(partes);
          const salida = new Headers();
          for (const [k, v] of Object.entries(res.headers)) {
            if (Array.isArray(v)) v.forEach((x) => salida.append(k, x));
            else if (v != null) salida.set(k, String(v));
          }
          resolve(
            new Response(SIN_BODY.has(estado) ? null : new Uint8Array(cuerpo), {
              status: estado,
              statusText: res.statusMessage ?? "",
              headers: salida,
            }),
          );
        });
        res.on("error", reject);
      },
    );

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy(new Error("Timeout de 45s hablando con ARCA"));
    });

    const body = init?.body;
    if (body != null) {
      if (typeof body === "string") req.write(body);
      else if (body instanceof Uint8Array) req.write(Buffer.from(body));
      else req.write(String(body));
    }
    req.end();
  });
}

/** Desentierra el motivo real de un error de red y lo pega al mensaje. */
function conCausa(err: unknown, url: string): Error {
  const base = err instanceof Error ? err : new Error(String(err));
  const causa = (base as Error & { cause?: unknown }).cause;

  const detalles: string[] = [];
  // La causa directa del error también sirve: node:https tira códigos propios.
  const propio = [
    (base as Error & { code?: string }).code,
    causa ? undefined : base.message,
  ]
    .filter(Boolean)
    .join(": ");
  if (propio && propio !== base.message) detalles.push(propio);

  let actual: unknown = causa;
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
      : `${base.message} [${host}]`,
  );
  (enriquecido as Error & { cause?: unknown }).cause = causa ?? err;
  return enriquecido;
}

export function instalarFixRed(): void {
  const global = globalThis as typeof globalThis & { [MARCA]?: boolean };
  if (global[MARCA]) return;

  const original = globalThis.fetch;

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = urlDe(input);
    if (!esArca(url)) return original(input, init);

    const headers = new Headers(
      init?.headers ??
        (typeof input === "object" && "headers" in input
          ? input.headers
          : undefined),
    );
    if (esWsaa(url) && !headers.has("SOAPAction")) {
      headers.set("SOAPAction", '""');
    }

    try {
      return await pedirConTlsRelajado(url, init, headers);
    } catch (err) {
      throw conCausa(err, url);
    }
  };

  global[MARCA] = true;
}
