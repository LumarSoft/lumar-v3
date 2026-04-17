import Link from "next/link";
import { Github, Linkedin, MessageCircle, MapPin } from "lucide-react";

const navLinks = [
  { label: "Servicios", href: "#servicios" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Nosotros", href: "#equipo" },
  { label: "Contacto", href: "#contacto" },
];

const team = [
  {
    name: "Mateo Bodini",
    linkedin: "https://www.linkedin.com/in/mateobodini/",
    github: "https://github.com/mateoBodiniARG",
  },
  {
    name: "Marcelo Benitez",
    linkedin: "https://www.linkedin.com/in/benitez-marcelo/",
    github: "https://github.com/marcebenitez2",
  },
  {
    name: "Lucas Quaroni",
    linkedin: "https://www.linkedin.com/in/lucasquaroni/",
    github: "https://github.com/LucasQuaroni",
  },
];

export function FooterSection() {
  return (
    <footer className="relative px-6 pt-16 pb-8 overflow-hidden">
      {/* Top border with brand glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-[radial-gradient(ellipse_at_top,rgba(218,128,55,0.05),transparent_70%)] pointer-events-none" />

      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <Link
              href="/"
              className="font-display text-xl font-semibold text-zinc-100 tracking-tight w-fit"
            >
              LumarSoft
            </Link>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Desarrollo web a medida desde Rosario. Escuchamos el problema
              antes de escribir una línea de código.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-zinc-600">
              <MapPin className="w-3 h-3 shrink-0" />
              Rosario, Argentina
            </div>
            <a
              href="https://wa.me/5493415690470"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 self-start px-4 py-2 rounded-full text-sm font-medium
                bg-green-500/10 border border-green-500/20 text-green-400
                hover:bg-green-500/18 hover:border-green-500/40
                shadow-[0_0_14px_rgba(34,197,94,0.06)]
                hover:shadow-[0_0_20px_rgba(34,197,94,0.12)]
                backdrop-blur-sm transition-all duration-300"
            >
              <MessageCircle className="w-3.5 h-3.5 shrink-0" />
              Hablemos por WhatsApp
            </a>
          </div>

          {/* Nav */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-5">
              Navegación
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Team */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-5">
              El equipo
            </h4>
            <ul className="space-y-4">
              {team.map((member) => (
                <li key={member.name} className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">{member.name}</span>
                  <div className="flex items-center gap-2.5">
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-600 hover:text-zinc-300 transition-colors duration-200"
                      aria-label={`LinkedIn ${member.name}`}
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-600 hover:text-zinc-300 transition-colors duration-200"
                      aria-label={`GitHub ${member.name}`}
                    >
                      <Github className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-zinc-900/80 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-zinc-700">
            © {new Date().getFullYear()} LumarSoft — Todos los derechos reservados.
          </p>
          <p className="text-xs text-zinc-800">
            Hecho con cuidado en Rosario, Argentina.
          </p>
        </div>
      </div>
    </footer>
  );
}
