import Link from "next/link";
import { MapPin } from "lucide-react";
import { whatsappUrl } from "@/lib/site";

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

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

const navLinks = [
  { label: "Servicios", href: "#servicios" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Nosotros", href: "#equipo" },
  { label: "Testimonios", href: "#testimonios" },
  { label: "FAQ", href: "#faq" },
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
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 self-start px-4 py-2 rounded-full text-sm font-medium
                bg-green-500/10 border border-green-500/20 text-green-400
                hover:bg-green-500/18 hover:border-green-500/40
                shadow-[0_0_14px_rgba(34,197,94,0.06)]
                hover:shadow-[0_0_20px_rgba(34,197,94,0.12)]
                backdrop-blur-sm transition-all duration-300"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 shrink-0" />
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
                    className="link-underline text-sm text-zinc-500 hover:text-zinc-200 transition-colors duration-200"
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
                <li
                  key={member.name}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-zinc-400">{member.name}</span>
                  <div className="flex items-center gap-2.5">
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-600 hover:text-[#0A66C2] transition-colors duration-200"
                      aria-label={`LinkedIn ${member.name}`}
                    >
                      <LinkedInIcon className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-600 hover:text-zinc-200 transition-colors duration-200"
                      aria-label={`GitHub ${member.name}`}
                    >
                      <GitHubIcon className="w-3.5 h-3.5" />
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
            © {new Date().getFullYear()} LumarSoft — Todos los derechos
            reservados.
          </p>
          <p className="text-xs text-zinc-800">
            Hecho con cuidado en Rosario, Argentina.
          </p>
        </div>
      </div>

      {/* Giant outline wordmark — agency signature remate */}
      <div className="mt-12 px-2 select-none" aria-hidden="true">
        <span className="wordmark-outline font-display font-black leading-[0.8] block text-center text-[20vw] md:text-[15vw] tracking-tight">
          LumarSoft
        </span>
      </div>
    </footer>
  );
}
