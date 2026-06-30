import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  // Single-page site: solo la home es una URL indexable. Los anclajes (#seccion)
  // no se listan porque los buscadores ignoran los fragmentos de URL. Cuando se
  // agreguen páginas reales (servicios, casos, blog) se suman acá.
  return [
    {
      url: SITE.url,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
