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
  explicarFault,
  inspeccionarCertificado,
} from "@/lib/arca/diagnostico";
import { NoAutorizado, requireAdmin } from "@/lib/server/require-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    pasos.push({
      paso: "Servidores de ARCA",
      ok: false,
      detalle: err instanceof Error ? err.message : String(err),
    });
  }

  // 3. El certificado en sí, sin hablar con ARCA todavía.
  try {
    const info = inspeccionarCertificado(cfg.cert, cfg.key);
    pasos.push({
      paso: "Certificado (lectura local)",
      ok: info.vigente && info.claveCoincide,
      detalle: {
        ...info,
        nota: !info.claveCoincide
          ? "La clave privada NO corresponde a este certificado. Revisá que ARCA_KEY_BASE64 sea el .key con el que generaste el .csr."
          : !info.vigente
            ? "El certificado está fuera de su período de validez."
            : "Certificado vigente y clave privada correcta.",
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
    pasos.push({
      paso: "Puntos de venta habilitados",
      ok: true,
      detalle: lista,
    });

    const configurado = lista.find(
      (p) => Number((p as { Nro?: number }).Nro) === cfg.ptoVta,
    );
    pasos.push({
      paso: `El punto de venta ${cfg.ptoVta} del .env existe`,
      ok: Boolean(configurado),
      detalle:
        configurado ??
        "No aparece en la lista. Usá alguno de los números de arriba en ARCA_PTO_VTA.",
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
          : msg,
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
        nota: /empadronado|10016|602/i.test(msg)
          ? `WSFE no reconoce el punto de venta ${cfg.ptoVta}. Probá con 1, o con el número que diste de alta como "Web Services" en ARCA.`
          : "No pude consultar el último comprobante.",
      },
    });
  }

  return NextResponse.json({ ok: pasos.every((p) => p.ok), pasos });
}
