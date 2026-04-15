"use client"

import { motion } from "motion/react"
import Image from "next/image"

const projects = [
  {
    client: "END SRL",
    category: "Rediseño web",
    description:
      "Talleres aeronáuticos con una web que no transmitía la seriedad de su trabajo. Rediseñamos todo para que sus clientes entiendan en segundos qué hacen y por qué confiar en ellos.",
    image: "/0.png",
  },
  {
    client: "UESEVI",
    category: "Landing Page",
    description:
      "El gremio necesitaba un lugar donde sus afiliados encontraran información rápido, sin perderse. Diseño limpio, claro, sin distracciones.",
    image: "/1.png",
  },
  {
    client: "UESEVI",
    category: "Panel de Administración",
    description:
      "Gestionar una organización grande con planillas de Excel es un caos. Construimos una plataforma interna que les ahorró horas de trabajo por semana.",
    image: "/2.png",
  },
  {
    client: "E-commerce Tecnología",
    category: "Tienda online",
    description:
      "Querían vender online pero sin perder el contacto directo con el comprador. Creamos un e-commerce que deriva cada venta al chat del vendedor para cerrarla de forma personalizada.",
    image: "/3.png",
  },
  {
    client: "John Pellegrini Management",
    category: "Sistema de gestión",
    description:
      "Una aseguradora con cientos de clientes y toda la info dispersa. Desarrollamos un sistema seguro para centralizar y gestionar todo desde un solo lugar.",
    image: "/4.png",
  },
  {
    client: "Mutual de Suboficiales de Gendarmería",
    category: "Sistema automatizado",
    description:
      "Necesitaban gestionar membresías y sorteos sin margen de error. Sistema automatizado con reportes en tiempo real y cero posibilidad de irregularidades.",
    image: "/5.png",
  },
]

export function TestimonialsSection() {
  return (
    <section id="portfolio" className="px-6 py-24 bg-zinc-900/20">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">Portfolio</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-zinc-100 max-w-lg leading-tight">
            Proyectos reales, problemas reales.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, i) => (
            <motion.div
              key={`${project.client}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="group rounded-2xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700/50 overflow-hidden transition-all duration-300 flex flex-col"
            >
              {/* Image */}
              <div className="aspect-video bg-zinc-800/50 overflow-hidden relative">
                <Image
                  src={project.image}
                  alt={project.client}
                  fill
                  className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  onError={() => {}}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-zinc-500 bg-zinc-800/80 px-2.5 py-1 rounded-full">{project.category}</p>
                </div>
                <h3 className="font-display text-base font-semibold text-zinc-100 mb-2">{project.client}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{project.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
