import Link from "next/link";
import { Github, Linkedin, MessageCircle } from "lucide-react";

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
    <footer className="px-6 py-16 border-t border-zinc-900">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="font-display text-xl font-semibold text-zinc-100 tracking-tight"
            >
              LumarSoft
            </Link>
            <p className="mt-3 text-sm text-zinc-500 max-w-xs leading-relaxed">
              Desarrollo web a medida desde Rosario, Argentina.
            </p>
            <a
              href="https://wa.me/5493415690470"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              +54 9 341 569 0470
            </a>
          </div>

          {/* Nav Links */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">
              Menú
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Team */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">
              El equipo
            </h4>
            <ul className="space-y-3">
              {team.map((member) => (
                <li key={member.name} className="flex items-center gap-3">
                  <span className="text-sm text-zinc-400">{member.name}</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-600 hover:text-zinc-400 transition-colors"
                      aria-label={`LinkedIn ${member.name}`}
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-600 hover:text-zinc-400 transition-colors"
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

        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-center gap-4">
          <p className="text-sm text-zinc-700">
            © {new Date().getFullYear()} LumarSoft. Rosario, Argentina.
          </p>
        </div>
      </div>
    </footer>
  );
}
