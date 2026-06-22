'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

const projects = [
  {
    number: '01',
    client: 'John Pellegrini',
    industry: 'Seguros · Productor Asesor',
    category: 'Web + Bot con IA',
    tags: ['Next.js', 'WhatsApp Bot', 'IA'],
    problem:
      'Una trayectoria de más de 50 años en seguros, pero una presencia digital que no la reflejaba — y consultas de clientes dispersas entre llamados y WhatsApp que se perdían.',
    solution:
      'Le construimos el sitio web completo con cotizador de seguros, más un bot de WhatsApp con inteligencia artificial que atiende, cotiza y deriva 24/7, todo integrado a un panel de administración.',
    image: '/JohnPellegriniPng.png',
    accent: '#FBBF24',
    accentRgb: '251,191,36',
    impact: [
      'Sitio web a medida con cotizador de seguros online',
      'Bot de WhatsApp con IA que atiende y cotiza 24/7',
      'Panel de administración integrado con el bot',
      'Cada consulta queda registrada y derivada, sin perderse',
    ],
    stack: ['Next.js 16', 'React 19', 'NestJS', 'WhatsApp Cloud API', 'OpenAI', 'MySQL'],
  },
  {
    number: '02',
    client: 'FULL E-commerce',
    industry: 'Retail & Tecnología',
    category: 'Tienda online',
    tags: ['E-commerce', 'Chat integrado'],
    problem: 'Querían vender online pero perder el contacto directo con el comprador era inaceptable.',
    solution:
      'Creamos un e-commerce que deriva cada venta al chat del vendedor para cerrarla de forma personalizada. Tecnología al servicio del trato humano.',
    image: '/FlyspiritsPng.webp',
    accent: '#F59E0B',
    accentRgb: '245,158,11',
    impact: [
      'Canal de ventas online sin perder el trato uno a uno',
      'Cada compra termina en conversación directa con el vendedor',
    ],
    stack: [] as string[],
  },
  {
    number: '03',
    client: 'Heroica',
    industry: 'Hospitalidad & Gastronomía',
    category: 'Plataforma Interna',
    tags: ['Web App', 'Multi-sucursal', 'B2B'],
    problem:
      'Múltiples sucursales, contabilidad manual y gestión de personal fragmentada. Sin visibilidad en tiempo real de nada.',
    solution:
      'Plataforma full-stack con módulos de tesorería, RRHH, aprobación de pagos y reportes en PDF. Cero Excel, todo centralizado.',
    image: '/HeroicaPng.webp',
    accent: '#22D3EE',
    accentRgb: '34,211,238',
    impact: [
      'Flujo de caja de múltiples sucursales en un solo lugar',
      'Reportes contables en PDF bajo demanda',
      'Gestión de personal con escalas e incentivos',
      'Autenticación 2FA y permisos por roles',
    ],
    stack: ['Next.js 16', 'React 19', 'TypeScript', 'MySQL', 'JWT + 2FA', 'Vercel Blob', 'Resend'],
  },
  {
    number: '04',
    client: 'UESEVI',
    industry: 'Sindicato · Seguridad Privada',
    category: 'Sistema Administrativo',
    tags: ['Web App', 'Portal Multi-rol', 'Full Stack'],
    problem:
      'Gestionaban aportes de 150+ empresas con planillas Excel y cálculos manuales. Sin historial auditable ni trazabilidad.',
    solution:
      'Portal multi-rol que automatiza todo: las empresas presentan sus declaraciones online y el sistema calcula importes, intereses y vencimientos.',
    image: '/UeseviPng.webp',
    accent: '#3B82F6',
    accentRgb: '59,130,246',
    impact: [
      '+150 empresas con declaraciones autónomas',
      'De +5 minutos en Excel a segundos en pantalla',
      'Cero cálculos manuales: salarios e intereses automáticos',
      'Recordatorio mensual sin intervención del equipo',
    ],
    stack: ['Next.js 14', 'Node.js', 'MySQL', 'JWT Auth', 'PDF & Excel export', 'Nodemailer'],
  },
]

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number]

