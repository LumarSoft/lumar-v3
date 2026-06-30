import { Star } from "lucide-react";
import Image from "next/image";
import type { Testimonial } from "@/lib/data/testimonials";

function initialsOf(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function TestimonialCard({
  text,
  name,
  role,
  image,
  rating,
}: Testimonial) {
  return (
    <figure className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-sm p-6 shadow-lg shadow-black/20">
      {typeof rating === "number" && (
        <div
          className="flex items-center gap-0.5 mb-4"
          aria-label={`${rating} de 5`}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={
                i < rating
                  ? "w-3.5 h-3.5 fill-brand text-brand"
                  : "w-3.5 h-3.5 text-zinc-700"
              }
            />
          ))}
        </div>
      )}

      <blockquote className="text-sm text-zinc-300 leading-relaxed">
        “{text}”
      </blockquote>

      <figcaption className="flex items-center gap-3 mt-5 pt-5 border-t border-zinc-800/60">
        {image ? (
          <Image
            src={image}
            alt={name}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover ring-1 ring-zinc-700"
          />
        ) : (
          <span className="h-10 w-10 rounded-full bg-brand/15 border border-brand/30 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-brand">
              {initialsOf(name)}
            </span>
          </span>
        )}
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-zinc-100 leading-tight">
            {name}
          </span>
          <span className="text-xs text-zinc-500 leading-tight">{role}</span>
        </div>
      </figcaption>
    </figure>
  );
}
