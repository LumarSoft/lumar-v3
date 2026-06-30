import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  // Single-page site con secciones ancladas. Listamos la home y las
  // anclas principales para ayudar a buscadores y motores de IA.
  const sections = [
    "servicios",
    "portfolio",
    "valores",
    "equipo",
    "testimonios",
    "faq",
    "contacto",
  ];

  return [
    {
      url: SITE.url,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...sections.map((id) => ({
      url: `${SITE.url}/#${id}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
