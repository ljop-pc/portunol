import Link from "next/link";
import { grammarById } from "@/lib/content";
import type { ErrorCategory } from "@/lib/content/schema";
import { CATEGORY_LABELS } from "@/lib/correction";
import type { PatternRecord } from "@/lib/progress/store";

const WHY: Partial<Record<ErrorCategory, string>> = {
  "variante-br": "Estás usando formas de Brasil. Se entienden, pero en Portugal suenan extranjeras.",
  "interferencia-es": "El español te está jugando una mala pasada en este punto: la forma parecida no es la correcta.",
  gramatica: "Es un punto de gramática que todavía no está asentado. Repasa la regla y fíjate en los ejemplos.",
  vocabulario: "El problema está en la palabra elegida, no en la gramática.",
  "poco-natural": "Tus frases se entienden, pero un portugués lo diría de otra forma.",
  registro: "Estás mezclando tratamientos (tu / você / o senhor).",
  ortografia: "Fíjate en las tildes y guiones: en portugués cambian el significado.",
};

/** Micro-explicación de un punto débil: 20 segundos, no la ficha entera. */
export function PatternTip({ pattern }: { pattern: PatternRecord }) {
  const topic = grammarById.get(pattern.topic);
  if (!topic) return null;
  return (
    <div className="rounded-3xl bg-surface p-5 shadow-card">
      <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-warn">Punto débil · {CATEGORY_LABELS[pattern.category]}</p>
      <h3 className="mt-1 text-[22px] font-bold leading-tight tracking-[-0.025em]">{topic.title}</h3>
      <p className="mt-2 text-[15px] text-ink-2">
        Has fallado {pattern.failures} veces en este tema. {WHY[pattern.category] ?? ""}
      </p>
      <ul className="mt-4 space-y-3">
        {topic.commonErrors.slice(0, 2).map((e) => (
          <li key={e.wrong} className="text-[16px]">
            <p className="text-bad line-through decoration-1" lang="pt-PT">
              {e.wrong}
            </p>
            <p className="font-semibold text-ok" lang="pt-PT">
              ✓ {e.right}
            </p>
            <p className="text-sm text-ink-2">{e.why}</p>
          </li>
        ))}
      </ul>
      <Link href={`/gramatica/${topic.id}/`} className="mt-4 inline-block text-[15px] font-medium text-brand">
        Ver la ficha completa ›
      </Link>
    </div>
  );
}
