"use client";

import { ReactLenis } from "@studio-freight/react-lenis";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface LenisProviderProps {
  children: ReactNode;
}

/**
 * Scroll suave para la landing.
 *
 * OJO: Lenis con `root` intercepta los eventos de rueda de TODO el documento.
 * Eso rompe cualquier contenedor con scroll propio (modales, tablas, listas):
 * el evento nunca llega al elemento, así que no scrollea aunque el CSS esté
 * perfecto. En el panel es un efecto que no aporta nada y molesta, así que
 * directamente no lo montamos ahí.
 */
export function LenisProvider({ children }: LenisProviderProps) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return <>{children}</>;

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
