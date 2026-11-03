import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Português de Bolso",
    short_name: "Português",
    description: "Portugués de Portugal para hispanohablantes.",
    lang: "es",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#173e80",
    theme_color: "#1f4e9c",
    icons: [
      { src: "/icons/icon-192.png?v=2", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png?v=2", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png?v=2", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
