"use client";
import { useState } from "react";
import { getExercises, grammarById } from "@/lib/content";
import { Button, PageHeader, ReviewNote, SectionTitle } from "@/components/ui/primitives";
import { GrammarContrast, GrammarExamples, GrammarRule, GrammarTables } from "@/components/content/GrammarContent";
import { ExerciseSession } from "@/components/exercises/ExerciseSession";

export function GrammarSheet({ topicId }: { topicId: string }) {
  const topic = grammarById.get(topicId)!;
  const [practicing, setPracticing] = useState(false);

  if (practicing) {
    return (
      <ExerciseSession
        items={getExercises(topic.exerciseIds)}
        title={`Ejercicio corto: ${topic.title}`}
        onExit={() => setPracticing(false)}
        onFinish={() => setPracticing(false)}
        finishLabel="Volver a la ficha"
      />
    );
  }

  return (
    <div>
      <PageHeader title={topic.title} subtitle={topic.summary} back="/gramatica/" />
      <SectionTitle>La regla</SectionTitle>
      <GrammarRule topic={topic} />
      <div className="mt-4">
        <GrammarTables topic={topic} />
      </div>
      <SectionTitle>Ejemplos (PT-PT)</SectionTitle>
      <GrammarExamples topic={topic} />
      <SectionTitle>Español y portugués</SectionTitle>
      <GrammarContrast topic={topic} />
      <SectionTitle>Ejercicio corto</SectionTitle>
      <Button className="w-full" onClick={() => setPracticing(true)}>
        Practicar ({topic.exerciseIds.length} ejercicios)
      </Button>
      {topic.reviewNotes.length > 0 && (
        <details className="mt-6 text-sm text-ink-2">
          <summary className="cursor-pointer">Notas de revisión lingüística</summary>
          <ul className="mt-1 list-disc pl-5">
            {topic.reviewNotes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </details>
      )}
      <ReviewNote />
    </div>
  );
}
