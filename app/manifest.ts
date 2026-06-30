import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LumarSoft — Desarrollo Web y Software a Medida",
    short_name: "LumarSoft",
    description:
      "Desarrollo de páginas web, ecommerce, aplicaciones y sistemas a medida. Sin intermediarios, trabajo remoto, desde Rosario para Argentina y el mundo.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#09090b",
    lang: "es-AR",
    categories: ["business", "productivity", "developer"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
