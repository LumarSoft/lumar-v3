"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface SectionHeadingProps {
  /** Small brand eyebrow label, e.g. "Servicios" */
  eyebrow: string;
  /** Two-digit section index, e.g. "01" */
  index?: string;
  /** The main heading. Pass a string or rich JSX. */
  children: ReactNode;
  /** Optional supporting paragraph below the heading. */
  description?: ReactNode;
  /** Max width class for the heading block. */
  className?: string;
  align?: "left" | "center";
}

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Signature section heading used across the marketing sections.
 * Replaces the repeated "brand eyebrow + h2 + p" formula with a single
 * editorial treatment: an animated rule, a monospace index, the eyebrow,
 * and a heading that wipes up word-by-word feel via blur.
 */
export function SectionHeading({
  eyebrow,
  index,
  children,
  description,
  className = "",
  align = "left",
}: SectionHeadingProps) {
  const isCenter = align === "center";

  return (
    <div className={`${isCenter ? "flex flex-col items-center text-center" : ""} ${className}`}>
      {/* Eyebrow row: drawn rule + index + label */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease }}
        className="flex items-center gap-3 mb-5"
      >
        <motion.span
          aria-hidden
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease }}
          className="h-px w-8 origin-left bg-gradient-to-r from-brand to-brand/0"
        />
        {index && (
          <span className="font-mono text-xs font-semibold text-brand/70 tabular-nums">
            {index}
          </span>
        )}
        <span className="text-xs font-medium text-brand uppercase tracking-[0.2em]">
          {eyebrow}
        </span>
      </motion.div>

      {/* Heading */}
      <motion.h2
        initial={{ opacity: 0, y: 22, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease }}
        className="font-display text-3xl md:text-4xl font-bold text-zinc-100 leading-tight text-balance"
      >
        {children}
      </motion.h2>

      {/* Description */}
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1, ease }}
          className="text-zinc-500 mt-4 max-w-xl text-sm leading-relaxed"
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}
