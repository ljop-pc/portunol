"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconChat, IconGrammar, IconLearn, IconProgress, IconVocab } from "./icons";
import { useIsFocused } from "./focus";

const TABS = [
  { href: "/", label: "Aprender", Icon: IconLearn, match: (p: string) => p === "/" || p.startsWith("/aprender") },
  { href: "/gramatica/", label: "Gramática", Icon: IconGrammar, match: (p: string) => p.startsWith("/gramatica") },
  { href: "/vocabulario/", label: "Vocabulario", Icon: IconVocab, match: (p: string) => p.startsWith("/vocabulario") },
  { href: "/conversacion/", label: "Conversación", Icon: IconChat, match: (p: string) => p.startsWith("/conversacion") },
  { href: "/progreso/", label: "Progreso", Icon: IconProgress, match: (p: string) => p.startsWith("/progreso") },
];

export function BottomNav() {
  const pathname = usePathname() ?? "/";
  const focused = useIsFocused();
  if (focused) return null;
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur pb-safe"
    >
      <ul className="mx-auto flex max-w-xl">
        {TABS.map(({ href, label, Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
                  active ? "text-brand" : "text-ink-2"
                }`}
              >
                <Icon width={24} height={24} strokeWidth={active ? 2.2 : 1.8} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
