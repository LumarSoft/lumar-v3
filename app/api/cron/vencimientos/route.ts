import { NextResponse } from "next/server";
import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import {
  getFirestore,
  type QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { Resend } from "resend";
import { ADMIN_ALLOWLIST } from "@/lib/admin/allowlist";
import { cobroDueDate, cobroPaidForMonth } from "@/lib/admin/cobros";

// firebase-admin requires the Node.js runtime (not Edge).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NOTIFY_DAYS = Number(process.env.NOTIFY_DAYS ?? 7);

function adminApp(): App {
  const existing = getApps();
  if (existing.length) return existing[0];
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!b64) throw new Error("Falta FIREBASE_SERVICE_ACCOUNT_BASE64");
  const json = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
  return initializeApp({ credential: cert(json) });
}

function daysUntil(value: string): number {
  const d = new Date(value);
  const today = new Date();
  const a = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const b = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((a - b) / 86400000);
}

interface Item {
  concepto: string;
  detalle: string;
  fecha: string;
  days: number;
  monto?: number;
}

function fmtArs(n?: number): string {
  if (!n) return "";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

export async function GET(request: Request) {
  // Vercel Cron envía Authorization: Bearer <CRON_SECRET> si está configurado.
  const auth = request.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) {
    return NextResponse.json(
      { error: "Falta RESEND_API_KEY o RESEND_FROM" },
      { status: 500 },
    );
  }

  let db;
  try {
    db = getFirestore(adminApp());
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error de credenciales" },
      { status: 500 },
    );
  }

  const items: Item[] = [];

  // Vencimientos: servidores, gastos internos y cobros de clientes.
  const vSnap = await db.collection("vencimientos").get();
  vSnap.forEach((doc: QueryDocumentSnapshot) => {
    const v = doc.data();
    if (!v.vencimiento || v.estado === "Pagar") return;
    const days = daysUntil(String(v.vencimiento));
    if (days <= NOTIFY_DAYS) {
      items.push({
        concepto: String(v.concepto ?? "Vencimiento"),
        detalle: [v.tipo, v.proveedor].filter(Boolean).join(" · "),
        fecha: String(v.vencimiento),
        days,
        monto: Number(v.monto) || undefined,
      });
    }
  });

  // Cobros próximos que todavía no se cobraron (puntuales por vencimiento, recurrentes por día).
  const cSnap = await db.collection("cobros").get();
  cSnap.forEach((doc: QueryDocumentSnapshot) => {
    const c = doc.data();
    if (cobroPaidForMonth(c)) return;
    const due = cobroDueDate(c);
    if (!due) return;
    const days = daysUntil(due);
    if (days <= NOTIFY_DAYS) {
      items.push({
        concepto: String(c.concepto ?? "Cobro"),
        detalle: ["Cobro", c.cliente].filter(Boolean).join(" · "),
        fecha: due,
        days,
        monto: Number(c.monto) || undefined,
      });
    }
  });

  if (items.length === 0) {
    return NextResponse.json({
      ok: true,
      sent: false,
      message: "Nada por vencer",
    });
  }

  items.sort((a, b) => a.days - b.days);

  const rows = items
    .map((it) => {
      const when =
        it.days < 0
          ? `vencido hace ${Math.abs(it.days)}d`
          : it.days === 0
            ? "vence hoy"
            : `en ${it.days} días`;
      const color =
        it.days <= 0 ? "#f87171" : it.days <= 3 ? "#fb923c" : "#eab308";
      return `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #27272a;color:#e4e4e7">${it.concepto}${it.monto ? ` — <b>${fmtArs(it.monto)}</b>` : ""}<br><span style="color:#a1a1aa;font-size:12px">${it.detalle}</span></td>
        <td style="padding:8px 12px;border-bottom:1px solid #27272a;color:${color};white-space:nowrap;text-align:right">${when}<br><span style="color:#71717a;font-size:12px">${it.fecha}</span></td>
      </tr>`;
    })
    .join("");

  const html = `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;background:#09090b;color:#e4e4e7;padding:24px;border-radius:12px">
    <h2 style="margin:0 0 4px">LumarSoft — Vencimientos próximos</h2>
    <p style="color:#a1a1aa;margin:0 0 16px;font-size:14px">${items.length} ítem(s) vencen dentro de ${NOTIFY_DAYS} días.</p>
    <table style="width:100%;border-collapse:collapse">${rows}</table>
    <p style="color:#71717a;font-size:12px;margin-top:16px">Revisalos en el panel → /admin/vencimientos</p>
  </div>`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const result = await resend.emails.send({
    from: process.env.RESEND_FROM as string,
    to: [...ADMIN_ALLOWLIST],
    subject: `⏰ ${items.length} vencimiento(s) próximos — LumarSoft`,
    html,
  });

  // Resend NO tira excepción ante errores de API (dominio sin verificar, etc.):
  // devuelve { error }. Lo surfaceamos para poder depurar.
  if (result.error) {
    console.error("Resend error:", result.error);
    return NextResponse.json(
      {
        ok: false,
        count: items.length,
        from: process.env.RESEND_FROM,
        to: [...ADMIN_ALLOWLIST],
        resendError: result.error,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    sent: true,
    count: items.length,
    id: result.data?.id,
  });
}
