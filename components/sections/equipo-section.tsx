"use client";

import { motion } from "framer-motion";
import { Github, Linkedin } from "lucide-react";
import Image from "next/image";
import { SectionHeading } from "@/components/ui/section-heading";

const team = [
  {
    name: "Lucas Quaroni",
    role: "Co-fundador · Fullstack",
    degree: "Ing. en Sistemas",
    bio: "Entiende el problema antes de proponer cualquier solución. El que insiste en hacer bien las preguntas.",
    linkedin: "https://www.linkedin.com/in/lucasquaroni/",
    github: "https://github.com/LucasQuaroni",
    initials: "LQ",
  },
  {
    name: "Marcelo Benitez",
    role: "Co-fundador · Fullstack",
    degree: "Tec. en Desarrollo de Software",
    bio: "Traduce procesos de negocio en sistemas que la gente realmente usa, explicados siempre con claridad.",
    linkedin: "https://www.linkedin.com/in/benitez-marcelo/",
    github: "https://github.com/marcebenitez2",
    initials: "MB",
  },
  {
    name: "Mateo Bodini",
    role: "Co-fundador · Fullstack",
    degree: "Ing. en Sistemas",
    bio: "Diseña sistemas que tienen que durar. No los que se ven bien en una demo y fallan en producción.",
    linkedin: "https://www.linkedin.com/in/mateobodini/",
    github: "https://github.com/mateoBodiniARG",
    initials: "MB",
  },
];

// Hand-drawn style arrow paths in a 900×80 viewBox.
// Centers of 3 equal columns: 150, 450, 750 (1/6, 1/2, 5/6 of 900).
// Each arrow curves slightly for an organic feel.
const arrows = [
  {
    // Left person → leans left
    shaft: "M 150 0 C 146 22, 132 46, 120 76",
    // Forked arrowhead at endpoint (120, 76)
    head: "M 120 76 L 108 62 M 120 76 L 133 65",
    delay: 0.1,
  },
  {
    // Center person → subtle S-curve
    shaft: "M 450 0 C 458 20, 440 50, 448 76",
    head: "M 448 76 L 437 63 M 448 76 L 460 65",
    delay: 0.25,
  },
  {
    // Right person → leans right
    shaft: "M 750 0 C 754 22, 768 46, 780 76",
    head: "M 780 76 L 768 65 M 780 76 L 793 62",
    delay: 0.4,
  },
];

const cardAlignments = [
  "items-start text-left",
  "items-center text-center",
  "items-end text-right",
];
const socialAlignments = ["justify-start", "justify-center", "justify-end"];

