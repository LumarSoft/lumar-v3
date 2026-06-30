"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, MousePointerClick, Wrench, BookOpen, ArrowRight, Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";

type Service = {
  icon: LucideIcon;
  number: string;
  title: string;
  tag: string;
  description: string;
  points: string[];
};

const services: Service[] = [
  {
    icon: ShoppingCart,
    number: "01",
    title: "Ecommerce",
    tag: "Tiendas online",
    description:
      "Vendé online sin perder el trato personalizado que te diferencia. Diseñamos cada flujo de compra pensando en tus clientes reales, no en un template genérico.",
    points: [
      "Flujo de compra adaptado a tu negocio",
      "Integración con medios de pago locales",
      "Panel de gestión simple, sin curva de aprendizaje",
      "Optimizado para conversión desde el día uno",
    ],
  },
  {
    icon: MousePointerClick,
    number: "02",
    title: "Landing Pages",
    tag: "Conversión",
    description:
      "Una página que convierte visitas en consultas reales. Sin distracciones, con un objetivo claro y textos pensados para tu cliente.",
    points: [
      "Diseño enfocado en un solo objetivo",
      "Textos pensados para tu público",
      "Velocidad de carga optimizada",
      "Integración con WhatsApp y formularios",
    ],
  },
  {
    icon: Wrench,
    number: "03",
    title: "Apps Web a Medida",
    tag: "Desarrollo a medida",
    description:
      "Si ninguna herramienta existente te cierra, la construimos para vos. Sistemas internos, paneles y automatizaciones que encajan en tu operación — no al revés.",
    points: [
      "Análisis del proceso antes de escribir código",
      "Sistemas internos y paneles de control",
      "Automatizaciones que ahorran horas reales",
      "Código limpio y documentado, es tuyo",
    ],
  },
  {
    icon: BookOpen,
    number: "04",
    title: "Presencia Digital",
    tag: "Contenido y SEO",
    description:
      "Contá lo que sabés. Nosotros hacemos que llegue a quien tiene que llegar. Sitios web, blogs y estrategia de contenido que posicionan tu negocio.",
    points: [
      "Sitio web que refleja tu negocio real",
      "Optimización para buscadores (SEO) desde la base",
      "Blog y contenido pensado para aparecer en Google",
      "Analítica clara para tomar decisiones",
    ],
  },
];

const detailVariants = {
  enter: { opacity: 0, y: 12, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: "blur(4px)",
    transition: { duration: 0.2 },
  },
};

