"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring, animate } from "framer-motion";
import { ShoppingCart, MousePointerClick, Wrench, BookOpen } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const services = [
  {
    icon: ShoppingCart,
    title: "Ecommerce",
    description:
      "Vendé online sin perder el trato personalizado que te diferencia. Diseñamos cada flujo de compra pensando en tus clientes reales.",
    tag: "Tiendas online",
  },
  {
    icon: MousePointerClick,
    title: "Landing Pages",
    description:
      "Una página que convierte visitas en consultas reales. Sin distracciones, con un objetivo claro y copy que habla el idioma de tu cliente.",
    tag: "Conversión",
  },
  {
    icon: Wrench,
    title: "Apps Web a Medida",
    description:
      "Si ninguna herramienta existente te cierra, la construimos para vos. Sistemas internos, paneles de gestión, automatizaciones.",
    tag: "Desarrollo a medida",
  },
  {
    icon: BookOpen,
    title: "Presencia Digital",
    description:
      "Contá lo que sabés. Nosotros hacemos que llegue a quien tiene que llegar. Sitios web, blogs y estrategia de contenido.",
    tag: "Contenido y SEO",
  },
];

function ServiceCard({
  icon: Icon,
  title,
  description,
  tag,
  delay,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  tag: string;
  delay: number;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spotlightOpacity = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 120, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 25 });
  const spotlight = useMotionTemplate`radial-gradient(260px circle at ${springX}px ${springY}px, rgba(161,161,170,0.09), transparent 80%)`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="group relative p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700/50 hover:bg-zinc-900/80 transition-all duration-300 overflow-hidden"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
        animate(spotlightOpacity, 1, { duration: 0.15 });
      }}
      onMouseLeave={() => {
        animate(spotlightOpacity, 0, { duration: 0.12 });
      }}
    >
      {/* Per-card spotlight */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ background: spotlight, opacity: spotlightOpacity }}
      />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="w-11 h-11 rounded-xl bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
            <Icon className="w-5 h-5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
          </div>
          <span className="text-xs text-zinc-600 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full">
            {tag}
          </span>
        </div>
        <h3 className="font-display text-xl font-semibold text-zinc-100 mb-3">{title}</h3>
        <p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

export function FeaturesSection() {
  return (
    <section id="servicios" className="px-6 py-24">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">
            Servicios
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-zinc-100 max-w-lg leading-tight">
            Lo que hacemos, y por qué importa.
          </h2>
          <p className="text-zinc-500 mt-4 max-w-xl text-sm leading-relaxed">
            Más de tres años desarrollando soluciones digitales para empresas y
            organizaciones argentinas. Cada proyecto tiene metodología clara,
            entregas definidas y código que te pertenece.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service, i) => (
            <ServiceCard key={service.title} {...service} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </section>
  );
}
