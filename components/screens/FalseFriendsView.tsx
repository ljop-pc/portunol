"use client";
import { useState } from "react";
import { falseFriends } from "@/lib/content";
import { falseFriendExercises, pickForPractice } from "@/lib/content/practice";
import { getStore, useProgress } from "@/lib/progress/react";
import { Button, PageHeader, ReviewNote } from "@/components/ui/primitives";
import { AudioButton } from "@/components/audio/AudioButton";
import { masteryBadge } from "@/components/content/VocabCard";
import { ExerciseSession } from "@/components/exercises/ExerciseSession";
import type { SessionItem } from "@/components/exercises/types";

export function FalseFriendsView() {
  const progress = useProgress();
  const [session, setSession] = useState<SessionItem[] | null>(null);

  if (session) {
    return (
      <ExerciseSession
        items={session}
        title="Ojo con esta palabra"
        onExit={() => setSession(null)}
        onFinish={() => setSession(null)}
        finishLabel="Volver a la lista"
      />
    );
  }

  const start = () => {
    const pool = falseFriends.map((f) => ({ ...f, id: `ff:${f.id}` }));
    const picked = pickForPractice(pool, getStore().get().items, 10).map((p) => falseFriends.find((f) => `ff:${f.id}` === p.id)!);
    setSession(falseFriendExercises(picked, falseFriends));
    window.scrollTo({ top: 0 });
  };

  return (
    <div>
      <PageHeader
        title="Ojo con esta palabra"
        subtitle="Parecen españolas, pero en Portugal significan otra cosa. Son la fuente de errores más típica (y más divertida) del hispanohablante."
        back="/vocabulario/"
      />
      <Button className="w-full" onClick={start}>
        Ponte a prueba (10 palabras)
      </Button>
      <ul className="mt-5 space-y-3">
        {falseFriends.map((f) => (
          <li key={f.id} className="rounded-2xl bg-surface shadow-card p-4">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xl font-bold" lang="pt-PT">
                  {f.pt}
                </p>
                <p className="mt-0.5 text-[15px]">
                  <span className="font-semibold text-ok">= {f.meaning}</span>
                </p>
                <p className="text-[15px] text-ink-2">
                  <span className="line-through decoration-1">≠ {f.looksLike}</span> → en portugués: <span lang="pt-PT">{f.esFalseMeaningInPt}</span>
                </p>
              </div>
              {masteryBadge(progress.items[`ff:${f.id}`])}
              <AudioButton text={f.pt} size="sm" />
            </div>
            <div className="mt-3 rounded-xl bg-surface-2 p-3 text-[15px]">
              <div className="flex items-start gap-2">
                <p className="flex-1 font-medium" lang="pt-PT">
                  {f.exPt}
                </p>
                <AudioButton text={f.exPt} size="sm" />
              </div>
              <p className="text-ink-2">{f.exEs}</p>
            </div>
            {f.note && <p className="mt-2 text-sm text-ink-2">{f.note}</p>}
          </li>
        ))}
      </ul>
      <ReviewNote />
    </div>
  );
}