const accordionVariants = {
  closed: { height: 0, opacity: 0 },
  open: {
    height: "auto",
    opacity: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function FeaturesSection() {
  const [active, setActive] = useState(0);
  const [mobileOpen, setMobileOpen] = useState<number | null>(null);

  const activeService = services[active];

  return (
    <section id="servicios" className="px-6 py-24">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <SectionHeading
          eyebrow="Servicios"
          index="01"
          className="mb-14 max-w-lg"
          description="Cada proyecto se diseña a medida, con un proceso claro, plazos definidos y código que siempre queda en tus manos."
        >
          Lo que desarrollamos para vos.
        </SectionHeading>

        {/* ── Desktop: selector + detail panel ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hidden md:grid grid-cols-5 gap-6 items-start"
        >
          {/* Left: service list */}
          <div className="col-span-2 flex flex-col divide-y divide-zinc-800/60">
            {services.map((service, i) => {
              const Icon = service.icon;
              const isActive = active === i;
              return (
                <button
                  key={service.number}
                  onClick={() => setActive(i)}
                  className={`group flex items-center gap-4 py-5 text-left transition-all duration-200 relative ${
                    isActive ? "pl-4" : "pl-0 hover:pl-2"
                  }`}
                >
                  {/* Active indicator bar */}
                  <span
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-full transition-all duration-300 ${
                      isActive ? "h-8 bg-brand" : "h-0 bg-brand"
                    }`}
                  />
                  <span
                    className={`font-mono text-xs tabular-nums transition-colors duration-200 ${
                      isActive ? "text-brand" : "text-zinc-700 group-hover:text-zinc-500"
                    }`}
                  >
                    {service.number}
                  </span>
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                      isActive
                        ? "bg-brand/15 border border-brand/30"
                        : "bg-zinc-900 border border-zinc-800 group-hover:border-zinc-700"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 transition-colors duration-200 ${
                        isActive ? "text-brand" : "text-zinc-500 group-hover:text-zinc-300"
                      }`}
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span
                      className={`font-display font-semibold text-sm transition-colors duration-200 ${
                        isActive ? "text-zinc-100" : "text-zinc-400 group-hover:text-zinc-200"
                      }`}
                    >
                      {service.title}
                    </span>
                    <span className="text-xs text-zinc-600">{service.tag}</span>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 ml-auto shrink-0 transition-all duration-200 ${
                      isActive
                        ? "text-brand translate-x-0 opacity-100"
                        : "text-zinc-700 -translate-x-1 opacity-0 group-hover:opacity-60 group-hover:translate-x-0"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Right: detail panel */}
          <div className="col-span-3 rounded-2xl bg-zinc-900/50 border border-zinc-800/60 overflow-hidden min-h-[320px] relative">
            {/* Subtle top glow tinted orange */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(218,128,55,0.07),transparent)] pointer-events-none" />

            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                variants={detailVariants}
                initial="enter"
                animate="visible"
                exit="exit"
                className="relative z-10 p-8 flex flex-col h-full"
              >
                {/* Tag */}
                <span className="inline-flex self-start text-xs text-brand bg-brand/10 border border-brand/20 px-3 py-1 rounded-full mb-6">
                  {activeService.tag}
                </span>

                {/* Title */}
                <h3 className="font-display text-2xl font-bold text-zinc-100 mb-4">
                  {activeService.title}
                </h3>

                {/* Description */}
                <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                  {activeService.description}
                </p>

                {/* Points */}
                <ul className="space-y-3">
                  {activeService.points.map((point, i) => (
                    <motion.li
                      key={point}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.06 }}
                      className="flex items-start gap-3 text-sm text-zinc-300"
                    >
                      <span className="mt-0.5 w-4 h-4 rounded-full bg-brand/15 border border-brand/25 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-brand" />
                      </span>
                      {point}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── Mobile: accordion ── */}
        <div className="md:hidden flex flex-col divide-y divide-zinc-800/60">
          {services.map((service, i) => {
            const Icon = service.icon;
            const isOpen = mobileOpen === i;
            return (
              <motion.div
                key={service.number}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.07 }}
              >
                <button
                  onClick={() => setMobileOpen(isOpen ? null : i)}
                  className="w-full flex items-center gap-4 py-5 text-left"
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                      isOpen
                        ? "bg-brand/15 border border-brand/30"
                        : "bg-zinc-900 border border-zinc-800"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 transition-colors duration-200 ${
                        isOpen ? "text-brand" : "text-zinc-500"
                      }`}
                    />
                  </div>
                  <div className="flex flex-col gap-0.5 flex-1">
                    <span
                      className={`font-display font-semibold text-sm transition-colors ${
                        isOpen ? "text-zinc-100" : "text-zinc-300"
                      }`}
                    >
                      {service.title}
                    </span>
                    <span className="text-xs text-zinc-600">{service.tag}</span>
                  </div>
                  <motion.div
                    animate={{ rotate: isOpen ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0"
                  >
                    <ArrowRight
                      className={`w-4 h-4 transition-colors duration-200 ${
                        isOpen ? "text-brand" : "text-zinc-600"
                      }`}
                    />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      variants={accordionVariants}
                      initial="closed"
                      animate="open"
                      exit="closed"
                      className="overflow-hidden"
                    >
                      <div className="pb-6 pl-1">
                        <p className="text-zinc-400 text-sm leading-relaxed mb-5">
                          {service.description}
                        </p>
                        <ul className="space-y-2.5">
                          {service.points.map((point) => (
                            <li
                              key={point}
                              className="flex items-start gap-3 text-sm text-zinc-300"
                            >
                              <span className="mt-0.5 w-4 h-4 rounded-full bg-brand/15 border border-brand/25 flex items-center justify-center shrink-0">
                                <Check className="w-2.5 h-2.5 text-brand" />
                              </span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}