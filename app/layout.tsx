import type React from "react"
import type { Metadata } from "next"
import { Manrope } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { LenisProvider } from "@/components/providers/lenis-provider"
import "./globals.css"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
})

const siteUrl = "https://lumarsoft.com"

export const metadata: Metadata = {
  title: {
    default: "LumarSoft — Desarrollo Web y Software a Medida",
    template: "%s | LumarSoft",
  },
  description:
    "Desarrollo de páginas web, sistemas y aplicaciones a medida. Ecommerce, landing pages, paneles de gestión y software personalizado. Trabajamos en remoto con clientes de Argentina y el mundo. Sin intermediarios, sin vueltas.",
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
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "LumarSoft",
      url: siteUrl,
      telephone: "+5493415690470",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Rosario",
        addressRegion: "Santa Fe",
        addressCountry: "AR",
      },
      areaServed: "Worldwide",
      description:
        "Estudio de desarrollo web y software a medida con base en Rosario, Argentina. Especialistas en ecommerce, landing pages, aplicaciones web y sistemas de gestión. Trabajo remoto para clientes de Argentina y el mundo.",
      knowsAbout: [
        "Desarrollo Web",
        "Software a Medida",
        "Ecommerce",
        "Landing Pages",
        "Aplicaciones Web",
        "Sistemas de Gestión",
        "React",
        "Next.js",
        "TypeScript",
        "Node.js",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "LumarSoft",
      publisher: { "@id": `${siteUrl}/#organization` },
      inLanguage: "es-AR",
    },
    {
      "@type": "ProfessionalService",
      "@id": `${siteUrl}/#service`,
      name: "LumarSoft — Desarrollo Web y Software",
      provider: { "@id": `${siteUrl}/#organization` },
      areaServed: "Worldwide",
      serviceType: [
        "Desarrollo Web",
        "Software a Medida",
        "Ecommerce",
        "Landing Pages",
        "Aplicaciones Web",
        "Sistemas de Gestión",
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Servicios de Desarrollo",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Ecommerce a Medida" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Landing Pages" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Aplicaciones Web a Medida" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Sistemas de Gestión" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Rediseño Web" } },
        ],
      },
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
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
      <body className={`${manrope.variable} font-sans antialiased bg-zinc-950 text-zinc-100`}>
        <LenisProvider>{children}</LenisProvider>
        <Analytics />
      </body>
    </html>
  )
}
