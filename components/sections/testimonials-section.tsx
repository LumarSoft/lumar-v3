"use client"

import { SectionHeading } from "@/components/ui/section-heading"
import { TestimonialCard } from "@/components/ui/testimonial-card"
import { testimonials, type Testimonial } from "@/lib/data/testimonials"

/** Round-robin split so columns stay balanced as testimonials are added. */
function splitIntoColumns(items: Testimonial[], count: number): Testimonial[][] {
  const cols: Testimonial[][] = Array.from({ length: count }, () => [])
  items.forEach((item, i) => cols[i % count].push(item))
  return cols
}

function MarqueeColumn({
  items,
  duration,
  reverse = false,
}: {
  items: Testimonial[]
  duration: number
  reverse?: boolean
}) {
  return (
    <div className="relative h-full overflow-hidden">
      <div
        className="flex flex-col animate-marquee-vertical group-hover:[animation-play-state:paused]"
        style={{
          animationDuration: `${duration}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {/* Duplicated for a seamless -50% loop. mb on each card keeps the loop aligned. */}
        {[...items, ...items].map((t, i) => (
          <div key={i} className="mb-6">
            <TestimonialCard {...t} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function TestimonialsSection() {
  const columns = splitIntoColumns(testimonials, 3)

  return (
    <section id="testimonios" className="px-6 py-24 overflow-hidden bg-zinc-900/20">
      <div className="max-w-5xl mx-auto">
        <SectionHeading
          eyebrow="Testimonios"
          index="05"
          className="mb-14 max-w-lg"
          description="Lo que dicen los que ya trabajaron con nosotros. Sin guion, sin filtro."
        >
          No te lo decimos nosotros. Te lo dicen ellos.
        </SectionHeading>

        {/* Desktop: 2–3 auto-scrolling columns, paused on hover */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6 h-[34rem] marquee-mask-y group">
          <MarqueeColumn items={columns[0]} duration={34} />
          <MarqueeColumn items={columns[1]} duration={42} reverse />
          <div className="hidden lg:block h-full">
            <MarqueeColumn items={columns[2]} duration={38} />
          </div>
        </div>

        {/* Mobile: single column with every testimonial */}
        <div className="md:hidden h-[28rem] marquee-mask-y group">
          <MarqueeColumn items={testimonials} duration={55} />
        </div>
      </div>
    </section>
  )
}
