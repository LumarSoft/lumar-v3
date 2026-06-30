"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, animate, useMotionValue, type PanInfo } from "framer-motion";
import Image from "next/image";

const projects = [
  {
    number: "01",
    client: "John Pellegrini",
    industry: "Seguros · Productor Asesor",
    category: "Web + Bot con IA",
    tags: ["Next.js", "WhatsApp Bot", "IA"],
    problem:
      "Una trayectoria de más de 50 años en seguros, pero una presencia digital que no la reflejaba — y consultas de clientes dispersas entre llamados y WhatsApp que se perdían.",
    solution:
      "Le construimos el sitio web completo con cotizador de seguros, más un bot de WhatsApp con inteligencia artificial que atiende, cotiza y deriva 24/7, todo integrado a un panel de administración.",
    image: "/JohnPellegriniPng.png",
    accent: "#FBBF24",
    accentRgb: "251,191,36",
    impact: [
      "Sitio web a medida con cotizador de seguros online",
      "Bot de WhatsApp con IA que atiende y cotiza 24/7",
      "Panel de administración integrado con el bot",
      "Cada consulta queda registrada y derivada, sin perderse",
    ],
    stack: [
      "Next.js 16",
      "React 19",
      "NestJS",
      "WhatsApp Cloud API",
      "OpenAI",
      "MySQL",
    ],
  },
  {
    number: "02",
    client: "FULL E-commerce",
    industry: "Retail & Tecnología",
    category: "Tienda online",
    tags: ["E-commerce", "Chat integrado"],
    problem:
      "Querían vender online pero perder el contacto directo con el comprador era inaceptable.",
    solution:
      "Creamos un e-commerce que deriva cada venta al chat del vendedor para cerrarla de forma personalizada. Tecnología al servicio del trato humano.",
    image: "/FlyspiritsPng.webp",
    accent: "#F59E0B",
    accentRgb: "245,158,11",
    impact: [
      "Canal de ventas online sin perder el trato uno a uno",
      "Cada compra termina en conversación directa con el vendedor",
    ],
    stack: [] as string[],
  },
  {
    number: "03",
    client: "Heroica",
    industry: "Hospitalidad & Gastronomía",
    category: "Plataforma Interna",
    tags: ["Web App", "Multi-sucursal", "B2B"],
    problem:
      "Múltiples sucursales, contabilidad manual y gestión de personal fragmentada. Sin visibilidad en tiempo real de nada.",
    solution:
      "Plataforma full-stack con módulos de tesorería, RRHH, aprobación de pagos y reportes en PDF. Cero Excel, todo centralizado.",
    image: "/HeroicaPng.webp",
    accent: "#22D3EE",
    accentRgb: "34,211,238",
    impact: [
      "Flujo de caja de múltiples sucursales en un solo lugar",
      "Reportes contables en PDF bajo demanda",
      "Gestión de personal con escalas e incentivos",
      "Autenticación 2FA y permisos por roles",
    ],
    stack: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "MySQL",
      "JWT + 2FA",
      "Vercel Blob",
      "Resend",
    ],
  },
  {
    number: "04",
    client: "UESEVI",
    industry: "Sindicato · Seguridad Privada",
    category: "Sistema Administrativo",
    tags: ["Web App", "Portal Multi-rol", "Full Stack"],
    problem:
      "Gestionaban aportes de 150+ empresas con planillas Excel y cálculos manuales. Sin historial auditable ni trazabilidad.",
    solution:
      "Portal multi-rol que automatiza todo: las empresas presentan sus declaraciones online y el sistema calcula importes, intereses y vencimientos.",
    image: "/UeseviPng.webp",
    accent: "#3B82F6",
    accentRgb: "59,130,246",
    impact: [
      "+150 empresas con declaraciones autónomas",
      "De +5 minutos en Excel a segundos en pantalla",
      "Cero cálculos manuales: salarios e intereses automáticos",
      "Recordatorio mensual sin intervención del equipo",
    ],
    stack: [
      "Next.js 14",
      "Node.js",
      "MySQL",
      "JWT Auth",
      "PDF & Excel export",
      "Nodemailer",
    ],
  },
];

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];
const GAP = 28;
const spring = {
  type: "spring" as const,
  stiffness: 260,
  damping: 34,
  mass: 0.9,
};

