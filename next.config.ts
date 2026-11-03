import type { NextConfig } from "next";

// Fase 1: exportación estática (carpeta `out/`), alojada en Cloudflare Pages.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
