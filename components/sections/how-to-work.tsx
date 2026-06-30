"use client"

import { useRef } from "react"
import { motion, useScroll, useSpring } from "framer-motion"
import { Search, MessageCircle, Clock, KeyRound } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { SectionHeading } from "@/components/ui/section-heading"

type Step = {
  icon: LucideIcon
  number: string
  title: string
  description: string
}

const steps: Step[] = [
  {
    icon: Search,
    number: "01",
    title: "Primero, te escuchamos.",
    description:
      "Antes de proponer cualquier solución, entendemos tu negocio. Hacemos las preguntas que nadie más hace.",
  },
  {
    icon: MessageCircle,
    number: "02",
    title: "Te explicamos sin tecnicismos.",
    description:
      "Si algo no queda claro, es nuestra responsabilidad explicarlo mejor. Nada de jerga innecesaria.",
  },
  {
    icon: Clock,
    number: "03",
    title: "Fechas reales, no optimistas.",
    description:
      "Si algo tarda dos semanas, te decimos dos semanas. Hitos claros y vos aprobás cada etapa.",
  },
  {
    icon: KeyRound,
    number: "04",
    title: "El proyecto es tuyo.",
    description:
      "Código limpio y documentado. Sin dependencias artificiales con nosotros. Entregamos de verdad.",
  },
]

const ease = [0.22, 1, 0.36, 1] as const

export function PricingSection() {
  const trackRef = useRef<HTMLDivElement>(null)

  // Fill the progress line as the timeline passes through the viewport.
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 70%", "end 65%"],
  })
  const lineScale = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <section id="valores" className="px-6 py-24">
      <div className="max-w-3xl mx-auto">
        <SectionHeading
          eyebrow="Cómo trabajamos"
          index="03"
          className="mb-16"
          description="Cuatro principios que aplicamos en cada proyecto, sin excepción."
        >
          Así trabajamos en cada proyecto.
        </SectionHeading>

        {/* Timeline */}
        <div ref={trackRef} className="relative">
          {/* Base rail */}
          <div className="absolute left-[21px] md:left-7 top-3 bottom-3 w-px bg-zinc-800/70" />
          {/* Progress fill */}
          <motion.div
            style={{ scaleY: lineScale }}
            className="absolute left-[21px] md:left-7 top-3 bottom-3 w-px origin-top bg-gradient-to-b from-brand via-brand/70 to-brand/10"
          />

          <div className="flex flex-col gap-12 md:gap-16">
            {steps.map((step) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-90px" }}
                  transition={{ duration: 0.55, ease }}
                  className="relative flex gap-5 md:gap-8"
                >
                  {/* Node */}
                  <div className="relative z-10 shrink-0 w-[42px] h-[42px] md:w-14 md:h-14 rounded-2xl bg-zinc-900 border border-brand/25 flex items-center justify-center shadow-[0_0_30px_rgba(218,128,55,0.12)]">
                    <Icon
                      className="w-5 h-5 md:w-6 md:h-6 text-brand"
                      strokeWidth={1.5}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-2 pt-1 flex-1 min-w-0">
                    <span className="font-mono text-xs text-brand/70 tabular-nums">
                      {step.number} <span className="text-zinc-700">/ 04</span>
                    </span>
                    <h3 className="font-display text-xl md:text-2xl font-bold text-zinc-100 leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-md">
                      {step.description}
                    </p>
                  </div>

                  {/* Ghost watermark number */}
                  <span
                    aria-hidden
                    className="hidden lg:block absolute right-2 -top-4 font-display font-black text-7xl leading-none text-zinc-900 select-none pointer-events-none"
                  >
                    {step.number}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