export function EquipoSection() {
  return (
    <section id="equipo" className="px-6 py-24">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="relative">
          <SectionHeading
            eyebrow="El equipo"
            index="04"
            className="mb-12 max-w-2xl"
            description="Ingenieros en Sistemas de Rosario. Cuando contratás LumarSoft, no hay un equipo de ventas que te pasa a un equipo de desarrollo. Hablás directamente con quien construye tu proyecto, de principio a fin."
          >
            Somos los tres que fundamos LumarSoft. También somos los tres que escriben el código.
          </SectionHeading>

          {/* Logo — arriba a la derecha */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-ls.png"
            alt="LumarSoft"
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 hidden h-28 w-auto select-none object-contain opacity-90 md:block lg:h-36"
          />
        </div>

        {/* ── Desktop: annotated photo ── */}
        <div className="hidden md:block">
          {/* Team photo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full p-[1px] rounded-2xl bg-gradient-to-b from-zinc-700/50 via-zinc-800/30 to-brand/10 shadow-[0_0_48px_rgba(218,128,55,0.07)]"
          >
            <div className="w-full aspect-[21/8] rounded-[calc(1rem-1px)] overflow-hidden relative bg-zinc-950">
              <Image
                src="/teamImage.jpeg"
                alt="El equipo de LumarSoft"
                fill
                className="object-cover object-[center_60%]"
                sizes="(max-width: 768px) 100vw, 960px"
                priority
              />
              {/* Vignette bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent pointer-events-none" />
              {/* Subtle brand tint top-right */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(218,128,55,0.07),transparent_60%)] pointer-events-none" />
            </div>
          </motion.div>

          {/* Hand-drawn SVG arrows */}
          {/* viewBox 900×80 — column centers at 150, 450, 750 */}
          <svg
            viewBox="0 0 900 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
            style={{ height: "auto", overflow: "visible" }}
            aria-hidden="true"
          >
            {arrows.map((arrow, i) => (
              <g key={i}>
                {/* Shaft */}
                <motion.path
                  d={arrow.shaft}
                  stroke="rgba(218,128,55,0.55)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    pathLength: { duration: 0.65, delay: arrow.delay, ease: "easeOut" },
                    opacity: { duration: 0.01, delay: arrow.delay },
                  }}
                />
                {/* Forked arrowhead — appears after shaft is drawn */}
                <motion.path
                  d={arrow.head}
                  stroke="rgba(218,128,55,0.55)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.2, delay: arrow.delay + 0.6 }}
                />
              </g>
            ))}
          </svg>

          {/* Info cards — no container, text floats below arrows */}
          <div className="grid grid-cols-3">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: arrows[i].delay + 0.55 }}
                className={`flex flex-col gap-3 px-3 pt-1 ${cardAlignments[i]}`}
              >
                <div className={`flex flex-col gap-1 ${cardAlignments[i]}`}>
                  <span className="text-xs text-brand font-medium uppercase tracking-wider">
                    {member.role}
                  </span>
                  <span className="text-[10px] text-zinc-600 font-medium uppercase tracking-widest">
                    {member.degree}
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-zinc-100 leading-snug">
                  {member.name}
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed max-w-[180px]">
                  {member.bio}
                </p>
                <div className={`flex items-center gap-3 ${socialAlignments[i]}`}>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`LinkedIn de ${member.name}`}
                    className="text-zinc-600 hover:text-brand transition-colors duration-200"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`GitHub de ${member.name}`}
                    className="text-zinc-600 hover:text-brand transition-colors duration-200"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Mobile: photo + stacked cards ── */}
        <div className="md:hidden flex flex-col gap-5">
          {/* Team photo */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full p-[1px] rounded-2xl bg-gradient-to-b from-zinc-700/50 via-zinc-800/30 to-brand/10 shadow-[0_0_36px_rgba(218,128,55,0.07)]"
          >
            <div className="w-full aspect-[3/2] rounded-[calc(1rem-1px)] overflow-hidden relative bg-zinc-950">
              <Image
                src="/teamImage.jpeg"
                alt="El equipo de LumarSoft"
                fill
                className="object-cover object-[center_60%]"
                sizes="100vw"
              />
              {/* Vignette bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent pointer-events-none" />
              {/* Subtle brand tint */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(218,128,55,0.07),transparent_60%)] pointer-events-none" />
            </div>
          </motion.div>

          {/* 3-column annotation row */}
          <div className="grid grid-cols-3 pt-1">
            {team.map((member, i) => {
              const align = ["items-start text-left", "items-center text-center", "items-end text-right"][i];
              const socialAlign = ["justify-start", "justify-center", "justify-end"][i];
              return (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
                  className={`flex flex-col gap-2 px-1 ${align}`}
                >
                  <div className={`flex flex-col gap-0.5 ${align}`}>
                    <span className="text-[10px] text-brand font-medium uppercase tracking-wider leading-tight">
                      {member.role}
                    </span>
                    <span className="text-[9px] text-zinc-600 font-medium uppercase tracking-widest leading-tight">
                      {member.degree}
                    </span>
                  </div>
                  <h3 className="font-display text-sm font-bold text-zinc-100 leading-snug">
                    {member.name}
                  </h3>
                  <p className="text-[10px] text-zinc-500 leading-relaxed">
                    {member.bio}
                  </p>
                  <div className={`flex items-center gap-2.5 ${socialAlign}`}>
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`LinkedIn de ${member.name}`}
                      className="text-zinc-600 hover:text-brand transition-colors"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`GitHub de ${member.name}`}
                      className="text-zinc-600 hover:text-brand transition-colors"
                    >
                      <Github className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
