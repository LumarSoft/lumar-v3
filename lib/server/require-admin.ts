// Guard de los endpoints del panel.
//
// POR QUÉ: la seguridad del panel hoy son las reglas de Firestore, pero una API
// route las esquiva por completo (corre con el service account, que es admin).
// Sin este chequeo, cualquiera en internet podría hacer POST a /api/facturas/emitir
// y emitir comprobantes fiscales con nuestro CUIT.
import "server-only";
import { getAuth } from "firebase-admin/auth";
import { adminApp } from "@/lib/server/firebase-admin";
import { isAllowedEmail } from "@/lib/admin/allowlist";

export interface AdminUser {
  uid: string;
  email: string;
}

export class NoAutorizado extends Error {}

/**
 * Valida el ID token de Firebase que manda el cliente y confirma que el mail
 * esté en el allowlist. Devuelve el usuario o tira NoAutorizado.
 */
export async function requireAdmin(request: Request): Promise<AdminUser> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) throw new NoAutorizado("Falta el token de sesión.");

  let decoded;
  try {
    decoded = await getAuth(adminApp()).verifyIdToken(token);
  } catch {
    throw new NoAutorizado("Sesión inválida o vencida. Volvé a entrar.");
  }

  if (!decoded.email_verified || !isAllowedEmail(decoded.email)) {
    throw new NoAutorizado("Tu cuenta no está autorizada.");
  }

  return { uid: decoded.uid, email: decoded.email as string };
}
