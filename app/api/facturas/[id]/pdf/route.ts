// Re-descarga del PDF de una factura ya emitida. No vuelve a tocar ARCA:
// sirve el PDF que se guardó en el momento de la emisión.
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/server/firebase-admin";
import { NoAutorizado, requireAdmin } from "@/lib/server/require-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(request);
  } catch (err) {
    const msg = err instanceof NoAutorizado ? err.message : "No autorizado";
    return NextResponse.json({ error: msg }, { status: 401 });
  }

  const { id } = await params;
  const snap = await adminDb().collection("facturas").doc(id).get();
  const data = snap.data();

  if (!snap.exists || !data?.pdfBase64) {
    return NextResponse.json(
      { error: "Esta factura no tiene PDF guardado." },
      { status: 404 },
    );
  }

  const buffer = Buffer.from(String(data.pdfBase64), "base64");
  const nombre = String(data.pdfNombre ?? `factura-${id}.pdf`);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${nombre}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
