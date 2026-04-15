"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { MessageCircle, Send } from "lucide-react"

export function CtaSection() {
  const [form, setForm] = useState({ nombre: "", email: "", mensaje: "" })
  const [sent, setSent] = useState(false)

  function handleWhatsApp(e: React.FormEvent) {
    e.preventDefault()
    const text = encodeURIComponent(
      `Hola, soy ${form.nombre}${form.email ? ` (${form.email})` : ""}.\n\n${form.mensaje}`
    )
    window.open(`https://wa.me/5493415690470?text=${text}`, "_blank")
    setSent(true)
  }

  return (
    <section id="contacto" className="px-6 py-24">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">Contacto</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-zinc-100 mb-6 leading-tight">
              ¿Tenés un proyecto en mente?{" "}
              <span className="text-zinc-500">Contanos.</span>
            </h2>
            <p className="text-zinc-500 text-sm leading-relaxed mb-8">
              No hace falta tener todo claro todavía. Contanos qué necesitás y charlamos. Sin presión, sin vendedores.
            </p>

            <a
              href="https://wa.me/5493415690470"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 transition-all duration-200 text-sm font-medium text-zinc-100"
            >
              <MessageCircle className="w-4 h-4 text-zinc-400" />
              Hablemos por WhatsApp
            </a>

            <p className="mt-6 text-xs text-zinc-600">
              Respondemos en menos de 24hs. Sin spam, sin seguimiento.
            </p>
          </motion.div>

          {/* Right — Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {sent ? (
              <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 text-center">
                <p className="text-zinc-100 font-semibold mb-2">Gracias, {form.nombre}.</p>
                <p className="text-zinc-500 text-sm">Te abrimos WhatsApp para seguir la charla.</p>
              </div>
            ) : (
              <form onSubmit={handleWhatsApp} className="space-y-4">
                <div>
                  <label htmlFor="nombre" className="block text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">
                    Nombre
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    required
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Tu nombre"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 focus:border-zinc-600 focus:outline-none text-zinc-100 placeholder-zinc-600 text-sm transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="tu@empresa.com"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 focus:border-zinc-600 focus:outline-none text-zinc-100 placeholder-zinc-600 text-sm transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="mensaje" className="block text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">
                    Mensaje
                  </label>
                  <textarea
                    id="mensaje"
                    required
                    value={form.mensaje}
                    onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                    placeholder="Contanos qué necesitás, aunque sea a grandes rasgos..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 focus:border-zinc-600 focus:outline-none text-zinc-100 placeholder-zinc-600 text-sm transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-zinc-100 text-zinc-900 font-medium text-sm hover:bg-zinc-200 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Enviar por WhatsApp
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
