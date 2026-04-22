"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Send, ArrowRight } from "lucide-react";

export function CtaSection() {
  const [form, setForm] = useState({ nombre: "", email: "", mensaje: "" });
  const [sent, setSent] = useState(false);

  function handleWhatsApp(e: React.FormEvent) {
    e.preventDefault();
    const text = encodeURIComponent(
      `Hola, soy ${form.nombre}${form.email ? ` (${form.email})` : ""}.\n\n${form.mensaje}`,
    );
    window.open(`https://wa.me/5493415690470?text=${text}`, "_blank");
    setSent(true);
  }

  return (
    <section id="contacto" className="px-6 py-24 bg-zinc-900/20">
      <div className="max-w-5xl mx-auto">
        {/* Outer card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="relative rounded-2xl border border-zinc-800/60 bg-zinc-950 overflow-hidden"
        >
          {/* Subtle brand glow top-right */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(ellipse_at_top_right,rgba(218,128,55,0.06),transparent_70%)] pointer-events-none" />
          {/* Subtle green glow bottom-left (WhatsApp) */}
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[radial-gradient(ellipse_at_bottom_left,rgba(34,197,94,0.04),transparent_70%)] pointer-events-none" />

          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Left */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-8 md:p-12 flex flex-col justify-between md:border-r border-b md:border-b-0 border-zinc-800/60"
            >
              <div>
                <p className="text-sm font-medium text-brand uppercase tracking-wider mb-4">
                  Contacto
                </p>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-zinc-100 mb-5 leading-tight">
                  ¿Tenés un proyecto en mente?{" "}
                  <span className="text-zinc-500">Contanos.</span>
                </h2>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  No hace falta tener todo definido. Contanos el problema y
                  evaluamos juntos qué tiene sentido construir, con qué alcance
                  y en qué tiempo.
                </p>
              </div>

              <div className="mt-10 flex flex-col gap-4">
                {/* WhatsApp button — glass green */}
                <a
                  href="https://wa.me/5493415690470"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 self-start px-5 py-3 rounded-full
                    bg-green-500/10 border border-green-500/25 text-green-400
                    hover:bg-green-500/18 hover:border-green-500/45
                    shadow-[0_0_18px_rgba(34,197,94,0.07)]
                    hover:shadow-[0_0_24px_rgba(34,197,94,0.14)]
                    backdrop-blur-sm transition-all duration-300 text-sm font-medium"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  Hablemos por WhatsApp
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                </a>

                <p className="text-xs text-zinc-600">
                  Respondemos en menos de 24hs. Sin spam, sin seguimiento.
                </p>
              </div>
            </motion.div>

            {/* Right — Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-8 md:p-12"
            >
              {sent ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-brand/15 border border-brand/30 flex items-center justify-center mb-4">
                    <Send className="w-5 h-5 text-brand" />
                  </div>
                  <p className="text-zinc-100 font-semibold mb-2">
                    Gracias, {form.nombre}.
                  </p>
                  <p className="text-zinc-500 text-sm">
                    Te abrimos WhatsApp para seguir la charla.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleWhatsApp} className="space-y-4">
                  <div>
                    <label
                      htmlFor="nombre"
                      className="block text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider"
                    >
                      Nombre
                    </label>
                    <input
                      id="nombre"
                      type="text"
                      required
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      placeholder="Tu nombre"
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 focus:border-brand/50 focus:outline-none focus:shadow-[0_0_0_3px_rgba(218,128,55,0.12)] text-zinc-100 placeholder-zinc-600 text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="tu@empresa.com"
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 focus:border-brand/50 focus:outline-none focus:shadow-[0_0_0_3px_rgba(218,128,55,0.12)] text-zinc-100 placeholder-zinc-600 text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="mensaje"
                      className="block text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider"
                    >
                      Mensaje
                    </label>
                    <textarea
                      id="mensaje"
                      required
                      value={form.mensaje}
                      onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                      placeholder="Contanos qué necesitás, aunque sea a grandes rasgos..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 focus:border-brand/50 focus:outline-none focus:shadow-[0_0_0_3px_rgba(218,128,55,0.12)] text-zinc-100 placeholder-zinc-600 text-sm transition-all resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="group w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-brand text-zinc-950 font-semibold text-sm hover:bg-brand/90 transition-all duration-200 shadow-[0_0_20px_rgba(218,128,55,0.2)] hover:shadow-[0_0_28px_rgba(218,128,55,0.35)]"
                  >
                    <Send className="w-4 h-4" />
                    Enviar por WhatsApp
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
