"use client";
import { grammarTopics, lessons } from "@/lib/content";
import { useHydrated, useProgress } from "@/lib/progress/react";
import { Badge, LinkCard, PageHeader, SectionTitle } from "@/components/ui/primitives";
import { grammarItemIds } from "@/lib/review/daily";
import { LEVEL_LABEL, levelCounts, overallLevel } from "@/lib/review/mastery";

/** Temas previstos del temario que todavía no tienen ficha. */
const UPCOMING = [
  "Verbos irregulares frecuentes (ir, fazer, querer, poder, vir…)",
  "Orden básico de la frase",
  "Adjetivos y concordancia",
  "Verbos reflexivos",
  "Futuro próximo y planes",
  "Pretérito perfecto simple",
  "Pronombres de complemento y su colocación",
];

export function GrammarIndex() {
  const progress = useProgress();
  const hydrated = useHydrated();
  const units = [...new Set(grammarTopics.map((g) => g.unit))];
  const studied = (id: string) => {
    const l = lessons.find((x) => x.grammarId === id);
    return hydrated && l && progress.lessons[l.id]?.status === "completada";
  };
  const badgeFor = (id: string) => {
    if (!hydrated) return undefined;
    if (progress.patterns[id]?.status === "activo") return <Badge tone="warn">punto débil</Badge>;
    const level = overallLevel(levelCounts(grammarItemIds(id), progress.items));
    if (level === "nuevo") return studied(id) ? <Badge tone="ok">estudiada</Badge> : undefined;
    const tone = level === "dominado" ? "ok" : level === "consolidado" ? "brand" : "neutral";
    return <Badge tone={tone}>{LEVEL_LABEL[level].toLowerCase()}</Badge>;
  };
  return (
    <div>
      <PageHeader title="Gramática" subtitle="Consulta cualquier ficha cuando quieras. El orden recomendado sigue las lecciones." />
      {units.map((u) => (
        <section key={u}>
          <SectionTitle>Unidad {u}</SectionTitle>
          <ul className="space-y-2">
            {grammarTopics
              .filter((g) => g.unit === u)
              .map((g) => (
                <li key={g.id}>
                  <LinkCard
                    href={`/gramatica/${g.id}/`}
                    title={g.title}
                    subtitle={g.summary}
                    right={badgeFor(g.id)}
                  />
                </li>
              ))}
          </ul>
        </section>
      ))}
      <SectionTitle>Próximamente</SectionTitle>
      <ul className="space-y-2 rounded-2xl bg-surface-2/60 p-5 text-[15px] text-ink-2">
        {UPCOMING.map((u) => (
          <li key={u}>· {u}</li>
        ))}
      </ul>
    </div>
  );
}
