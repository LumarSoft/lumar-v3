"use client"

import { useRef, useState } from "react"
import { motion, useScroll, AnimatePresence, useMotionValueEvent } from "framer-motion"
import { Search, MessageCircle, Clock, KeyRound } from "lucide-react"
import type { LucideIcon } from "lucide-react"

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
    title: "Te hablamos en castellano.",
    description:
      "Sin tecnicismos, sin humo. Si algo no se entiende, es nuestro problema explicarlo mejor.",
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

export function PricingSection() {
  const [activeStep, setActiveStep] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setActiveStep(Math.min(Math.floor(latest * steps.length), steps.length - 1))
  })

  const active = steps[activeStep]
  const Icon = active.icon

  return (
    <section id="valores">
      <div ref={containerRef} className="relative h-[300vh]">
        <div className="sticky top-0 h-screen bg-zinc-950 flex flex-col overflow-hidden">

          {/* ── Mobile layout ── */}
          <div className="md:hidden flex flex-col items-center justify-center flex-1 px-6 gap-5 text-center">
            {/* Ambient glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_35%,rgba(218,128,55,0.06),transparent_70%)] pointer-events-none" />

            <p className="relative text-xs font-medium text-brand uppercase tracking-wider">
              Cómo trabajamos
            </p>

            {/* Icon + watermark */}
            <div className="relative flex items-center justify-center w-full h-28">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`wm-m-${activeStep}`}
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.12 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  aria-hidden
                >
                  <span className="font-display font-black text-[7rem] leading-none select-none text-zinc-900">
                    {active.number}
                  </span>
                </motion.div>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`icon-m-${activeStep}`}
                  initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 1.2, opacity: 0, rotate: 10 }}
                  transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  className="relative z-10 w-20 h-20 rounded-2xl bg-brand/8 border border-brand/20 flex items-center justify-center shadow-[0_0_48px_rgba(218,128,55,0.14),0_0_100px_rgba(218,128,55,0.06)]"
                >
                  <Icon className="w-9 h-9 text-brand" strokeWidth={1.25} />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Counter */}
            <div className="flex items-baseline gap-1.5">
              <AnimatePresence mode="wait">
                <motion.span
                  key={`cnt-m-${activeStep}`}
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="font-mono text-3xl font-bold text-brand tabular-nums leading-none"
                >
                  {active.number}
                </motion.span>
              </AnimatePresence>
              <span className="font-mono text-sm text-zinc-700">/ 04</span>
            </div>

            {/* Title */}
            <AnimatePresence mode="wait">
              <motion.h2
                key={`title-m-${activeStep}`}
                initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -14, filter: "blur(4px)" }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-2xl font-bold text-zinc-100 leading-tight"
              >
                {active.title}
              </motion.h2>
            </AnimatePresence>

            {/* Description */}
            <AnimatePresence mode="wait">
              <motion.p
                key={`desc-m-${activeStep}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="text-zinc-400 text-sm leading-relaxed max-w-xs"
              >
                {active.description}
              </motion.p>
            </AnimatePresence>

            {/* Progress pills */}
            <div className="flex items-center gap-2">
              {steps.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    width: i === activeStep ? 28 : 6,
                    opacity: i === activeStep ? 1 : 0.28,
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="h-1.5 rounded-full bg-brand"
                />
              ))}
            </div>
          </div>

          {/* ── Desktop layout ── */}
          <div className="hidden md:flex flex-col flex-1 justify-center relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_55%_at_65%_50%,rgba(218,128,55,0.05),transparent_70%)] pointer-events-none" />

            <div className="relative max-w-5xl mx-auto w-full px-6 grid grid-cols-2 items-center gap-20">
              {/* Left: text */}
              <div className="flex flex-col gap-7">
                <p className="text-sm font-medium text-brand uppercase tracking-wider">
                  Cómo trabajamos
                </p>

                <div className="flex items-baseline gap-2">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={activeStep}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="font-mono text-5xl font-bold text-brand tabular-nums leading-none"
                    >
                      {active.number}
                    </motion.span>
                  </AnimatePresence>
                  <span className="font-mono text-lg text-zinc-700">/ 04</span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.h2
                    key={`title-${activeStep}`}
                    initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -18, filter: "blur(6px)" }}
                    transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                    className="font-display text-4xl lg:text-5xl font-bold text-zinc-100 leading-tight"
                  >
                    {active.title}
                  </motion.h2>
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  <motion.p
                    key={`desc-${activeStep}`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.32, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
                    className="text-zinc-400 text-lg leading-relaxed max-w-sm"
                  >
                    {active.description}
                  </motion.p>
                </AnimatePresence>

                <div className="flex items-center gap-2">
                  {steps.map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        width: i === activeStep ? 32 : 6,
                        opacity: i === activeStep ? 1 : 0.28,
                      }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="h-1.5 rounded-full bg-brand"
                    />
                  ))}
                </div>
              </div>

              {/* Right: icon + watermark */}
              <div className="relative flex items-center justify-center h-80">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`wm-${activeStep}`}
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.12 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 flex items-center justify-center"
                    aria-hidden
                  >
                    <span className="font-display font-black text-[11rem] leading-none select-none text-zinc-900">
                      {active.number}
                    </span>
                  </motion.div>
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={`icon-${activeStep}`}
                    initial={{ scale: 0.55, opacity: 0, rotate: -18 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 1.25, opacity: 0, rotate: 12 }}
                    transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                    className="relative z-10 w-36 h-36 rounded-[2rem] bg-brand/8 border border-brand/20 flex items-center justify-center shadow-[0_0_80px_rgba(218,128,55,0.14),0_0_160px_rgba(218,128,55,0.06)]"
                  >
                    <Icon className="w-16 h-16 text-brand" strokeWidth={1.25} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Scroll hint — first step only, shared */}
          <AnimatePresence>
            {activeStep === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
              >
                <span className="text-[10px] text-zinc-700 uppercase tracking-widest">Scroll</span>
                <motion.div
                  animate={{ y: [0, 7, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-px h-6 bg-gradient-to-b from-zinc-700 to-transparent"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
