"use client";

import { motion } from "framer-motion";

const painPoints = [
  {
    pain: '"Me entregaron algo genérico con mi logo pegado."',
    solution:
      "Cada proyecto arranca con un proceso de discovery: entendemos tu negocio antes de proponer cualquier solución. Nada de templates adaptados.",
  },
  {
    pain: '"El desarrollador desapareció a mitad del proyecto."',
    solution:
      "Trabajás directamente con el equipo que ejecuta. Actualizaciones regulares, seguimiento activo y canal de comunicación siempre abierto.",
  },
  {
    pain: '"No entendí nada de lo que me explicaron."',
    solution:
      "Documentamos todo en términos que hacen sentido para tu negocio. Sabés exactamente qué se está construyendo, para qué y cuándo.",
  },
  {
    pain: '"Tardaron meses y el resultado fue mediocre."',
    solution:
      "Planificamos con fechas reales desde el primer día. Cada etapa tiene hitos claros y vos aprobás antes de avanzar a la siguiente.",
  },
];

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
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">
            ¿Te suena esto?
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-zinc-100 max-w-lg leading-tight">
            Malas experiencias que no deberían repetirse.
          </h2>
          <p className="text-zinc-500 mt-4 max-w-xl text-sm leading-relaxed">
            Las escuchamos seguido. Por eso construimos un proceso que elimina
            cada uno de estos problemas desde el principio.
          </p>
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
              <p className="text-zinc-300 text-sm leading-relaxed">
                {item.solution}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
