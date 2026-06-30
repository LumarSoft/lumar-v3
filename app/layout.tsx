import type React from "react";
import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { SITE } from "@/lib/site";
import { buildJsonLd } from "@/lib/structured-data";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const siteUrl = SITE.url;

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  title: {
    default: "LumarSoft — Desarrollo Web y Software a Medida",
    template: "%s | LumarSoft",
  },
  applicationName: "LumarSoft",
  category: "technology",
  description:
    "Desarrollo de páginas web, sistemas y aplicaciones a medida. Ecommerce, landing pages, paneles de gestión y software personalizado. Trabajamos en remoto con clientes de Argentina y el mundo. Sin intermediarios, sin vueltas.",
  formatDetection: { telephone: true, email: false, address: false },
  appleWebApp: {
    capable: true,
    title: "LumarSoft",
    statusBarStyle: "black-translucent",
  },
  keywords: [
    "desarrollo web",
    "desarrollo web a medida",
    "páginas web profesionales",
    "desarrollo de software",
    "sistemas web",
    "aplicaciones web a medida",
    "ecommerce a medida",
    "tienda online",
    "landing pages",
    "diseño web",
    "panel de administración",
    "software a medida",
    "desarrollo web Argentina",
    "desarrollo web Rosario",
    "programación web",
    "agencia desarrollo web",
    "sistemas de gestión",
    "desarrollo web para empresas",
    "página web para pymes",
  ],
  authors: [{ name: "LumarSoft", url: siteUrl }],
  creator: "LumarSoft",
  publisher: "LumarSoft",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: siteUrl,
    title: "LumarSoft — Desarrollo Web y Software a Medida",
    description:
      "Desarrollamos páginas web, ecommerce, aplicaciones y sistemas a medida. Trabajo remoto con clientes de Argentina y cualquier parte del mundo. Sin intermediarios, sin vueltas.",
    siteName: "LumarSoft",
  },
  twitter: {
    card: "summary_large_image",
    title: "LumarSoft — Desarrollo Web y Software a Medida",
    description:
      "Desarrollo de páginas web, ecommerce y sistemas a medida. Sin intermediarios, trabajo remoto, para clientes de Argentina y el mundo.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo-ls.png",
    shortcut: "/logo-ls.png",
    apple: "/logo-ls.png",
  },
};

const jsonLd = buildJsonLd();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cal+Sans&family=Instrument+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${manrope.variable} font-sans antialiased bg-zinc-950 text-zinc-100`}
      >
        {/* Film grain — subtle premium texture across the whole site */}
        <div className="noise-overlay" aria-hidden="true" />
        <LenisProvider>{children}</LenisProvider>
        <Analytics />
      </body>
    </html>
  );
}
