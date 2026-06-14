// Central site configuration. Change contact details in one place.

export const SITE = {
  name: "LumarSoft",
  url: "https://lumarsoft.com",
  whatsapp: "5493415690470",
  /** Teléfono en formato E.164 para structured data. */
  phone: "+5493415690470",
  location: "Rosario, Argentina",
  city: "Rosario",
  region: "Santa Fe",
  country: "AR",
} as const

/** Fundadores — usados en structured data (sameAs apunta a sus perfiles). */
export const FOUNDERS = [
  {
    name: "Lucas Quaroni",
    sameAs: ["https://www.linkedin.com/in/lucasquaroni/", "https://github.com/LucasQuaroni"],
  },
  {
    name: "Marcelo Benitez",
    sameAs: ["https://www.linkedin.com/in/benitez-marcelo/", "https://github.com/marcebenitez2"],
  },
  {
    name: "Mateo Bodini",
    sameAs: ["https://www.linkedin.com/in/mateobodini/", "https://github.com/mateoBodiniARG"],
  },
] as const

/** Build a wa.me link, optionally pre-filled with a message. */
export function whatsappUrl(message?: string) {
  const base = `https://wa.me/${SITE.whatsapp}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
