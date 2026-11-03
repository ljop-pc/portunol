"use client";
import { useState } from "react";
import { vocabTopicById, vocabulary } from "@/lib/content";
import { pickForPractice, vocabExercises } from "@/lib/content/practice";
import { getStore, useProgress } from "@/lib/progress/react";
import { Button, PageHeader, ReviewNote } from "@/components/ui/primitives";
import { VocabCard } from "@/components/content/VocabCard";
import { ExerciseSession } from "@/components/exercises/ExerciseSession";
import type { SessionItem } from "@/components/exercises/types";

const SESSION_SIZE = 10;

export function VocabTopicView({ topicId }: { topicId: string }) {
  const topic = vocabTopicById.get(topicId)!;
  const progress = useProgress();
  const [session, setSession] = useState<SessionItem[] | null>(null);
  const [filter, setFilter] = useState<"todas" | "repasar" | "nuevas">("todas");

  const start = () => {
    const picked = pickForPractice(topic.entries, getStore().get().items, SESSION_SIZE);
    setSession(vocabExercises(picked, vocabulary));
    window.scrollTo({ top: 0 });
  };

  if (session) {
    return (
      <ExerciseSession
        items={session}
        title={`Vocabulario: ${topic.title}`}
        onExit={() => setSession(null)}
        onFinish={() => setSession(null)}
        finishLabel="Volver al tema"
      />
    );
  }

  const entries = topic.entries.filter((e) => {
    const m = progress.items[e.id];
    if (filter === "repasar") return m && m.streak === 0;
    if (filter === "nuevas") return !m;
    return true;
  });

  return (
    <div>
      <PageHeader title={topic.title} subtitle={topic.description} back="/vocabulario/" />
      <Button className="w-full" onClick={start}>
        Practicar {Math.min(SESSION_SIZE, topic.entries.length)} palabras
      </Button>
      <p className="mt-2 text-sm text-ink-2">Se priorizan las palabras que has fallado y las que aún no has visto.</p>

      <div role="tablist" aria-label="Filtrar palabras" className="mt-5 flex gap-2">
        {(["todas", "nuevas", "repasar"] as const).map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={`min-h-[40px] rounded-full px-4 text-sm font-semibold capitalize ${
              filter === f ? "bg-ink text-bg" : "bg-surface-2 text-ink-2"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-ink-2">Toca una palabra para ver el ejemplo y las notas.</p>
      {entries.length === 0 ? (
        <p className="mt-3 rounded-2xl bg-surface-2 p-4 text-ink-2">
          {filter === "repasar" ? "No tienes palabras pendientes de repaso en este tema. ¡Bien!" : "Ya has practicado todas las palabras de este tema."}
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {entries.map((e) => (
            <VocabCard key={e.id} entry={e} mastery={progress.items[e.id]} />
          ))}
        </ul>
      )}
      <ReviewNote />
    </div>
  );
}
