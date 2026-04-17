"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const projects = [
  {
    number: "01",
    client: "E-commerce de Tecnología",
    category: "Tienda online",
    problem: "Querían vender online pero perder el contacto directo con el comprador era inaceptable.",
    solution:
      "Creamos un e-commerce que deriva cada venta al chat del vendedor para cerrarla de forma personalizada. Tecnología al servicio del trato humano.",
    image: "/3.png",
  },
  {
    number: "02",
    client: "John Pellegrini Management",
    category: "Sistema de gestión",
    problem: "Una aseguradora con cientos de clientes y toda la información dispersa en archivos sueltos.",
    solution:
      "Desarrollamos un sistema seguro para centralizar y gestionar todo desde un solo lugar. Cero papel, cero caos.",
    image: "/4.png",
  },
  {
    number: "03",
    client: "Mutual de Suboficiales de Gendarmería",
    category: "Sistema automatizado",
    problem: "Gestionar membresías y sorteos con planillas manuales dejaba margen para errores e irregularidades.",
    solution:
      "Sistema automatizado con reportes en tiempo real. Cada sorteo, cada membresía, auditada y transparente.",
    image: "/5.png",
  },
];

export function TestimonialsSection() {
  return (
    <section id="portfolio" className="px-6 py-24">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <p className="text-sm font-medium text-brand uppercase tracking-wider mb-4">
            Últimos proyectos
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-zinc-100 max-w-lg leading-tight">
            Lo que estuvimos construyendo.
          </h2>
          <p className="text-zinc-500 mt-4 max-w-xl text-sm leading-relaxed">
            Tres proyectos recientes. Cada uno con un problema distinto, un
            cliente real y una solución que funciona.
          </p>
        </motion.div>

        {/* Case studies */}
        <div className="flex flex-col rounded-2xl border border-zinc-800/60 overflow-hidden divide-y divide-zinc-800/60">
          {projects.map((project, i) => {
            const isReversed = i % 2 === 1;
            return (
              <motion.div
                key={project.number}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
                className={`group grid grid-cols-1 md:grid-cols-5 ${isReversed ? "md:flex-row-reverse" : ""}`}
              >
                {/* Image — 3 cols */}
                <div
                  className={`md:col-span-3 relative aspect-video md:aspect-auto overflow-hidden bg-zinc-900 ${
                    isReversed ? "md:order-2" : "md:order-1"
                  }`}
                >
                  <Image
                    src={project.image}
                    alt={project.client}
                    fill
                    className="object-cover opacity-70 group-hover:opacity-90 group-hover:scale-[1.03] transition-all duration-700"
                  />
                  {/* Gradient overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${
                      isReversed
                        ? "from-transparent to-zinc-950/60"
                        : "from-zinc-950/60 to-transparent"
                    } md:block hidden`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 to-transparent md:hidden" />

                  {/* Number overlay */}
                  <span className="absolute bottom-4 left-4 font-display text-7xl font-bold text-white/5 leading-none select-none">
                    {project.number}
                  </span>
                </div>

                {/* Content — 2 cols */}
                <div
                  className={`md:col-span-2 bg-zinc-950 group-hover:bg-zinc-900/60 transition-colors duration-300 flex flex-col justify-center gap-5 p-7 md:p-9 ${
                    isReversed ? "md:order-1" : "md:order-2"
                  }`}
                >
                  {/* Category */}
                  <span className="self-start text-xs text-brand bg-brand/10 border border-brand/20 px-3 py-1 rounded-full">
                    {project.category}
                  </span>

                  {/* Client name */}
                  <h3 className="font-display text-xl md:text-2xl font-bold text-zinc-100 leading-snug">
                    {project.client}
                  </h3>

                  {/* Problem */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
                      Problema
                    </span>
                    <p className="text-zinc-500 text-sm leading-relaxed italic">
                      {project.problem}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="w-6 h-px bg-brand/40" />

                  {/* Solution */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
                      Solución
                    </span>
                    <p className="text-zinc-300 text-sm leading-relaxed">
                      {project.solution}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
