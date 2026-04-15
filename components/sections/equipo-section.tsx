"use client";

import { motion } from "framer-motion";
import { Github, Linkedin } from "lucide-react";

const team = [
  {
    name: "Mateo Bodini",
    description:
      "Especialista en frontend y arquitectura de interfaces. Diseña flujos de usuario con foco en conversión y claridad, no en estética vacía.",
    linkedin: "https://www.linkedin.com/in/mateobodini/",
    github: "https://github.com/mateoBodiniARG",
    initials: "MB",
  },
  {
    name: "Marcelo Benitez",
    description:
      "Especialista en backend y sistemas a medida. Modela lógica de negocio compleja y construye arquitecturas que escalan sin volverse un caos.",
    linkedin: "https://www.linkedin.com/in/benitez-marcelo/",
    github: "https://github.com/marcebenitez2",
    initials: "MB",
  },
  {
    name: "Lucas Quaroni",
    description:
      "Fullstack con foco en performance y entrega. Garantiza que lo que se lanza a producción funcione exactamente como lo que se mostró en demo.",
    linkedin: "https://www.linkedin.com/in/lucasquaroni/",
    github: "https://github.com/LucasQuaroni",
    initials: "LQ",
  },
];

export function EquipoSection() {
  return (
    <section id="equipo" className="px-6 py-24 bg-zinc-900/20">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">
            El equipo
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-zinc-100 max-w-2xl leading-tight">
            Tres desarrolladores especializados. Un equipo que responde.
          </h2>
          <p className="text-zinc-500 mt-4 max-w-lg text-sm leading-relaxed">
            Con experiencia en proyectos reales para empresas, gremios y
            organizaciones argentinas. Cada integrante domina su área y trabaja
            directamente con el cliente — sin capas, sin intermediarios.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group p-7 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-300"
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-5 group-hover:bg-zinc-700 transition-colors">
                <span className="font-display text-sm font-bold text-zinc-400">
                  {member.initials}
                </span>
              </div>

              <h3 className="font-display text-lg font-semibold text-zinc-100 mb-2">
                {member.name}
              </h3>
              <p className="text-zinc-500 text-sm leading-relaxed mb-5">
                {member.description}
              </p>

              <div className="flex items-center gap-3">
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-600 hover:text-zinc-300 transition-colors"
                  aria-label={`LinkedIn de ${member.name}`}
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-600 hover:text-zinc-300 transition-colors"
                  aria-label={`GitHub de ${member.name}`}
                >
                  <Github className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
