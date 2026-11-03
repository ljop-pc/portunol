"use client";
import { conversations } from "@/lib/content";
import { useHydrated, useProgress } from "@/lib/progress/react";
import { Badge, LinkCard, PageHeader, SectionTitle } from "@/components/ui/primitives";

const UPCOMING = [
  "Hablar de cómo ha ido el día",
  "Explicar gustos y preferencias",
  "Hablar del tiempo",
  "Hacer preguntas y mantener la conversación",
  "Despedirse de forma natural",
];

export function ConversationIndex() {
  const progress = useProgress();
  const hydrated = useHydrated();
  return (
    <div>
      <PageHeader
        title="Conversación"
        subtitle="Situaciones reales con familia y amigos: lee el diálogo, practica con ayuda y supera el reto sin ver la solución."
      />
      <ul className="space-y-2">
        {conversations.map((c) => {
          const p = hydrated ? progress.conversations[c.id] : undefined;
          return (
            <li key={c.id}>
              <LinkCard
                href={`/conversacion/${c.id}/`}
                title={c.title}
                subtitle={c.goal}
                right={
                  p?.challengeDone ? <Badge tone="ok">reto superado</Badge> : p?.guidedDone ? <Badge tone="brand">practicada</Badge> : undefined
                }
              />
            </li>
          );
        })}
      </ul>
      <SectionTitle>Próximamente</SectionTitle>
      <ul className="space-y-2 rounded-2xl bg-surface-2/60 p-5 text-[15px] text-ink-2">
        {UPCOMING.map((u) => (
          <li key={u}>· {u}</li>
        ))}
      </ul>
    </div>
  );
}
