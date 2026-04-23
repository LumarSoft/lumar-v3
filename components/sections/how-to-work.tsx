"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Search, MessageCircle, Clock, KeyRound } from "lucide-react"
import type { LucideIcon } from "lucide-react"

type Step = {
  icon: LucideIcon
  title: string
  description: string
}

const steps: Step[] = [
  {
    icon: Search,
    title: "Primero, te escuchamos.",
    description:
      "Antes de proponer cualquier solución, entendemos tu negocio. Hacemos las preguntas que nadie más hace.",
  },
  {
    icon: MessageCircle,
    title: "Te hablamos en castellano.",
    description:
      "Sin tecnicismos, sin humo. Si algo no se entiende, es nuestro problema explicarlo mejor.",
  },
  {
    icon: Clock,
    title: "Fechas reales, no optimistas.",
    description:
      "Si algo tarda dos semanas, te decimos dos semanas. Hitos claros y vos aprobás cada etapa.",
  },
  {
    icon: KeyRound,
    title: "El proyecto es tuyo.",
    description:
      "Código limpio y documentado. Sin dependencias artificiales con nosotros. Entregamos de verdad.",
  },
]

export function PricingSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const inView = useInView(sectionRef, { once: true, margin: "-80px" })

  return (
    <section id="valores" className="px-6 py-24 bg-zinc-900/20">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 md:mb-20"
        >
          <p className="text-sm font-medium text-brand uppercase tracking-wider mb-4">
            Cómo trabajamos
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-zinc-100 max-w-lg leading-tight">
            Así es trabajar con nosotros.
          </h2>
          <p className="text-zinc-500 mt-4 max-w-xl text-sm leading-relaxed">
            No está escrito en un PDF. Es lo que hacemos de verdad,
            proyecto a proyecto.
          </p>
        </motion.div>

        {/* ── Desktop: horizontal timeline ── */}
        <div ref={sectionRef} className="hidden md:block relative">
          {/* Base line (static, zinc) */}
          <div className="absolute top-7 left-[12.5%] w-3/4 h-px bg-zinc-800" />

          {/* Animated fill line (brand) */}
          <motion.div
            className="absolute top-7 left-[12.5%] w-3/4 h-px origin-left"
            style={{
              background:
                "linear-gradient(to right, rgba(218,128,55,0.7), rgba(218,128,55,0.2))",
            }}
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          />

          {/* Steps */}
          <div className="grid grid-cols-4 gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 18 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.18 + 0.3 }}
                  className="flex flex-col items-center text-center group"
                >
                  {/* Icon node */}
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={inView ? { scale: 1, opacity: 1 } : {}}
                    transition={{
                      duration: 0.4,
                      delay: i * 0.18 + 0.5,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="relative z-10 w-14 h-14 rounded-full bg-zinc-950 border border-zinc-800 group-hover:border-brand/40 group-hover:bg-brand/5 flex items-center justify-center mb-5 transition-all duration-300 shadow-[0_0_0_6px_rgba(9,9,11,1)]"
                  >
                    <Icon className="w-5 h-5 text-zinc-500 group-hover:text-brand transition-colors duration-300" />
                  </motion.div>

                  <h3 className="font-display font-semibold text-zinc-100 text-sm mb-2 leading-snug px-1">
                    {step.title}
                  </h3>
                  <p className="text-zinc-500 text-xs leading-relaxed px-1">
                    {step.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* ── Mobile: vertical timeline ── */}
        <div className="md:hidden relative pl-10">
          {/* Base vertical line */}
          <div className="absolute left-[13px] top-3 bottom-3 w-px bg-zinc-800" />

          {/* Animated fill line */}
          <motion.div
            className="absolute left-[13px] top-3 w-px origin-top"
            style={{
              background:
                "linear-gradient(to bottom, rgba(218,128,55,0.7), rgba(218,128,55,0.15))",
              height: "calc(100% - 1.5rem)",
            }}
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          />

          <div className="flex flex-col gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.12 }}
                  className="relative"
                >
                  {/* Icon node */}
                  <div className="absolute -left-10 top-0 w-[26px] h-[26px] rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-[0_0_0_4px_rgba(9,9,11,1)]">
                    <Icon className="w-3 h-3 text-brand" />
                  </div>

                  <h3 className="font-display font-semibold text-zinc-100 text-sm mb-1.5 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
