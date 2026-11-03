"use client";
import { grammarTopics, lessons } from "@/lib/content";
import { useHydrated, useProgress } from "@/lib/progress/react";
import { Badge, LinkCard, PageHeader, SectionTitle } from "@/components/ui/primitives";

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
                    right={studied(g.id) ? <Badge tone="ok">estudiada</Badge> : undefined}
                  />
                </li>
              ))}
          </ul>
        </section>
      ))}
      <SectionTitle>Próximamente</SectionTitle>
      <ul className="space-y-1.5 rounded-2xl border border-dashed border-line p-4 text-ink-2">
        {UPCOMING.map((u) => (
          <li key={u}>· {u}</li>
        ))}
      </ul>
    </div>
  );
}