export function PortfolioSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [dims, setDims] = useState({ width: 0, cardW: 0 });
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const isInViewRef = useRef(false);
  const x = useMotionValue(0);

  const { width, cardW } = dims;
  const step = cardW + GAP;
  const center = (width - cardW) / 2;
  const targetX = (i: number) => center - i * step;

  // Measure viewport and derive a responsive card width
  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const mobile = w < 768;
      const card = mobile
        ? Math.round(w * 0.86)
        : Math.round(Math.min(Math.max(w * 0.6, 460), 820));
      setDims({ width: w, cardW: card });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Keep the active card centered (snap) whenever index or dimensions change
  useEffect(() => {
    if (!width) return;
    const controls = animate(x, targetX(activeIdx), spring);
    return controls.stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx, width, cardW]);

  // Notify navbar of the active accent while the section is on screen
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        isInViewRef.current = entry.isIntersecting;
        setInView(entry.isIntersecting);
        window.dispatchEvent(
          new CustomEvent("portfolioAccent", {
            detail: entry.isIntersecting ? projects[activeIdx].accent : null,
          }),
        );
      },
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx]);

  useEffect(() => {
    if (isInViewRef.current) {
      window.dispatchEvent(
        new CustomEvent("portfolioAccent", {
          detail: projects[activeIdx].accent,
        }),
      );
    }
  }, [activeIdx]);

  const goTo = (i: number) =>
    setActiveIdx(Math.max(0, Math.min(projects.length - 1, i)));

  // Autoplay: advance on a timer, looping back to the start. Pauses while the
  // user is interacting (hover/drag) or when the section is off screen.
  useEffect(() => {
    if (paused || !inView) return;
    const id = setTimeout(() => {
      setActiveIdx((i) => (i + 1) % projects.length);
    }, 5000);
    return () => clearTimeout(id);
  }, [activeIdx, paused, inView]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (!step) return;
    const projected = x.get() + info.velocity.x * 0.2;
    const idx = Math.round((center - projected) / step);
    goTo(idx);
  };

  // Keyboard nav while the section is focused/in view
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isInViewRef.current) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(activeIdx + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(activeIdx - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx]);

  const active = projects[activeIdx];
  const total = String(projects.length).padStart(2, "0");

  return (
    <section
      ref={sectionRef}
      id="portfolio"
      className="relative bg-zinc-950 overflow-hidden py-20 md:py-28"
    >
      {/* Per-project color atmosphere */}
      {projects.map((proj, i) => (
        <motion.div
          key={proj.number}
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: i === activeIdx ? 1 : 0 }}
          transition={{ duration: 1 }}
          style={{
            background: `radial-gradient(ellipse 60% 60% at 50% 38%, rgba(${proj.accentRgb},0.10) 0%, transparent 65%)`,
          }}
        />
      ))}

      {/* Header */}
      <div className="relative z-10 px-6 md:px-12 lg:px-16 mb-10 md:mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <motion.div
              className="h-px w-10"
              animate={{ backgroundColor: active.accent }}
              transition={{ duration: 0.7 }}
            />
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-500">
              Portafolio
            </span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-zinc-100 leading-[0.95] tracking-tight">
            Casos reales, <span className="text-zinc-500">no demos.</span>
          </h2>
        </div>

        {/* Controls + hint */}
        <div className="flex items-center gap-4">
          <span className="hidden md:block text-xs text-zinc-600">
            <motion.span
              animate={{ color: active.accent }}
              transition={{ duration: 0.6 }}
              className="font-mono font-bold tabular-nums"
            >
              {active.number}
            </motion.span>
            <span className="text-zinc-700"> / {total}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goTo(activeIdx - 1)}
              disabled={activeIdx === 0}
              aria-label="Anterior"
              className="grid h-11 w-11 place-items-center rounded-full border border-zinc-800 text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-100 disabled:opacity-30 disabled:hover:border-zinc-800 disabled:hover:text-zinc-400"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={() => goTo(activeIdx + 1)}
              disabled={activeIdx === projects.length - 1}
              aria-label="Siguiente"
              className="grid h-11 w-11 place-items-center rounded-full border border-zinc-800 text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-100 disabled:opacity-30 disabled:hover:border-zinc-800 disabled:hover:text-zinc-400"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Draggable gallery */}
      <div
        ref={viewportRef}
        className="relative z-10 overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setTimeout(() => setPaused(false), 600)}
      >
        <motion.div
          className="flex items-stretch"
          style={{ x, gap: GAP }}
          drag="x"
          dragConstraints={{
            left: targetX(projects.length - 1),
            right: targetX(0),
          }}
          dragElastic={0.12}
          onDragEnd={onDragEnd}
        >
          {projects.map((p, i) => {
            const isActive = i === activeIdx;
            return (
              <motion.article
                key={p.number}
                className="relative flex-none select-none rounded-2xl overflow-hidden border bg-zinc-900/50 flex flex-col h-[78vh] max-h-[720px] min-h-[560px]"
                style={{
                  width: cardW || "86vw",
                  borderColor: `rgba(${p.accentRgb},0.18)`,
                }}
                animate={{
                  opacity: isActive ? 1 : 0.38,
                  scale: isActive ? 1 : 0.92,
                  filter: isActive ? "blur(0px)" : "blur(1px)",
                }}
                transition={{ duration: 0.5, ease }}
                onClick={() => !isActive && goTo(i)}
              >
                {/* Accent top bar */}
                <div
                  className="absolute top-0 inset-x-0 h-0.5 z-20"
                  style={{ backgroundColor: p.accent }}
                />

                {/* Image */}
                <div className="relative h-[42%] min-h-[180px] overflow-hidden">
                  <Image
                    src={p.image}
                    alt={p.client}
                    fill
                    sizes="(max-width: 768px) 86vw, 60vw"
                    className="object-cover pointer-events-none"
                    draggable={false}
                  />
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: `rgba(${p.accentRgb},0.08)` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/10 to-transparent" />

                  {/* Number badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-zinc-950/70 px-3 py-1 backdrop-blur-sm">
                    <span
                      className="font-mono text-xs font-bold tabular-nums"
                      style={{ color: p.accent }}
                    >
                      {p.number}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-zinc-400">
                      {p.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col gap-3 p-6 md:p-7">
                  <div>
                    <h3 className="font-display text-2xl md:text-3xl font-bold text-zinc-100 leading-tight">
                      {p.client}
                    </h3>
                    <p className="text-zinc-600 text-xs mt-0.5">{p.industry}</p>
                  </div>

                  <p className="text-zinc-500 text-sm italic leading-relaxed">
                    "{p.problem}"
                  </p>

                  <div className="flex items-center gap-2.5">
                    <div
                      className="h-px w-4 flex-none"
                      style={{ backgroundColor: p.accent }}
                    />
                    <span
                      className="text-[10px] font-semibold uppercase tracking-widest"
                      style={{ color: p.accent }}
                    >
                      Lo que construimos
                    </span>
                  </div>

                  <p className="text-zinc-300 text-sm leading-relaxed">
                    {p.solution}
                  </p>

                  <ul className="mt-auto flex flex-col gap-1.5 pt-1">
                    {p.impact.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-[13px] text-zinc-300"
                      >
                        <span
                          className="shrink-0 mt-0.5 text-xs font-bold"
                          style={{ color: p.accent }}
                        >
                          ↗
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  {p.stack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-3 border-t border-zinc-800/60">
                      {p.stack.map((tech) => (
                        <span
                          key={tech}
                          className="text-[11px] text-zinc-400 bg-zinc-800/40 border border-zinc-700/40 px-2.5 py-0.5 rounded-md"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>

      {/* Footer: drag hint + dots */}
      <div className="relative z-10 px-6 md:px-12 lg:px-16 mt-10 flex items-center justify-between gap-6">
        <div className="flex items-center gap-2 text-zinc-600">
          <motion.svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </motion.svg>
          <span className="text-[11px] uppercase tracking-widest">
            Arrastrá para explorar
          </span>
        </div>

        <div className="flex items-center gap-2">
          {projects.map((p, i) => (
            <button
              key={p.number}
              onClick={() => goTo(i)}
              aria-label={`Ir a ${p.client}`}
              className="py-2"
            >
              <motion.div
                animate={{
                  width: i === activeIdx ? 30 : 7,
                  opacity: i === activeIdx ? 1 : 0.3,
                  backgroundColor: i === activeIdx ? active.accent : "#52525b",
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="h-1.5 rounded-full"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
