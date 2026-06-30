"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  animate,
  useScroll,
  useTransform,
} from "framer-motion";
import { LiquidCtaButton } from "@/components/buttons/liquid-cta-button";
import { Magnetic } from "@/components/buttons/magnetic";
import { whatsappUrl } from "@/lib/site";

const ease = [0.22, 1, 0.36, 1] as const;

// Word-by-word reveal for the headline
const headlineContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } },
};
const wordVariant = {
  hidden: { opacity: 0, y: "0.5em", filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease } },
};

function RevealWords({ text, className = "" }: { text: string; className?: string }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          variants={wordVariant}
          className={`inline-block ${className}`}
        >
          {word}&nbsp;
        </motion.span>
      ))}
    </>
  );
}

// ── Animated counter ──────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = "", duration = 1200 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || target === 0) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - progress, 3)) * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ── Stats ─────────────────────────────────────────────────────────────────────
const stats = [
  { target: 50,  suffix: "+", label: "Proyectos entregados" },
  { target: 6,   suffix: "+", label: "Años de experiencia" },
  { target: 100, suffix: "%", label: "Trato directo" },
];

// ── Hero ──────────────────────────────────────────────────────────────────────
export function HeroSection() {
  // Mouse spotlight
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const spotlightOpacity = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 90, damping: 22 });
  const springY = useSpring(rawY, { stiffness: 90, damping: 22 });
  const spotlight = useMotionTemplate`radial-gradient(480px circle at ${springX}px ${springY}px, rgba(218,128,55,0.13), transparent 80%)`;

  // Scroll indicator fade
  const { scrollY } = useScroll();
  const scrollIndicatorOpacity = useTransform(scrollY, [0, 100], [1, 0]);

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    rawX.set(e.clientX - rect.left);
    rawY.set(e.clientY - rect.top);
    animate(spotlightOpacity, 1, { duration: 0.15 });
  }

  function handleMouseLeave() {
    animate(spotlightOpacity, 0, { duration: 0.12 });
  }

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-20 relative overflow-hidden"
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(161,161,170,0.14) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* Mouse spotlight */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: spotlight, opacity: spotlightOpacity }}
      />
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_65%_at_50%_50%,transparent_20%,rgba(9,9,11,0.97)_100%)]" />
      {/* Top glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-5%,rgba(161,161,170,0.07),transparent)]" />

      <div className="relative z-10 text-center max-w-4xl mx-auto">

        {/* Headline */}
        <motion.h1
          variants={headlineContainer}
          initial="hidden"
          animate="visible"
          className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-[0.95]"
        >
          <span className="block">
            <RevealWords
              text="Eso que imaginás para tu empresa,"
              className="bg-gradient-to-b from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent"
            />
          </span>
          <span className="block mt-2">
            <RevealWords text="lo construimos." className="text-zinc-500" />
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base md:text-xl text-zinc-400 max-w-xl mx-auto mb-12 leading-relaxed"
        >
          Trabajás directamente con el equipo que desarrolla tu proyecto.
          Plazos claros, sin intermediarios y sin sorpresas al final.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center justify-center"
        >
          <Magnetic strength={0.4} className="inline-block">
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
              <LiquidCtaButton>Contanos qué necesitás</LiquidCtaButton>
            </a>
          </Magnetic>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="relative mt-16 grid grid-cols-3 gap-px bg-zinc-800/50 rounded-2xl overflow-hidden max-w-md mx-auto"
        >
          {/* Rotating light beam around the stats */}
          <span className="beam-border" aria-hidden />
          {stats.map((stat, i) => (
            <div key={i} className="bg-zinc-950 px-2 sm:px-4 py-4 sm:py-5 flex flex-col items-center gap-1 sm:gap-1.5 hover:bg-zinc-900/60 transition-colors duration-300">
              <span className="font-display text-2xl font-bold text-zinc-100">
                <AnimatedCounter target={stat.target} suffix={stat.suffix} />
              </span>
              <span className="text-xs text-zinc-500 text-center leading-tight">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        style={{ opacity: scrollIndicatorOpacity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
      >
        <span className="text-[10px] text-zinc-600 uppercase tracking-widest">Scroll</span>
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-7 bg-gradient-to-b from-zinc-600 to-transparent"
        />
      </motion.div>
    </section>
  );
}