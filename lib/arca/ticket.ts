// Ticket de Acceso (TA) de WSAA, persistido en Firestore.
//
// POR QUÉ ESTO EXISTE:
// El TA de ARCA dura 12 horas y ARCA RECHAZA pedir uno nuevo mientras el
// anterior siga vigente ("El CEE ya posee un TA valido para el acceso al WSN
// solicitado"). En Vercel cada invocación puede ser un proceso nuevo, así que
// un cache en memoria pediría un TA por cold start y romperíamos la emisión.
// Por eso el TA vive en Firestore, compartido entre todas las instancias.
import "server-only";
import { WsaaClient } from "@ramiidv/arca-facturacion";
import { adminDb } from "@/lib/server/firebase-admin";
import type { EmisorConfig } from "@/lib/arca/config";
import { instalarFixRed } from "@/lib/arca/red";

// Parches de red para hablar con ARCA desde afuera del país. Ver el archivo.
instalarFixRed();

const COLECCION = "arca_auth";
const SERVICIO = "wsfe";

/** Renovamos 15 min antes de que expire, para no cortar una emisión a mitad. */
const MARGEN_MS = 15 * 60 * 1000;

/** Cuánto espera una instancia a que otra termine de loguearse. */
const LOCK_MS = 30 * 1000;

export interface Auth {
  Token: string;
  Sign: string;
  Cuit: number;
}

interface TicketDoc {
  token?: string;
  sign?: string;
  expiraEn?: number;
  lockHasta?: number;
}

function docId(cfg: EmisorConfig): string {
  return `${cfg.ambiente}_${cfg.cuit}_${SERVICIO}`;
}

function vigente(d: TicketDoc | undefined): boolean {
  return Boolean(
    d?.token && d?.sign && (d.expiraEn ?? 0) > Date.now() + MARGEN_MS,
  );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Devuelve un TA válido, reutilizando el guardado si todavía sirve.
 * Si dos requests coinciden, solo una hace el login; la otra espera y lo lee.
 */
export async function obtenerAuth(cfg: EmisorConfig): Promise<Auth> {
  const ref = adminDb().collection(COLECCION).doc(docId(cfg));

  const guardado = (await ref.get()).data() as TicketDoc | undefined;
  if (vigente(guardado)) {
    return { Token: guardado!.token!, Sign: guardado!.sign!, Cuit: cfg.cuit };
  }

  // Solo una instancia debe loguearse. El resto espera a que escriba el TA.
  const gane = await adminDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const d = snap.data() as TicketDoc | undefined;
    if (vigente(d)) return false; // otra instancia ya lo renovó
    if ((d?.lockHasta ?? 0) > Date.now()) return false; // otra está en eso
    tx.set(ref, { lockHasta: Date.now() + LOCK_MS }, { merge: true });
    return true;
  });

  if (!gane) {
    // Esperamos a que la otra instancia publique el TA.
    for (let i = 0; i < 15; i++) {
      await sleep(1000);
      const d = (await ref.get()).data() as TicketDoc | undefined;
      if (vigente(d)) {
        return { Token: d!.token!, Sign: d!.sign!, Cuit: cfg.cuit };
      }
    }
    throw new Error(
      "Timeout esperando el ticket de acceso de ARCA. Reintentá en un minuto.",
    );
  }

  try {
    const wsaa = new WsaaClient({
      cert: cfg.cert,
      key: cfg.key,
      production: cfg.produccion,
    });
    const ta = await wsaa.getAccessTicket(SERVICIO);
    await ref.set(
      {
        token: ta.token,
        sign: ta.sign,
        expiraEn: new Date(ta.expirationTime).getTime(),
        lockHasta: 0,
        actualizadoEn: Date.now(),
      },
      { merge: true },
    );
    return { Token: ta.token, Sign: ta.sign, Cuit: cfg.cuit };
  } catch (err) {
    // Soltamos el lock para no bloquear el próximo intento 30 segundos.
    await ref.set({ lockHasta: 0 }, { merge: true }).catch(() => {});

    const msg = err instanceof Error ? err.message : String(err);
    // Caso clásico: quedó un TA vivo en ARCA que nosotros perdimos (ej. se
    // borró la colección). No hay forma de recuperarlo: hay que esperar.
    if (/ya posee un TA valido|alreadyAuthenticated/i.test(msg)) {
      throw new Error(
        "ARCA dice que ya hay un ticket de acceso vigente que este servidor no tiene guardado. " +
          "Esperá hasta 12hs a que expire, o emití desde el portal mientras tanto.",
      );
    }
    throw err;
  }
}
