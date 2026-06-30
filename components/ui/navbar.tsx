"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion"

const navLinks = [
  { href: "#servicios", label: "Servicios" },
  { href: "#portfolio", label: "Portfolio" },
  { href: "#equipo", label: "Nosotros" },
  { href: "#testimonios", label: "Testimonios" },
  { href: "#faq", label: "FAQ" },
]

const sectionIds = ["servicios", "portfolio", "equipo", "testimonios", "faq", "contacto"]

const DEFAULT_CTA = "#F97316" // orange-500

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const [portfolioAccent, setPortfolioAccent] = useState<string | null>(null)

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 })

  // Navbar frost on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Listen for portfolio section accent color
  useEffect(() => {
    const handler = (e: Event) => {
      setPortfolioAccent((e as CustomEvent<string | null>).detail)
    }
    window.addEventListener("portfolioAccent", handler)
    return () => window.removeEventListener("portfolioAccent", handler)
  }, [])

  // Active section via scroll-spy: the last section (in document order)
  // whose top has crossed a reference line near the top of the viewport.
  useEffect(() => {
    const onScroll = () => {
      const line = window.innerHeight * 0.3
      let current = ""
      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (!el) continue
        if (el.getBoundingClientRect().top <= line) current = id
      }
      setActiveSection(current)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const ctaColor = portfolioAccent ?? DEFAULT_CTA
  // Hex alpha suffixes: 30 ≈ 19%, 20 ≈ 13%, 18 ≈ 9%
  const ctaTransition = "color 0.65s cubic-bezier(.22,1,.36,1), border-color 0.65s cubic-bezier(.22,1,.36,1), background-color 0.65s cubic-bezier(.22,1,.36,1), box-shadow 0.65s cubic-bezier(.22,1,.36,1)"

  return (
    <header className="fixed top-0 left-0 right-0 z-40 p-4">
      {/*
        Scroll progress bar: background-color (animatable) +
        CSS mask for the fade-in/out at edges (avoids gradient animation issues)
      */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[2px] origin-left"
        style={{
          scaleX,
          backgroundColor: ctaColor,
          WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
          maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
          opacity: 0.7,
          transition: "background-color 0.65s cubic-bezier(.22,1,.36,1)",
        }}
      />

      <nav
        className={`max-w-5xl mx-auto flex items-center justify-between h-12 px-6 rounded-full border backdrop-blur-md transition-all duration-500 ${
          scrolled
            ? "bg-zinc-900/85 border-zinc-800/60 shadow-lg shadow-zinc-950/20"
            : "bg-zinc-900/20 border-zinc-800/20"
        }`}
      >
        <Link href="/" className="flex items-center">
          <span className="font-display text-2xl font-black tracking-tight text-white">
            LumarSoft
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const id = link.href.replace("#", "")
            const isActive = activeSection === id
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-1.5 text-sm rounded-full transition-colors duration-200 ${
                  isActive ? "text-zinc-100" : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-full bg-zinc-800/70"
                    transition={{ type: "spring", stiffness: 380, damping: 38 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            )
          })}
          <Link
            href="#contacto"
            className="group ml-2 inline-flex items-center gap-2 px-4 py-1.5 text-sm rounded-full border font-medium backdrop-blur-sm"
            style={{
              color: ctaColor,
              borderColor: `${ctaColor}50`,
              backgroundColor: `${ctaColor}18`,
              boxShadow: `0 0 18px ${ctaColor}22`,
              transition: ctaTransition,
            }}
          >
            Contanos tu proyecto
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-zinc-400 hover:text-zinc-100 transition-colors w-5 h-5 relative"
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </motion.span>
            ) : (
              <motion.span
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Menu className="w-5 h-5" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -6, scaleY: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "top" }}
            className="md:hidden mt-2 mx-auto max-w-5xl bg-zinc-900/95 border border-zinc-800/50 rounded-2xl backdrop-blur-md p-4 flex flex-col gap-1"
          >
            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i * 0.05, ease: "easeOut" }}
              >
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-sm rounded-xl transition-colors text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: navLinks.length * 0.05, ease: "easeOut" }}
            >
              <Link
                href="#contacto"
                onClick={() => setOpen(false)}
                className="mt-1 block px-4 py-2.5 text-sm rounded-xl text-center font-medium border backdrop-blur-sm"
                style={{
                  color: ctaColor,
                  borderColor: `${ctaColor}50`,
                  backgroundColor: `${ctaColor}18`,
                  boxShadow: `0 0 18px ${ctaColor}22`,
                  transition: ctaTransition,
                }}
              >
                Contanos tu proyecto
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
