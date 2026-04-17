"use client";

import { motion } from "framer-motion";
import { Github, Linkedin } from "lucide-react";

const team = [
  {
    name: "Mateo Bodini",
    role: "CEO · Fullstack",
    degree: "Ing. en Sistemas",
    linkedin: "https://www.linkedin.com/in/mateobodini/",
    github: "https://github.com/mateoBodiniARG",
    initials: "MB",
  },
  {
    name: "Marcelo Benitez",
    role: "CEO · Fullstack",
    degree: "Tec. en Desarrollo de Software",
    linkedin: "https://www.linkedin.com/in/benitez-marcelo/",
    github: "https://github.com/marcebenitez2",
    initials: "MB",
  },
  {
    name: "Lucas Quaroni",
    role: "CEO · Fullstack",
    degree: "Ing. en Sistemas",
    linkedin: "https://www.linkedin.com/in/lucasquaroni/",
    github: "https://github.com/LucasQuaroni",
    initials: "LQ",
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <p className="text-sm font-medium text-brand uppercase tracking-wider mb-4">
            El equipo
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-zinc-100 max-w-2xl leading-tight">
            Somos los tres que fundamos LumarSoft. También somos los tres que escriben el código.
          </h2>
          <p className="text-zinc-500 mt-4 max-w-xl text-sm leading-relaxed">
            Ingenieros en Sistemas de Rosario. Cuando contratás LumarSoft, no hay
            un equipo de ventas que te pasa a un equipo de desarrollo. Hablás
            directamente con quien construye tu proyecto, de principio a fin.
          </p>
        </motion.div>

        {/* ── Desktop: annotated photo ── */}
        <div className="hidden md:block">
          {/* Team photo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="w-full aspect-[21/9] rounded-2xl bg-zinc-900 border border-zinc-800/60 overflow-hidden relative"
          >
            {/* Dot-grid background */}
            <div
              className="absolute inset-0 opacity-50"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(161,161,170,0.14) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            {/* Person zones */}
            <div className="relative h-full grid grid-cols-3">
              {team.map((member, i) => (
                <div
                  key={member.name}
                  className={`flex flex-col items-center justify-center gap-3 ${
                    i < team.length - 1 ? "border-r border-zinc-800/25" : ""
                  }`}
                >
                  <div className="w-16 h-16 rounded-full bg-zinc-800/70 border border-zinc-700/50 flex items-center justify-center">
                    <span className="font-display text-lg font-bold text-zinc-500">
                      {member.initials}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-600 tracking-wide">
                    {member.name}
                  </span>
                </div>
              ))}
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
          {/* Photo placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="w-full aspect-[3/2] rounded-2xl bg-zinc-900 border border-zinc-800/60 overflow-hidden relative"
          >
            <div
              className="absolute inset-0 opacity-50"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(161,161,170,0.14) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-around px-8">
              {team.map((member) => (
                <div key={member.name} className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-zinc-800/70 border border-zinc-700/50 flex items-center justify-center">
                    <span className="font-display text-sm font-bold text-zinc-500">
                      {member.initials}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Person cards */}
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="flex items-start gap-4 p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/50"
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/50 flex items-center justify-center shrink-0">
                <span className="font-display text-xs font-bold text-zinc-500">
                  {member.initials}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs text-brand font-medium uppercase tracking-wider">
                  {member.role}
                </span>
                <span className="text-[10px] text-zinc-600 font-medium uppercase tracking-widest">
                  {member.degree}
                </span>
                <h3 className="font-display text-base font-bold text-zinc-100 mt-0.5 mb-1.5">
                  {member.name}
                </h3>
                <div className="flex items-center gap-3">
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`LinkedIn de ${member.name}`}
                    className="text-zinc-600 hover:text-brand transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`GitHub de ${member.name}`}
                    className="text-zinc-600 hover:text-brand transition-colors"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
