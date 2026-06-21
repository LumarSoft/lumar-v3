import { NextResponse } from "next/server"
import { getApps, initializeApp, cert, type App } from "firebase-admin/app"
import { getFirestore, type QueryDocumentSnapshot } from "firebase-admin/firestore"
import { Resend } from "resend"
import { MEMBERS } from "@/lib/admin/members"

// firebase-admin requires the Node.js runtime (not Edge).
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function adminApp(): App {
  const existing = getApps()
  if (existing.length) return existing[0]
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
  if (!b64) throw new Error("Falta FIREBASE_SERVICE_ACCOUNT_BASE64")
  const json = JSON.parse(Buffer.from(b64, "base64").toString("utf8"))
  return initializeApp({ credential: cert(json) })
}

/** Fecha de hoy en horario de Argentina (UTC-3), YYYY-MM-DD. */
function todayARG(): string {
  const d = new Date(Date.now() - 3 * 3600 * 1000)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
    d.getUTCDate(),
  ).padStart(2, "0")}`
}

export async function GET(request: Request) {
  const auth = request.headers.get("authorization")
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) {
    return NextResponse.json({ error: "Falta RESEND_API_KEY o RESEND_FROM" }, { status: 500 })
  }

  let db
  try {
    db = getFirestore(adminApp())
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Credenciales" }, { status: 500 })
  }

  const today = todayARG()
  const snap = await db.collection("checkins").where("fecha", "==", today).get()
  const done = new Set<string>()
  snap.forEach((doc: QueryDocumentSnapshot) => done.add(String(doc.data().miembro ?? "")))

  const missing = MEMBERS.filter((m) => !done.has(m.name))
  if (missing.length === 0) {
    return NextResponse.json({ ok: true, sent: false, message: "Todos hicieron check-in" })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  await Promise.all(
    missing.map((m) =>
      resend.emails.send({
        from: process.env.RESEND_FROM as string,
        to: [m.email],
        subject: "🔥 Te falta el check-in de hoy — LumarSoft",
        html: `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;background:#09090b;color:#e4e4e7;padding:24px;border-radius:12px">
          <h2 style="margin:0 0 8px">Hola ${m.name}</h2>
          <p style="color:#a1a1aa;margin:0 0 16px;font-size:14px">Son más de las 20hs y todavía no registraste tu actividad de hoy. No rompas la racha 🔥</p>
          <a href="https://lumarsoft.com/admin/actividad" style="display:inline-block;background:#e4e4e7;color:#09090b;text-decoration:none;padding:8px 16px;border-radius:8px;font-size:14px;font-weight:600">Registrar check-in</a>
        </div>`,
      }),
    ),
  )

  return NextResponse.json({ ok: true, sent: true, missing: missing.map((m) => m.name) })
}
