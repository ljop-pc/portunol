import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/ui/BottomNav";

export const metadata: Metadata = {
  title: { default: "Português de Bolso", template: "%s · Português de Bolso" },
  description: "Aprende a hablar portugués de Portugal (PT-PT) desde el español: gramática clara, vocabulario real y conversaciones.",
  applicationName: "Português de Bolso",
  appleWebApp: { capable: true, title: "Português", statusBarStyle: "default" },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f5f0" },
    { media: "(prefers-color-scheme: dark)", color: "#121418" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-dvh">
        <div className="mx-auto min-h-dvh max-w-xl pt-safe">
          <main className="px-4 pb-28 pt-4">{children}</main>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
