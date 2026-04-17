"use client";

import { motion } from "framer-motion";

const exchanges = [
  {
    client: "Me entregaron algo genérico con mi logo pegado.",
    response:
      "Antes de escribir una línea de código, entendemos tu negocio. Cada proyecto arranca desde cero — nada de templates adaptados.",
  },
  {
    client: "El desarrollador desapareció a mitad del proyecto.",
    response:
      "Trabajás directamente con el equipo que ejecuta. Actualizaciones regulares, seguimiento activo y canal de comunicación siempre abierto.",
  },
  {
    client: "No entendí nada de lo que me explicaron.",
    response:
      "Documentamos todo en términos que hacen sentido para tu negocio. Sabés exactamente qué se construye, para qué y cuándo.",
  },
  {
    client: "Tardaron meses y el resultado fue mediocre.",
    response:
      "Fechas reales desde el día uno. Cada etapa tiene hitos claros y vos aprobás antes de avanzar a la siguiente.",
  },
];

const bubbleVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      delay: i * 0.18,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

export function ImpactSection() {
  return (
    <section className="px-6 py-24 bg-zinc-900/20">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <p className="text-sm font-medium text-brand uppercase tracking-wider mb-4">
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

        {/* Chat window */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border border-zinc-800/60 overflow-hidden"
        >
          {/* Window chrome */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-zinc-900 border-b border-zinc-800/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand/15 border border-brand/30 flex items-center justify-center shrink-0">
                <span className="font-display text-[10px] font-bold text-brand">LS</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-200">LumarSoft</p>
                <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  Responde en minutos
                </p>
              </div>
            </div>
            {/* Window dots */}
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            </div>
          </div>

          {/* Messages */}
          <div className="bg-zinc-950 px-4 sm:px-6 py-6 flex flex-col gap-5">
            {exchanges.map((exchange, i) => (
              <div key={i} className="flex flex-col gap-2.5">
                {/* Client message — left */}
                <motion.div
                  custom={i * 2}
                  variants={bubbleVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="flex items-end gap-2.5 self-start max-w-[85%] sm:max-w-[70%]"
                >
                  <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 mb-0.5">
                    <span className="text-[9px] text-zinc-500 font-medium">C</span>
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-zinc-800/80 border border-zinc-700/40">
                    <p className="text-sm text-zinc-300 italic leading-relaxed">
                      &ldquo;{exchange.client}&rdquo;
                    </p>
                  </div>
                </motion.div>

                {/* LumarSoft response — right */}
                <motion.div
                  custom={i * 2 + 1}
                  variants={bubbleVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="flex items-end gap-2.5 self-end max-w-[85%] sm:max-w-[70%]"
                >
                  <div className="px-4 py-3 rounded-2xl rounded-br-sm bg-brand/10 border border-brand/20">
                    <p className="text-sm text-zinc-200 leading-relaxed">
                      {exchange.response}
                    </p>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-brand/15 border border-brand/30 flex items-center justify-center shrink-0 mb-0.5">
                    <span className="text-[9px] text-brand font-bold">LS</span>
                  </div>
                </motion.div>
              </div>
            ))}

            {/* Client closing question */}
            <motion.div
              custom={exchanges.length * 2}
              variants={bubbleVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex items-end gap-2.5 self-start max-w-[85%] sm:max-w-[70%]"
            >
              <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 mb-0.5">
                <span className="text-[9px] text-zinc-500 font-medium">C</span>
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-zinc-800/80 border border-zinc-700/40">
                <p className="text-sm text-zinc-300 italic leading-relaxed">
                  &ldquo;¿Y por dónde empiezo? ¿Cómo sé que con ustedes va a ser distinto?&rdquo;
                </p>
              </div>
            </motion.div>

            {/* LumarSoft CTA response */}
            <motion.div
              custom={exchanges.length * 2 + 1}
              variants={bubbleVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex items-end gap-2.5 self-end max-w-[90%] sm:max-w-[72%]"
            >
              <div className="px-4 py-3.5 rounded-2xl rounded-br-sm bg-brand/10 border border-brand/20 flex flex-col gap-3">
                <p className="text-sm text-zinc-200 leading-relaxed">
                  Con una charla. Sin presupuesto apresurado, sin formularios largos. Nos contás el problema y te decimos honestamente si podemos ayudarte — y cómo.
                </p>
                <a
                  href="https://wa.me/5493412776893"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-full bg-brand text-zinc-950 text-xs font-semibold hover:bg-brand/90 transition-colors"
                >
                  Hablemos por WhatsApp →
                </a>
              </div>
              <div className="w-6 h-6 rounded-full bg-brand/15 border border-brand/30 flex items-center justify-center shrink-0 mb-0.5">
                <span className="text-[9px] text-brand font-bold">LS</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
