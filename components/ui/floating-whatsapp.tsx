"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

export function FloatingWhatsApp() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          href={whatsappUrl("Hola, me gustaría contarles un proyecto.")}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Hablar por WhatsApp"
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className="group fixed bottom-5 right-5 z-50 flex items-center gap-0 overflow-hidden
            rounded-full bg-green-500 text-zinc-950 shadow-[0_8px_30px_rgba(34,197,94,0.35)]
            h-14 pl-4 pr-4 md:hover:pr-5"
        >
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20 pointer-events-none" />
          <WhatsAppIcon className="relative w-7 h-7 shrink-0" />
          {/* Label expands on hover (desktop) */}
          <span className="relative hidden md:block max-w-0 group-hover:max-w-[12rem] overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-300 ease-out group-hover:ml-2.5">
            Hablemos por WhatsApp
          </span>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
