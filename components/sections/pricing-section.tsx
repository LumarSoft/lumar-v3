"use client"

import { motion } from "framer-motion"

const values = [
  {
    number: "01",
    title: "Antes de cotizarte, te preguntamos.",
    description:
      "Escuchamos el problema antes de proponer una solución. No asumimos lo que necesitás — hacemos las preguntas que nadie más hace.",
  },
  {
    number: "02",
    title: "Te hablamos en castellano.",
    description:
      "Sin tecnicismos innecesarios, sin humo. Si no entendés algo, es nuestro problema explicarlo mejor, no tuyo entenderlo.",
  },
  {
    number: "03",
    title: "Fechas reales, no optimistas.",
    description:
      "Si algo tarda dos semanas, te decimos dos semanas. Procesos claros, hitos definidos, sin sorpresas de último momento.",
  },
  {
    number: "04",
    title: "El proyecto es tuyo.",
    description:
      "Código limpio, documentado, sin dependencias artificiales con nosotros. Cuando entregamos, entregamos de verdad.",
  },
]

export function PricingSection() {
  return (
    <section id="valores" className="px-6 py-24">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">Cómo trabajamos</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-zinc-100 max-w-lg leading-tight">
            No son valores en un PDF. Son comportamientos.
          </h2>
        </motion.div>

        <div className="space-y-px bg-zinc-800/30 rounded-2xl overflow-hidden">
          {values.map((value, i) => (
            <motion.div
              key={value.number}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group flex gap-8 p-8 bg-zinc-950 hover:bg-zinc-900/60 transition-colors duration-300"
            >
              <motion.span
                initial={{ opacity: 0, scale: 1.4 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 + 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-4xl font-bold text-zinc-800 group-hover:text-zinc-600 transition-colors shrink-0 leading-none mt-1 tabular-nums"
              >
                {value.number}
              </motion.span>
              <div>
                <h3 className="font-display text-lg font-semibold text-zinc-100 mb-2">{value.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed max-w-xl">{value.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
