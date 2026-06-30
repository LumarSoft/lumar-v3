"use client";

import { motion } from "framer-motion";
import { X, Check, ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { whatsappUrl } from "@/lib/site";

type Objection = {
  tag: string;
  problem: string;
  solution: string;
};

const objections: Objection[] = [
  {
    tag: "Falta de continuidad",
    problem: "Contraté a alguien y desapareció a la mitad del proyecto.",
    solution:
      "Hablás directamente con quien construye tu proyecto, de principio a fin. Sin intermediarios, sin cuentas de soporte genéricas.",
  },
  {
    tag: "Soluciones genéricas",
    problem: "Me entregaron un template con mi nombre. No tenía nada que ver con mi negocio.",
    solution:
      "Cada proyecto arranca desde cero. Antes de escribir una línea de código, entendemos cómo funcionás y qué querés lograr.",
  },
  {
    tag: "Comunicación poco clara",
    problem: "Me explicaron todo con tecnicismos y nunca entendí qué se estaba haciendo.",
    solution:
      "Si algo no se entiende, es nuestro problema explicarlo mejor. Te contamos qué se construye, para qué y cuándo — en castellano.",
  },
  {
    tag: "Plazos que no se cumplen",
    problem: "Tardaron el doble de lo prometido y el resultado era mediocre.",
    solution:
      "Fechas reales desde el día uno. Cada etapa tiene hitos claros y vos aprobás antes de avanzar a la siguiente.",
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

export function ImpactSection() {
  return (
    <section className="px-6 py-24 bg-zinc-900/20">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <SectionHeading
          eyebrow="Lo que escuchamos seguido"
          index="02"
          className="mb-12 max-w-lg"
          description="Casi siempre son las mismas situaciones. Por eso definimos un proceso que las evita desde el primer día."
        >
          Lo que nos cuentan antes de contratarnos.
        </SectionHeading>

        {/* Problem → solution cards */}
        <div className="grid md:grid-cols-2 gap-5">
          {objections.map((item, i) => (
            <motion.div
              key={item.tag}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease }}
              className="group relative rounded-2xl border border-zinc-800/60 bg-zinc-950/40 p-7 overflow-hidden transition-colors duration-300 hover:border-zinc-700"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(218,128,55,0.06),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="relative">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
                  {item.tag}
                </span>

                {/* Problem — muted */}
                <div className="flex items-start gap-3 mt-4">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center shrink-0">
                    <X className="w-3 h-3 text-zinc-500" />
                  </span>
                  <p className="text-sm text-zinc-500 italic leading-relaxed">
                    &ldquo;{item.problem}&rdquo;
                  </p>
                </div>

                {/* Solution — lit */}
                <div className="flex items-start gap-3 mt-5 pt-5 border-t border-zinc-800/60">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-brand/15 border border-brand/30 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-brand" />
                  </span>
                  <p className="text-sm text-zinc-200 leading-relaxed">
                    {item.solution}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Closing reassurance + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease }}
          className="mt-12 flex flex-col items-center text-center gap-5"
        >
          <p className="text-zinc-300 text-base md:text-lg max-w-xl leading-relaxed text-balance">
            Todo empieza con una conversación. Nos contás tu problema y te decimos
            con honestidad si podemos ayudarte y de qué forma. Sin presupuestos apurados.
          </p>
          <a
            href={whatsappUrl("Hola, quiero contarles mi proyecto.")}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand text-zinc-950 text-sm font-semibold hover:bg-brand/90 transition-colors"
          >
            Hablemos por WhatsApp
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
