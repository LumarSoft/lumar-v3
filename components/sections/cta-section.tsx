"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M16 2C8.268 2 2 8.268 2 16c0 2.478.648 4.8 1.782 6.818L2 30l7.374-1.762A13.94 13.94 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2Zm0 25.6a11.54 11.54 0 0 1-5.88-1.606l-.422-.252-4.374 1.046 1.072-4.254-.276-.436A11.56 11.56 0 0 1 4.4 16C4.4 9.59 9.59 4.4 16 4.4S27.6 9.59 27.6 16 22.41 27.6 16 27.6Zm6.34-8.674c-.348-.174-2.06-1.016-2.38-1.132-.318-.116-.55-.174-.782.174-.232.348-.898 1.132-1.1 1.364-.202.232-.404.26-.752.086-.348-.174-1.47-.542-2.8-1.726-1.034-.922-1.732-2.06-1.934-2.408-.202-.348-.022-.536.152-.708.156-.156.348-.406.522-.61.174-.202.232-.348.348-.58.116-.232.058-.436-.028-.61-.088-.174-.782-1.888-1.072-2.584-.282-.678-.568-.586-.782-.596l-.666-.012c-.232 0-.61.086-.928.434-.318.348-1.216 1.188-1.216 2.896s1.244 3.36 1.418 3.592c.174.232 2.448 3.736 5.932 5.238.83.358 1.478.572 1.982.732.832.264 1.59.226 2.188.138.668-.1 2.06-.842 2.35-1.656.29-.814.29-1.512.202-1.656-.086-.144-.318-.232-.666-.406Z" />
    </svg>
  );
}

export function CtaSection() {
  const [form, setForm] = useState({ nombre: "", mensaje: "" });
  const [sent, setSent] = useState(false);

  function handleWhatsApp(e: React.FormEvent) {
    e.preventDefault();
    const text = encodeURIComponent(
      `Hola, soy ${form.nombre}.\n\n${form.mensaje}`,
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

              <div className="mt-10 flex flex-col gap-3">
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
                  <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/25 flex items-center justify-center mb-4">
                    <WhatsAppIcon className="w-5 h-5 text-green-400" />
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
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 focus:border-brand/50 focus:outline-none focus:shadow-[0_0_0_3px_rgba(218,128,55,0.12)] text-zinc-100 placeholder-zinc-600 text-sm transition-all resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="group w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-full
                      bg-green-500/10 border border-green-500/25 text-green-400
                      hover:bg-green-500/15 hover:border-green-500/40
                      shadow-[0_0_20px_rgba(34,197,94,0.07)] hover:shadow-[0_0_28px_rgba(34,197,94,0.14)]
                      transition-all duration-300 text-sm font-medium"
                  >
                    <WhatsAppIcon className="w-4 h-4 shrink-0" />
                    Enviar por WhatsApp
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
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
