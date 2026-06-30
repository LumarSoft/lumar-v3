"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { faqs } from "@/lib/data/faq";
import { whatsappUrl } from "@/lib/site";

const ease = [0.22, 1, 0.36, 1] as const;

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="px-6 py-24">
      <div className="max-w-3xl mx-auto">
        <SectionHeading
          eyebrow="Preguntas frecuentes"
          index="06"
          className="mb-12"
          description="Las preguntas que más nos hacen antes de empezar. Si te queda otra, escribinos."
        >
          Resolvemos tus dudas antes de empezar.
        </SectionHeading>

        <div className="flex flex-col divide-y divide-zinc-800/60 border-y border-zinc-800/60">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={faq.question}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="group w-full flex items-center justify-between gap-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span
                    className={`font-display text-base md:text-lg font-semibold transition-colors duration-200 ${
                      isOpen
                        ? "text-zinc-100"
                        : "text-zinc-300 group-hover:text-zinc-100"
                    }`}
                  >
                    {faq.question}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.25, ease }}
                    className={`shrink-0 transition-colors duration-200 ${
                      isOpen
                        ? "text-brand"
                        : "text-zinc-500 group-hover:text-zinc-300"
                    }`}
                  >
                    <Plus className="w-5 h-5" />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-zinc-400 leading-relaxed pb-5 pr-10 max-w-xl">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Closing nudge */}
        <p className="text-sm text-zinc-500 mt-8">
          ¿Tenés otra pregunta?{" "}
          <a
            href={whatsappUrl("Hola, tengo una consulta sobre un proyecto.")}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand hover:underline underline-offset-4"
          >
            Escribinos por WhatsApp
          </a>{" "}
          y te respondemos.
        </p>
      </div>
    </section>
  );
}
