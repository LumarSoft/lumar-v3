import type { OptionColor, SelectOption } from "@/lib/admin/schemas"

export interface Member {
  email: string
  name: string
  initials: string
  color: OptionColor
}

// Los 3 socios. El email debe coincidir con el allowlist.
export const MEMBERS: Member[] = [
  { email: "lucas.quaroni@gmail.com", name: "Lucas", initials: "LU", color: "blue" },
  { email: "marcebenitez0607@gmail.com", name: "Marcelo", initials: "MA", color: "green" },
  { email: "bodinidev@gmail.com", name: "Mateo", initials: "MB", color: "purple" },
]

export const MEMBER_OPTIONS: SelectOption[] = MEMBERS.map((m) => ({
  value: m.name,
  color: m.color,
}))

export function memberByName(name: string | null | undefined): Member | undefined {
  if (!name) return undefined
  return MEMBERS.find((m) => m.name.toLowerCase() === name.toLowerCase())
}

export function memberByEmail(email: string | null | undefined): Member | undefined {
  if (!email) return undefined
  return MEMBERS.find((m) => m.email.toLowerCase() === email.toLowerCase())
}
