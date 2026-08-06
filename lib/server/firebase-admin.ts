// Firebase Admin SDK — solo servidor. Requiere runtime nodejs (no Edge).
import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

export function adminApp(): App {
  const existing = getApps();
  if (existing.length) return existing[0];
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!b64) throw new Error("Falta FIREBASE_SERVICE_ACCOUNT_BASE64");
  const json = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
  return initializeApp({ credential: cert(json) });
}

export function adminDb(): Firestore {
  return getFirestore(adminApp());
}
