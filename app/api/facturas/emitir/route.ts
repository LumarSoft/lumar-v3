// Emisión de un comprobante en ARCA. Server-only: acá vive el certificado.
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { ConfigError, leerConfig } from "@/lib/arca/config";
import {
  ArcaRechazo,
  emitirFacturaC,
  type DatosEmision,
} from "@/lib/arca/emitir";
import { renderFacturaPdf } from "@/lib/facturas/pdf";
import { adminDb } from "@/lib/server/firebase-admin";
import { NoAutorizado, requireAdmin } from "@/lib/server/require-admin";
import { nombrePdf } from "@/lib/admin/facturas";

// firebase-admin y @react-pdf/renderer necesitan Node, no Edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// ARCA responde de forma errática a IPs no argentinas: desde iad1 (Washington)
// `wsaa.afip.gov.ar` contesta pero `servicios1.afip.gov.ar` tira "fetch failed".
// gru1 (São Paulo) es la región de Vercel más cercana a Argentina.
export const preferredRegion = "gru1";
export const maxDuration = 60;

interface Body extends DatosEmision {
  facturaId: string;
  periodo: string;
  cliente: string;
  enviarMail?: boolean;
  emailDestino?: string;
}

function error(mensaje: string, detalle?: string, status = 400) {
  return NextResponse.json({ error: mensaje, detalle }, { status });
}

export async function POST(request: Request) {
  // 1. Quién sos.
  let quien;
  try {
    quien = await requireAdmin(request);
  } catch (err) {
    if (err instanceof NoAutorizado) return error(err.message, undefined, 401);
    return error("No se pudo validar la sesión", undefined, 401);
  }

  const body = (await request.json()) as Body;
  if (!body?.facturaId) return error("Falta el id de la factura");

  // 2. Configuración del emisor (certificado, CUIT, punto de venta).
  let cfg;
  try {
    cfg = leerConfig();
  } catch (err) {
    if (err instanceof ConfigError) return error(err.message, undefined, 500);
    throw err;
  }

  const db = adminDb();
  const ref = db.collection("facturas").doc(body.facturaId);

  // 3. Candado anti doble-click / doble-pestaña. Emitir dos veces el mismo
  //    período obliga a una nota de crédito, así que lo cortamos acá.
  const clave = `${body.facturaId}_${body.periodo}`;
  const lockRef = db.collection("arca_emisiones").doc(clave);
  const libre = await db.runTransaction(async (tx) => {
    const snap = await tx.get(lockRef);
    const d = snap.data() as { estado?: string; hasta?: number } | undefined;
    if (d?.estado === "ok") return false;
    if (d?.estado === "en_curso" && (d.hasta ?? 0) > Date.now()) return false;
    tx.set(lockRef, {
      estado: "en_curso",
      hasta: Date.now() + 90_000,
      porQuien: quien.email,
    });
    return true;
  });

  if (!libre) {
    return error(
      "Ese período ya se está emitiendo (o ya se emitió)",
      "Refrescá la página para ver el estado real.",
      409,
    );
  }

  // 4. La emisión propiamente dicha.
  let resultado;
  try {
    resultado = await emitirFacturaC(cfg, body);
  } catch (err) {
    await lockRef.set({ estado: "error", hasta: 0 }, { merge: true });
    if (err instanceof ArcaRechazo) {
      return error(err.message, err.detalle, 422);
    }
    const msg = err instanceof Error ? err.message : "Error desconocido";
    console.error("Error emitiendo en ARCA:", err);
    return error("No se pudo emitir", msg, 502);
  }

  // Desde acá el CAE YA EXISTE en ARCA. Cualquier fallo posterior (PDF, mail)
  // no puede invalidar la factura: lo registramos pero devolvemos éxito.
  await lockRef.set(
    { estado: "ok", hasta: 0, cae: resultado.cae, cbteNro: resultado.cbteNro },
    { merge: true },
  );

  const archivo = nombrePdf({
    concepto: body.concepto,
    cliente: body.cliente,
    periodo: body.periodo,
    fecha: body.fechaEmision,
  });

  let pdf: Buffer | null = null;
  let avisoPdf: string | undefined;
  try {
    pdf = await renderFacturaPdf({ cfg, datos: body, resultado });
    // Guardamos el PDF en el documento para poder re-descargarlo después
    // sin volver a tocar ARCA. Un PDF de una página entra holgado en el
    // límite de 1 MB por documento de Firestore.
    const b64 = pdf.toString("base64");
    if (b64.length < 900_000) {
      await ref.set({ pdfBase64: b64, pdfNombre: archivo }, { merge: true });
    }
  } catch (err) {
    console.error("CAE obtenido pero falló el PDF:", err);
    avisoPdf = "El CAE se obtuvo, pero falló la generación del PDF.";
  }

  // 5. Mail al cliente con el PDF adjunto (opcional).
  let avisoMail: string | undefined;
  if (body.enviarMail && body.emailDestino && pdf) {
    if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) {
      avisoMail = "Falta configurar RESEND_API_KEY / RESEND_FROM.";
    } else {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const r = await resend.emails.send({
          from: process.env.RESEND_FROM,
          to: [body.emailDestino],
          subject: `Factura ${String(resultado.ptoVta).padStart(5, "0")}-${String(
            resultado.cbteNro,
          ).padStart(8, "0")} — ${cfg.razonSocial || "LumarSoft"}`,
          html: `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#111">
            <p>Hola,</p>
            <p>Te adjuntamos la factura correspondiente a <b>${body.concepto}</b>.</p>
            <p>Importe: <b>${new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(resultado.importe)}</b><br>
            Vencimiento de pago: ${body.vtoPago}</p>
            <p>Cualquier duda, respondé este mail.</p>
            <p>${cfg.razonSocial || "LumarSoft"}</p>
          </div>`,
          attachments: [{ filename: archivo, content: pdf.toString("base64") }],
        });
        // Resend no tira excepción ante errores de API: los devuelve.
        if (r.error)
          avisoMail = `No se pudo enviar el mail: ${r.error.message}`;
      } catch (err) {
        avisoMail =
          err instanceof Error ? err.message : "No se pudo enviar el mail.";
      }
    }
  }

  return NextResponse.json({
    ...resultado,
    ambiente: cfg.ambiente,
    archivo,
    // Va en la respuesta para que el navegador lo descargue al instante,
    // sin una segunda vuelta al servidor.
    pdfBase64: pdf ? pdf.toString("base64") : null,
    avisos: [avisoPdf, avisoMail].filter(Boolean),
  });
}