export function PortfolioSection() {
  const [activeIdx, setActiveIdx] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const isInViewRef = useRef(false)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // Notify navbar when section enters/leaves viewport
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        isInViewRef.current = entry.isIntersecting
        if (!entry.isIntersecting) {
          window.dispatchEvent(new CustomEvent('portfolioAccent', { detail: null }))
        }
      },
      { threshold: 0.01 }
    )
    obs.observe(container)
    return () => obs.disconnect()
  }, [])

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const idx = Math.min(Math.floor(latest * projects.length), projects.length - 1)
    setActiveIdx(idx)
    if (isInViewRef.current) {
      window.dispatchEvent(new CustomEvent('portfolioAccent', { detail: projects[idx].accent }))
    }
  })

  const p = projects[activeIdx]
  const total = String(projects.length).padStart(2, '0')

  return (
    <section id="portfolio">
      <div ref={containerRef} className="relative" style={{ height: `${projects.length * 100}vh` }}>
        <div className="sticky top-0 h-screen bg-zinc-950 overflow-hidden">

          {/* Per-project color atmosphere — right half glow */}
          {projects.map((proj, i) => (
            <motion.div
              key={proj.number}
              className="absolute inset-0 pointer-events-none"
              animate={{ opacity: i === activeIdx ? 1 : 0 }}
              transition={{ duration: 1 }}
              style={{
                background: `radial-gradient(ellipse 55% 70% at 78% 50%, rgba(${proj.accentRgb},0.12) 0%, transparent 65%)`,
              }}
            />
          ))}

          {/* ── Mobile ── */}
          <div className="md:hidden flex flex-col h-full">
            <div className="relative h-[45%] flex-none overflow-hidden">
              <motion.div
                className="absolute top-0 inset-x-0 h-0.5 z-20"
                animate={{ backgroundColor: p.accent }}
                transition={{ duration: 0.7 }}
              />
              <AnimatePresence mode="wait">
                <motion.div
                  key={`img-m-${activeIdx}`}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.55, ease }}
                >
                  <Image src={p.image} alt={p.client} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex-1 flex flex-col justify-center px-6 gap-3 overflow-hidden">
              <div className="flex items-center gap-3">
                <motion.span
                  className="font-mono text-xs font-bold"
                  animate={{ color: p.accent }}
                  transition={{ duration: 0.6 }}
                >
                  {p.number} / {total}
                </motion.span>
                <span className="text-[10px] text-zinc-600 uppercase tracking-widest">{p.category}</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`hdr-m-${activeIdx}`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease }}
                >
                  <h2 className="font-display text-3xl font-bold text-zinc-100 leading-tight">{p.client}</h2>
                  <p className="text-zinc-600 text-xs mt-0.5">{p.industry}</p>
                </motion.div>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`body-m-${activeIdx}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3, delay: 0.06, ease }}
                  className="flex flex-col gap-2"
                >
                  <p className="text-zinc-500 text-xs italic leading-relaxed line-clamp-2">"{p.problem}"</p>
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold mt-0.5 shrink-0" style={{ color: p.accent }}>→</span>
                    <p className="text-zinc-300 text-xs leading-relaxed line-clamp-2">{p.solution}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="flex items-center gap-2 mt-1">
                {projects.map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      width: i === activeIdx ? 28 : 6,
                      opacity: i === activeIdx ? 1 : 0.25,
                      backgroundColor: i === activeIdx ? p.accent : '#52525b',
                    }}
                    transition={{ duration: 0.3 }}
                    className="h-1.5 rounded-full"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── Desktop: 40% text | 60% full-height image ── */}
          <div className="hidden md:grid grid-cols-[2fr_3fr] h-full">

            {/* LEFT: editorial story text */}
            <div className="flex flex-col justify-center px-10 lg:px-14 py-10 gap-5 z-10">

              {/* Chapter indicator */}
              <div className="flex items-center gap-3 flex-wrap">
                <motion.div
                  className="h-px w-10 flex-none"
                  animate={{ backgroundColor: p.accent }}
                  transition={{ duration: 0.7 }}
                />
                <motion.span
                  className="font-mono text-xs font-bold tabular-nums"
                  animate={{ color: p.accent }}
                  transition={{ duration: 0.6 }}
                >
                  {p.number} / {total}
                </motion.span>
                <div className="flex gap-1.5 flex-wrap">
                  {[p.category, ...p.tags.slice(0, 2)].map((t) => (
                    <span key={t} className="text-[10px] text-zinc-500 border border-zinc-800 px-2 py-0.5 rounded-full">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Client name */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`hdr-${activeIdx}`}
                  initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(6px)' }}
                  transition={{ duration: 0.42, ease }}
                >
                  <h2 className="font-display text-5xl lg:text-6xl font-bold text-zinc-100 leading-none tracking-tight">
                    {p.client}
                  </h2>
                  <p className="text-zinc-600 text-sm mt-2">{p.industry}</p>
                </motion.div>
              </AnimatePresence>

              {/* Problem as quote */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`prob-${activeIdx}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.38, delay: 0.08, ease }}
                  className="flex flex-col gap-1.5"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">El desafío</span>
                  <p className="text-zinc-400 text-base leading-relaxed italic">"{p.problem}"</p>
                </motion.div>
              </AnimatePresence>

              {/* Accent divider */}
              <div className="flex items-center gap-3">
                <motion.div
                  className="h-px w-5 flex-none"
                  animate={{ backgroundColor: p.accent }}
                  transition={{ duration: 0.7 }}
                />
                <motion.span
                  className="text-xs font-semibold uppercase tracking-widest"
                  animate={{ color: p.accent }}
                  transition={{ duration: 0.6 }}
                >
                  Lo que construimos
                </motion.span>
                <motion.div
                  className="h-px flex-1"
                  animate={{ backgroundColor: p.accent }}
                  style={{ opacity: 0.2 }}
                  transition={{ duration: 0.7 }}
                />
              </div>

              {/* Solution */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={`sol-${activeIdx}`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.36, delay: 0.11, ease }}
                  className="text-zinc-300 text-base leading-relaxed"
                >
                  {p.solution}
                </motion.p>
              </AnimatePresence>

              {/* Progress dots */}
              <div className="flex items-center gap-2 pt-1">
                {projects.map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      width: i === activeIdx ? 32 : 6,
                      opacity: i === activeIdx ? 1 : 0.25,
                      backgroundColor: i === activeIdx ? p.accent : '#52525b',
                    }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="h-1.5 rounded-full"
                  />
                ))}
              </div>
            </div>

            {/* RIGHT: full-height image, no aspect ratio */}
            <div className="relative h-full overflow-hidden">

              {/* Accent top bar */}
              <motion.div
                className="absolute top-0 inset-x-0 h-0.5 z-30"
                animate={{ backgroundColor: p.accent }}
                transition={{ duration: 0.7 }}
              />

              {/* Left-edge fade so text column bleeds in naturally */}
              <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-zinc-950 to-transparent z-20 pointer-events-none" />

              {/* Bottom gradient — sits behind impact bullets */}
              <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent z-20 pointer-events-none" />

              {/* Image crossfade */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`img-${activeIdx}`}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.6, ease }}
                >
                  <Image src={p.image} alt={p.client} fill className="object-cover" />
                  {/* Subtle accent color wash over the photo */}
                  <motion.div
                    className="absolute inset-0"
                    animate={{ backgroundColor: `rgba(${p.accentRgb},0.07)` }}
                    transition={{ duration: 0.9 }}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Colored inset border ring */}
              <motion.div
                className="absolute inset-0 z-30 pointer-events-none"
                animate={{ boxShadow: `inset 0 0 0 1px rgba(${p.accentRgb},0.25)` }}
                transition={{ duration: 0.7 }}
              />

              {/* Impact bullets overlaid at bottom of image */}
              <div className="absolute bottom-0 inset-x-0 z-30 px-8 pb-9">
                <AnimatePresence mode="wait">
                  <motion.ul
                    key={`impact-${activeIdx}`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.38, delay: 0.15, ease }}
                    className="flex flex-col gap-2"
                  >
                    {p.impact.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-zinc-200">
                        <span className="shrink-0 mt-0.5 text-xs font-bold" style={{ color: p.accent }}>
                          ↗
                        </span>
                        {item}
                      </li>
                    ))}
                    {p.stack.length > 0 && (
                      <li className="flex flex-wrap gap-1.5 mt-1.5 pt-2 border-t border-zinc-700/40">
                        {p.stack.map((tech) => (
                          <span
                            key={tech}
                            className="text-xs text-zinc-400 bg-zinc-900/70 border border-zinc-700/50 px-3 py-1 rounded-md backdrop-blur-sm"
                          >
                            {tech}
                          </span>
                        ))}
                      </li>
                    )}
                  </motion.ul>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Scroll hint — first project, desktop only */}
          <AnimatePresence>
            {activeIdx === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                transition={{ duration: 0.4, delay: 0.8 }}
                className="hidden md:flex absolute bottom-10 left-10 lg:left-14 flex-col items-start gap-2 pointer-events-none"
              >
                <span className="text-[10px] text-zinc-700 uppercase tracking-widest">Scroll</span>
                <motion.div
                  animate={{ y: [0, 7, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-px h-6 bg-gradient-to-b from-zinc-700 to-transparent"
                />
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </section>
  )
}
