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

/** Barra inferior translúcida, como las del sistema. */
export function BottomNav() {
  const pathname = usePathname() ?? "/";
  const focused = useIsFocused();
  if (focused) return null;
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line/60 bg-bar pb-safe backdrop-blur-xl backdrop-saturate-150"
    >
      <ul className="mx-auto flex max-w-xl">
        {TABS.map(({ href, label, Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[52px] flex-col items-center justify-center gap-0.5 pt-1 text-[10.5px] font-medium tracking-normal ${
                  active ? "text-brand" : "text-ink-2"
                }`}
              >
                <Icon width={25} height={25} strokeWidth={active ? 2.1 : 1.7} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
