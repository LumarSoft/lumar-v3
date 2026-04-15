"use client"

import { motion } from "framer-motion"

const painPoints = [
  {
    pain: '"Me entregaron algo genérico con mi logo pegado."',
    solution: "Cada proyecto arranca desde cero. Escuchamos el problema antes de escribir una línea de código.",
  },
  {
    pain: '"El desarrollador desapareció a mitad del proyecto."',
    solution: "Comunicación directa con quien hace el trabajo. Sin cuentas genéricas, sin intermediarios.",
  },
  {
    pain: '"No entendí nada de lo que me explicaron."',
    solution: "Te hablamos en castellano. Sin tecnicismos innecesarios, sin humo.",
  },
  {
    pain: '"Tardaron meses y el resultado fue mediocre."',
    solution: "Fechas reales, no optimistas. Si algo tarda dos semanas, te decimos dos semanas.",
  },
]

export function ImpactSection() {
  return (
    <section className="px-6 py-24 bg-zinc-900/20">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">¿Te suena esto?</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-zinc-100 max-w-lg leading-tight">
            Malas experiencias que no deberían repetirse.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-800/50 rounded-2xl overflow-hidden">
          {painPoints.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="p-8 bg-zinc-950 hover:bg-zinc-900/60 transition-colors duration-300 group"
            >
              <p className="text-zinc-500 text-sm italic mb-4 group-hover:text-zinc-400 transition-colors">
                {item.pain}
              </p>
              <div className="w-8 h-px bg-zinc-700 mb-4" />
              <p className="text-zinc-300 text-sm leading-relaxed">{item.solution}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
