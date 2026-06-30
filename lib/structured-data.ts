// Structured data (JSON-LD) para SEO tradicional y GEO/AIO (motores de IA).
// Se construye desde una sola fuente de datos para mantenerse en sincronía.

import { SITE, FOUNDERS } from "./site";
import { faqs } from "./data/faq";

const url = SITE.url;

const services = [
  "Ecommerce a Medida",
  "Landing Pages",
  "Aplicaciones Web a Medida",
  "Sistemas de Gestión",
  "Rediseño Web",
];

export function buildJsonLd() {
  const organization = {
    "@type": "Organization",
    "@id": `${url}/#organization`,
    name: SITE.name,
    url,
    logo: `${url}/icon.svg`,
    image: `${url}/opengraph-image`,
    telephone: SITE.phone,
    slogan: "Eso que imaginás para tu empresa, lo construimos.",
    description:
      "Estudio de desarrollo web y software a medida con base en Rosario, Argentina. Especialistas en ecommerce, landing pages, aplicaciones web y sistemas de gestión. Trabajo remoto para clientes de Argentina y el mundo.",
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE.city,
      addressRegion: SITE.region,
      addressCountry: SITE.country,
    },
    foundingLocation: {
      "@type": "Place",
      name: "Rosario, Santa Fe, Argentina",
      geo: {
        "@type": "GeoCoordinates",
        latitude: -32.9442,
        longitude: -60.6505,
      },
    },
    areaServed: "Worldwide",
    founder: FOUNDERS.map((f) => ({
      "@type": "Person",
      name: f.name,
      sameAs: [...f.sameAs],
    })),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: SITE.phone,
      contactType: "customer support",
      areaServed: ["AR", "Worldwide"],
      availableLanguage: ["Spanish", "English"],
    },
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
  };

  const website = {
    "@type": "WebSite",
    "@id": `${url}/#website`,
    url,
    name: SITE.name,
    publisher: { "@id": `${url}/#organization` },
    inLanguage: "es-AR",
  };

  const professionalService = {
    "@type": "ProfessionalService",
    "@id": `${url}/#service`,
    name: "LumarSoft — Desarrollo Web y Software",
    provider: { "@id": `${url}/#organization` },
    areaServed: "Worldwide",
    serviceType: services,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Servicios de Desarrollo",
      itemListElement: services.map((name) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name },
      })),
    },
  };

  const faqPage = {
    "@type": "FAQPage",
    "@id": `${url}/#faq`,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  const webPage = {
    "@type": "WebPage",
    "@id": `${url}/#webpage`,
    url,
    name: "LumarSoft — Desarrollo Web y Software a Medida",
    isPartOf: { "@id": `${url}/#website` },
    about: { "@id": `${url}/#organization` },
    inLanguage: "es-AR",
    primaryImageOfPage: `${url}/opengraph-image`,
    // Para asistentes de voz / motores de IA: qué partes son "leíbles".
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "h2"],
    },
  };

  return {
    "@context": "https://schema.org",
    "@graph": [organization, website, professionalService, faqPage, webPage],
  };
}
