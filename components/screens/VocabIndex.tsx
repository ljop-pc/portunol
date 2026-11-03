"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { falseFriends, vocabTopicById, vocabTopics, vocabulary } from "@/lib/content";
import { stripAccents } from "@/lib/correction";
import { useHydrated, useProgress } from "@/lib/progress/react";
import { LinkCard, PageHeader, SectionTitle } from "@/components/ui/primitives";
import { VocabCard } from "@/components/content/VocabCard";

const fold = (s: string) => stripAccents(s.toLowerCase());

export function VocabIndex() {
  const progress = useProgress();
  const hydrated = useHydrated();
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const f = fold(q.trim());
    if (f.length < 2) return [];
    return vocabulary.filter((v) => fold(v.pt).includes(f) || fold(v.es).includes(f)).slice(0, 40);
  }, [q]);
  const learned = (ids: string[]) => (hydrated ? ids.filter((id) => (progress.items[id]?.streak ?? 0) >= 1).length : 0);

  return (
    <div>
      <PageHeader title="Vocabulario" subtitle={`${vocabulary.length} palabras y expresiones de Portugal, con ejemplos.`} />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar en portugués o en español…"
        aria-label="Buscar vocabulario"
        autoCorrect="off"
        autoCapitalize="none"
        className="w-full rounded-xl bg-surface-2 px-4 py-3 outline-none placeholder:text-ink-2 focus:ring-4 focus:ring-brand/20"
      />
      {q.trim().length >= 2 && (
        <div className="mt-3">
          {results.length === 0 ? (
            <p className="rounded-2xl bg-surface-2 p-4 text-ink-2">No hay resultados para «{q}».</p>
          ) : (
            <ul className="space-y-2">
              {results.map((v) => (
                <VocabCard key={v.id} entry={v} mastery={progress.items[v.id]} showTopic={vocabTopicById.get(v.topic)?.title} />
              ))}
            </ul>
          )}
        </div>
      )}

      <Link href="/vocabulario/ojo/" className="mt-6 block rounded-3xl bg-hero p-6 text-hero-ink shadow-card transition active:scale-[0.99]">
        <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-warn">Falsos amigos</p>
        <p className="mt-1 text-[26px] font-bold leading-tight tracking-[-0.03em]">Ojo con esta palabra.</p>
        <p className="mt-2 text-[15px] text-hero-ink/65">
          {falseFriends.length} falsos amigos: palabras que parecen españolas pero significan otra cosa (esquisito, polvo, apelido…).
        </p>
      </Link>

      <SectionTitle>Temas</SectionTitle>
      <ul className="space-y-2">
        {vocabTopics.map((t) => (
          <li key={t.topic}>
            <LinkCard
              href={`/vocabulario/${t.topic}/`}
              title={t.title}
              subtitle={`${t.entries.length} palabras${hydrated ? ` · ${learned(t.entries.map((e) => e.id))} practicadas` : ""}`}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
