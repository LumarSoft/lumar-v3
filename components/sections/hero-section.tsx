"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { LiquidCtaButton } from "@/components/buttons/liquid-cta-button";

function AnimatedCounter({
  target,
  suffix = "",
  duration = 1200,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    if (target === 0) return; // "0" no necesita animación
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

const stats = [
  { target: 6, suffix: "", label: "Proyectos entregados" },
  { target: 3, suffix: "+", label: "Años de experiencia" },
  { target: 0, suffix: "", label: "Templates usados" },
];

export function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-20 relative overflow-hidden">
      {/* Dot grid background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(161,161,170,0.18) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* Radial vignette to fade grid toward edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_65%_at_50%_50%,transparent_20%,rgba(9,9,11,0.97)_100%)]" />
      {/* Top glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-5%,rgba(161,161,170,0.07),transparent)]" />

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
          Desarrollamos lo que tu empresa realmente necesita. Sin templates, sin
          intermediarios, sin vueltas.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center justify-center"
        >
          <a
            href="https://wa.me/5493415690470"
            target="_blank"
            rel="noopener noreferrer"
          >
            <LiquidCtaButton>Contanos qué necesitás</LiquidCtaButton>
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-16 grid grid-cols-3 gap-px bg-zinc-800/50 rounded-2xl overflow-hidden max-w-md mx-auto"
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-zinc-950 px-4 py-5 flex flex-col items-center gap-1.5 hover:bg-zinc-900/60 transition-colors duration-300"
            >
              <span className="font-display text-2xl font-bold text-zinc-100">
                <AnimatedCounter target={stat.target} suffix={stat.suffix} />
              </span>
              <span className="text-xs text-zinc-500 text-center leading-tight">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
