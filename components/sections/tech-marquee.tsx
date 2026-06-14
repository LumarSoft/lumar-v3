"use client";

// Infinite, edge-faded marquee of the stack we build with.
// Adds motion + technical credibility between the hero and the services.
const stack = [
  "Next.js",
  "React",
  "TypeScript",
  "Node.js",
  "PostgreSQL",
  "MySQL",
  "Tailwind CSS",
  "Prisma",
  "Vercel",
  "React Native",
  "Framer Motion",
  "Figma",
];

function Row() {
  return (
    <ul className="flex items-center gap-10 px-5 shrink-0">
      {stack.map((tech) => (
        <li
          key={tech}
          className="flex items-center gap-10 font-display text-lg font-medium text-zinc-600 whitespace-nowrap transition-colors duration-300 hover:text-zinc-200"
        >
          {tech}
          <span className="w-1 h-1 rounded-full bg-brand/40" aria-hidden />
        </li>
      ))}
    </ul>
  );
}

export function TechMarquee() {
  return (
    <section
      aria-label="Tecnologías con las que trabajamos"
      className="relative border-y border-zinc-900 bg-zinc-950/60 py-7 overflow-hidden"
    >
      <div className="marquee-mask">
        <div className="flex w-max animate-marquee">
          {/* Duplicated for a seamless -50% loop */}
          <Row />
          <Row />
        </div>
      </div>
    </section>
  );
}
