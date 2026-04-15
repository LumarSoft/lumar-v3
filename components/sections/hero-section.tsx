"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { LiquidCtaButton } from "@/components/buttons/liquid-cta-button"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-20 relative overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(161,161,170,0.08),transparent)]" />

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Origin badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/80 border border-zinc-800 mb-10"
        >
          <span className="w-2 h-2 rounded-full bg-zinc-400 animate-pulse" />
          <span className="text-sm text-zinc-400">Rosario, Argentina</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-[0.95]"
        >
          <span className="text-zinc-100 block">Tu negocio creció.</span>
          <span className="text-zinc-500 block mt-2">Tu web, no.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-zinc-400 max-w-xl mx-auto mb-12 leading-relaxed"
        >
          Desarrollamos lo que tu empresa realmente necesita.
          Sin templates, sin intermediarios, sin vueltas.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a href="https://wa.me/5493415690470" target="_blank" rel="noopener noreferrer">
            <LiquidCtaButton>Contanos qué necesitás</LiquidCtaButton>
          </a>
          <Link
            href="#portfolio"
            className="group flex items-center gap-2 px-6 py-3 text-sm font-medium text-zinc-500 hover:text-zinc-100 transition-colors"
          >
            <span>Ver nuestro trabajo</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </motion.div>

        {/* Trust line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-sm text-zinc-600"
        >
          6 proyectos entregados · Comunicación directa · Sin sorpresas
        </motion.p>
      </div>
    </section>
  )
}
