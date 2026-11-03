/**
 * Generación de ejercicios a partir del vocabulario y de los falsos amigos.
 * Prioriza las palabras que el alumno ha fallado o tiene pendientes de repaso.
 */
import type { SessionItem } from "@/components/exercises/types";
import type { FalseFriend, VocabEntry } from "./schema";
import type { ItemMastery } from "@/lib/srs/scheduler";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Puntuación de prioridad: fallada > pendiente > nueva > dominada. */
export function priority(m: ItemMastery | undefined, now = Date.now()): number {
  if (!m) return 2;
  if (m.streak === 0) return 4;
  if (new Date(m.dueAt).getTime() <= now) return 3;
  return 1 - Math.min(0.9, m.streak / 10);
}

export function pickForPractice<T extends { id: string }>(pool: T[], items: Record<string, ItemMastery>, n: number): T[] {
  return shuffle(pool)
    .map((e) => ({ e, p: priority(items[e.id]) + Math.random() * 0.5 }))
    .sort((a, b) => b.p - a.p)
    .slice(0, n)
    .map((x) => x.e);
}

const stripArticle = (s: string) => s.replace(/^(o|a|os|as) /i, "");

function distractors(entry: VocabEntry, pool: VocabEntry[], key: "es" | "pt", n = 3): string[] {
  const seen = new Set([entry[key].toLowerCase()]);
  const out: string[] = [];
  for (const c of shuffle(pool.filter((p) => p.id !== entry.id && p.pos === entry.pos).concat(shuffle(pool)))) {
    const v = c[key];
    if (seen.has(v.toLowerCase())) continue;
    seen.add(v.toLowerCase());
    out.push(v);
    if (out.length === n) break;
  }
  return out;
}

export function vocabExercises(entries: VocabEntry[], pool: VocabEntry[]): SessionItem[] {
  return entries.map((v, i): SessionItem => {
    const base = {
      skill: "vocabulario" as const,
      topic: `vocab:${v.topic}`,
      itemId: v.id,
      expectedErrors: [],
      review: v.review,
      explanation: `${v.pt} = ${v.es}. Ejemplo: «${v.exPt}» (${v.exEs})${v.note ? ` · ${v.note}` : ""}${v.ptBr ? ` · En Brasil: ${v.ptBr}.` : ""}`,
    };
    const typable = !/[\/…()]/.test(v.pt) && v.difficulty === 1 && v.pos !== "expresión";
    const mode = typable && i % 3 === 2 ? "type" : i % 2 === 0 ? "pt2es" : "es2pt";
    if (mode === "type") {
      const bare = stripArticle(v.pt);
      return {
        ...base,
        id: `${v.id}#type`,
        type: "translate",
        instruction: "Escribe en portugués de Portugal.",
        es: v.es,
        accepted: [v.pt, bare].filter((x, j, a) => a.indexOf(x) === j),
      };
    }
    if (mode === "pt2es") {
      const options = [v.es, ...distractors(v, pool, "es")];
      return { ...base, id: `${v.id}#pt2es`, type: "choice", instruction: "¿Qué significa?", prompt: v.pt, promptLang: "pt", options, answer: 0 };
    }
    const options = [v.pt, ...distractors(v, pool, "pt")];
    return { ...base, id: `${v.id}#es2pt`, type: "choice", instruction: "¿Cómo se dice en portugués?", prompt: v.es, promptLang: "es", options, answer: 0 };
  });
}

export function falseFriendExercises(list: FalseFriend[], all: FalseFriend[]): SessionItem[] {
  return list.map((f): SessionItem => {
    const others = shuffle(all.filter((o) => o.id !== f.id)).slice(0, 1).map((o) => o.meaning);
    const options = [f.meaning, `«${f.looksLike}» (como en español)`, ...others];
    return {
      id: `ff:${f.id}`,
      itemId: `ff:${f.id}`,
      type: "choice",
      skill: "vocabulario",
      topic: "vocab:ojo",
      instruction: "¡Ojo! ¿Qué significa en portugués de Portugal?",
      prompt: f.pt,
      promptLang: "pt",
      options,
      answer: 0,
      expectedErrors: [],
      review: f.review,
      explanation: `«${f.pt}» significa ${f.meaning}. Para decir lo que en español entendemos por «${f.looksLike}»: ${f.esFalseMeaningInPt}. Ejemplo: «${f.exPt}» (${f.exEs})`,
    };
  });
}
