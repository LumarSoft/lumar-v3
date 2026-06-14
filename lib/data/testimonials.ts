// Testimonios de clientes.
//
// Para agregar uno nuevo: copiá un objeto del array y completá los campos.
// - `image` es opcional. Si no hay foto, se muestra un avatar con las iniciales.
// - `rating` es opcional (1–5). Si no se define, no se muestran estrellas.
//
// NOTA: las citas están PARAFRASEADAS a partir de cada proyecto real (no son
// textuales). Cuando tengas la frase exacta de cada cliente, reemplazá `text`.

export type Testimonial = {
  /** El testimonio, en primera persona. */
  text: string
  /** Nombre de quien lo dice (persona o empresa). */
  name: string
  /** Cargo/sector + empresa, p.ej. "Talleres aeronáuticos". */
  role: string
  /** Foto opcional (ruta en /public). Si falta, se usan iniciales. */
  image?: string
  /** Estrellas opcionales, 1–5. */
  rating?: number
}

export const testimonials: Testimonial[] = [
  {
    text: "Nuestra web vieja no transmitía la seriedad de lo que hacemos. La rediseñaron de cero y ahora un cliente entiende en segundos por qué puede confiar en nosotros.",
    name: "END SRL",
    role: "Talleres aeronáuticos",
    rating: 5,
  },
  {
    text: "Queríamos vender online sin perder el contacto con el comprador. Armaron un e-commerce que deriva cada venta a nuestro chat. Tecnología sin perder lo personal.",
    name: "FULL E-commerce",
    role: "Retail & Tecnología",
    rating: 5,
  },
  {
    text: "Gestionábamos los aportes de más de 150 empresas con planillas de Excel. Lo que antes llevaba minutos por cálculo ahora se resuelve en segundos, sin errores.",
    name: "UESEVI",
    role: "Sindicato · Seguridad privada",
    rating: 5,
  },
  {
    text: "Teníamos varias sucursales y todo estaba fragmentado. Centralizaron tesorería, pagos y personal en una sola plataforma, y nos lo explicaron en castellano, sin humo.",
    name: "Heroica",
    role: "Gastronomía multi-sucursal",
    rating: 5,
  },
  {
    text: "Necesitábamos gestionar membresías y sorteos sin margen de error. El sistema automatizó todo, con reportes en tiempo real. Y cumplieron las fechas desde el día uno.",
    name: "Mutual de Suboficiales de Gendarmería",
    role: "Mutual",
    rating: 5,
  },
  {
    text: "Teníamos la información de cientos de clientes dispersa por todos lados. Desarrollaron un sistema seguro que centraliza y gestiona todo desde un solo lugar.",
    name: "John Pellegrini",
    role: "John Pellegrini Management Group",
    rating: 5,
  },
]
