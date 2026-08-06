// Chequeo de la conexión con ARCA. No emite nada: solo lee.
//
// Sirve para verificar, antes de arriesgar un comprobante real, que:
//   1. El certificado y la clave están bien cargados
//   2. WSAA acepta el certificado y devuelve un ticket de acceso
//   3. El certificado está autorizado al servicio wsfe
//   4. Qué puntos de venta tenés habilitados (con su número)
//   5. Cuál es el último comprobante emitido en el punto de venta configurado
import { NextResponse } from "next/server";
import { WsfeClient } from "@ramiidv/arca-facturacion";
import {
  CBTE_TIPO_FACTURA_C,
  ConfigError,
  leerConfig,
} from "@/lib/arca/config";
import { obtenerAuth } from "@/lib/arca/ticket";
import {
  conDetalleWsaa,
  explicarErrorRed,
  explicarFault,
  inspeccionarCertificado,
} from "@/lib/arca/diagnostico";
import { NoAutorizado, requireAdmin } from "@/lib/server/require-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// ARCA responde de forma errática a IPs no argentinas: desde iad1 (Washington)
// `wsaa.afip.gov.ar` contesta pero `servicios1.afip.gov.ar` tira "fetch failed".
// gru1 (São Paulo) es la región de Vercel más cercana a Argentina.
export const preferredRegion = "gru1";

