// Emails allowed into /admin. This is the source of truth for the UI guard.
// IMPORTANT: this same list must be mirrored in firestore.rules so the database
// itself rejects anyone not on it (the client guard alone is not security).
//
// TODO: reemplazar los placeholders por los mails reales de Marcelo y Mateo.
export const ADMIN_ALLOWLIST: readonly string[] = [
  "lucas.quaroni@gmail.com",
  "marcebenitez0607@gmail.com",
  "bodinidev@gmail.com",
] as const

export function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return ADMIN_ALLOWLIST.map((e) => e.toLowerCase()).includes(email.toLowerCase())
}