interface Paso {
  paso: string;
  ok: boolean;
  detalle?: unknown;
}

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
  } catch (err) {
    const msg = err instanceof NoAutorizado ? err.message : "No autorizado";
    return NextResponse.json({ error: msg }, { status: 401 });
  }

  const pasos: Paso[] = [];

  // 1. Configuración
  let cfg;
  try {
    cfg = leerConfig();
    pasos.push({
      paso: "Configuración (.env)",
      ok: true,
      detalle: {
        ambiente: cfg.ambiente,
        cuit: cfg.cuit,
        ptoVta: cfg.ptoVta,
        razonSocial: cfg.razonSocial || "(vacío)",
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        pasos: [
          {
            paso: "Configuración (.env)",
            ok: false,
            detalle:
              err instanceof ConfigError ? err.message : "Error inesperado",
          },
        ],
      },
      { status: 500 },
    );
  }

  const wsfe = new WsfeClient(cfg.produccion);

  // 2. Servidores de ARCA (no requiere certificado)
  try {
    const status = await wsfe.serverStatus();
    pasos.push({ paso: "Servidores de ARCA", ok: true, detalle: status });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    pasos.push({
      paso: "Servidores de ARCA",
      ok: false,
      detalle: {
        error: msg,
        ...(explicarErrorRed(msg)
          ? { queSignifica: explicarErrorRed(msg) }
          : {}),
      },
    });
  }

  // 3. El certificado en sí, sin hablar con ARCA todavía.
  try {
    const info = inspeccionarCertificado(cfg.cert, cfg.key);
    // Los de homologación los firma la CA "Computadores Test".
    const esDePrueba = /computadores test/i.test(info.emisor);
    const ambienteCruzado = esDePrueba === cfg.produccion;

    pasos.push({
      paso: "Certificado (lectura local)",
      ok: info.vigente && info.claveCoincide && !ambienteCruzado,
      detalle: {
        ...info,
        tipo: esDePrueba ? "homologación (prueba)" : "producción",
        nota: !info.claveCoincide
          ? "La clave privada NO corresponde a este certificado. Revisá que ARCA_KEY_BASE64 sea el .key con el que generaste el .csr."
          : !info.vigente
            ? "El certificado está fuera de su período de validez."
            : ambienteCruzado
              ? esDePrueba
                ? "Certificado de HOMOLOGACIÓN con ARCA_PRODUCCION=true. No va a funcionar: generá el de producción por 'Administración de Certificados Digitales'."
                : "Certificado de PRODUCCIÓN con ARCA_PRODUCCION=false. Para emitir de prueba hace falta el de homologación (WSASS)."
              : "Certificado vigente, clave privada correcta y acorde al ambiente.",
      },
    });
  } catch (err) {
    pasos.push({
      paso: "Certificado (lectura local)",
      ok: false,
      detalle: `No pude leerlo: ${err instanceof Error ? err.message : String(err)}`,
    });
  }

  // 4. Ticket de acceso (WSAA)
  let auth;
  try {
    auth = await conDetalleWsaa(() => obtenerAuth(cfg));
    pasos.push({
      paso: "Ticket de acceso (WSAA)",
      ok: true,
      detalle: "ARCA aceptó el certificado y devolvió un ticket.",
    });
  } catch (err) {
    const fault = (err as Error & { fault?: string }).fault;
    pasos.push({
      paso: "Ticket de acceso (WSAA)",
      ok: false,
      detalle: {
        error: err instanceof Error ? err.message : String(err),
        ...(fault
          ? {
              queSignifica:
                explicarFault(fault) ??
                "Sin traducción conocida para esta falla.",
            }
          : {}),
      },
    });
    return NextResponse.json({ ok: false, pasos }, { status: 502 });
  }

  // 5. Puntos de venta habilitados.
  //
  // En homologación ARCA no replica el padrón de puntos de venta, así que este
  // método suele contestar "602 Sin Resultados". Es esperable y no impide
  // emitir: el chequeo que vale es el del paso siguiente.
  try {
    const puntos = await wsfe.getPuntosVenta(auth);
    const lista = Array.isArray(puntos) ? puntos : [puntos];

    // Para cada punto de venta habilitado, en qué número de Factura C va.
    // Así se ve de un vistazo cuál está en uso y cuál arranca de cero.
    const conNumeracion = await Promise.all(
      lista.map(async (p) => {
        const nro = Number((p as { Nro?: number }).Nro);
        try {
          const ultimo = await wsfe.ultimoComprobante(
            auth,
            nro,
            CBTE_TIPO_FACTURA_C,
          );
          return {
            ...(p as object),
            ultimaFacturaC: ultimo,
            proximaSeria: ultimo + 1,
            enUso: cfg.ptoVta === nro ? "← el del .env" : undefined,
          };
        } catch {
          return { ...(p as object), ultimaFacturaC: "no se pudo consultar" };
        }
      }),
    );

    pasos.push({
      paso: "Puntos de venta habilitados para Web Services",
      ok: true,
      detalle: conNumeracion,
    });

    const configurado = lista.find(
      (p) => Number((p as { Nro?: number }).Nro) === cfg.ptoVta,
    );
    pasos.push({
      paso: `El punto de venta ${cfg.ptoVta} del .env está habilitado`,
      ok: Boolean(configurado),
      detalle:
        configurado ??
        `No figura entre los habilitados para Web Services. Ojo: los puntos de venta del ` +
          `facturador en línea (RCEL) NO sirven acá, ARCA lleva padrones separados. ` +
          `Poné en ARCA_PTO_VTA alguno de los números de arriba.`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const sinResultados = /\b602\b|sin resultados/i.test(msg);
    pasos.push({
      paso: "Puntos de venta habilitados",
      // En homologación esto no es una falla: no hay padrón que consultar.
      ok: sinResultados && !cfg.produccion,
      detalle:
        sinResultados && !cfg.produccion
          ? {
              respuesta: msg,
              nota:
                "Esperable en homologación: ARCA no replica ahí el padrón de puntos " +
                "de venta. No impide emitir. El chequeo que vale es el de abajo.",
            }
          : {
              error: msg,
              ...(explicarErrorRed(msg)
                ? { queSignifica: explicarErrorRed(msg) }
                : {}),
            },
    });
  }

  // 6. Último comprobante emitido.
  //
  // Doble propósito: te dice con qué número sigue la próxima factura, y —al
  // responder sin error— confirma que WSFE acepta este punto de venta. Es la
  // verificación que realmente importa antes de emitir.
  try {
    const ultimo = await wsfe.ultimoComprobante(
      auth,
      cfg.ptoVta,
      CBTE_TIPO_FACTURA_C,
    );
    pasos.push({
      paso: `Punto de venta ${cfg.ptoVta} operativo para Factura C`,
      ok: true,
      detalle: {
        ultimoEmitido: ultimo,
        proximoNumero: ultimo + 1,
        nota:
          `WSFE respondió sin error, así que acepta el punto de venta ${cfg.ptoVta}. ` +
          `La próxima factura va a llevar el número ${ultimo + 1}.`,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    pasos.push({
      paso: `Punto de venta ${cfg.ptoVta} operativo para Factura C`,
      ok: false,
      detalle: {
        error: msg,
        nota:
          explicarErrorRed(msg) ??
          (/11002|empadronado|10016|602/i.test(msg)
            ? `El punto de venta ${cfg.ptoVta} no está habilitado para Web Services. ` +
              `Los del facturador en línea no sirven acá. Usá uno de los que lista el paso anterior.`
            : "No pude consultar el último comprobante."),
      },
    });
  }

  return NextResponse.json({ ok: pasos.every((p) => p.ok), pasos });
}
