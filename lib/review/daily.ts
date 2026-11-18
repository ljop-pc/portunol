/**
 * «Repaso de hoy» (Fase 2).
 *
 * planDailyReview() decide QUÉ repasar (determinista, sin azar, para poder
 * mostrar el resumen en la portada y probarlo). materializeReview() lo
 * convierte en ejercicios concretos (con opciones barajadas, formato adaptado…).
 *
 * Prioridades:
 *   1. Refuerzo: ejercicios nuevos de los temas con un patrón de error activo.
 *   2. Fallos recientes: lo último que se falló (racha 0).
 *   3. Pendientes: lo que la repetición espaciada marca para hoy.
 *   4. Nuevos: unas pocas palabras aún no vistas, para seguir avanzando.
 */
import {
  exerciseById,
  exercises,
  falseFriends,
  grammarById,
  vocabTopics,
  vocabulary,
} from "@/lib/content";
import type { Exercise, VocabEntry } from "@/lib/content/schema";
import { falseFriendExercise, isTypable, vocabExercise, type VocabMode } from "@/lib/content/practice";
import { recordAttempt, type AttemptInput, type PatternRecord, type ProgressState } from "@/lib/progress/store";
import type { ItemMastery } from "@/lib/srs/scheduler";
import type { SessionItem } from "@/components/exercises/types";
import { activePatterns, updatePatternForTopic } from "./patterns";

export const MAX_ITEMS = 12;
const MAX_FAILED = 6;
const MAX_REINFORCE_PER_PATTERN = 3;
const MAX_REINFORCE = 5;
const MAX_NEW = 3;

export type Reason = "refuerzo" | "fallo" | "pendiente" | "nuevo";

export const REASON_LABEL: Record<Reason, string> = {
  refuerzo: "Refuerzo de un punto débil",
  fallo: "Lo fallaste hace poco",
  pendiente: "Toca repasarlo hoy",
  nuevo: "Palabra nueva",
};

export interface PlannedItem {
  /** Id del elemento: ejercicio, palabra (tema:palabra) o falso amigo (ff:…). */
  id: string;
  reason: Reason;
}

export interface ReviewPlan {
  items: PlannedItem[];
  counts: Record<Reason, number>;
  patterns: PatternRecord[];
  minutes: number;
  /** El alumno todavía no ha practicado nada: no hay nada que repasar. */
  empty: boolean;
}

const vocabById = new Map(vocabulary.map((v) => [v.id, v]));
const ffById = new Map(falseFriends.map((f) => [`ff:${f.id}`, f]));

/** Temas a los que se puede asociar un patrón: los de gramática. */
export const isPatternTopic = (topic: string) => grammarById.has(topic);

/** Un elemento se puede repasar si sabemos generar un ejercicio para él. */
function reviewable(id: string): boolean {
  const e = exerciseById.get(id);
  if (e) return e.type !== "free";
  return vocabById.has(id) || ffById.has(id);
}

const t = (iso: string) => new Date(iso).getTime();

export function localDate(d = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function planDailyReview(state: ProgressState, now = new Date()): ReviewPlan {
  const items = state.items;
  const chosen = new Map<string, Reason>();
  const add = (id: string, reason: Reason) => {
    if (!chosen.has(id) && chosen.size < MAX_ITEMS) chosen.set(id, reason);
  };

  // 1. Refuerzo de patrones activos: ejercicios del tema que no se fallaron ahora mismo,
  //    empezando por los nunca vistos (ejemplos nuevos) y luego los vistos hace más tiempo.
  const patterns = activePatterns(state);
  let reinforce = 0;
  for (const p of patterns) {
    const pool = exercises
      .filter((e) => e.topic === p.topic && e.type !== "free" && (items[e.id]?.streak ?? 1) > 0)
      .sort((a, b) => lastSeen(items[a.id]) - lastSeen(items[b.id]));
    for (const e of pool.slice(0, MAX_REINFORCE_PER_PATTERN)) {
      if (reinforce >= MAX_REINFORCE) break;
      add(e.id, "refuerzo");
      reinforce += 1;
    }
  }

  // 2. Fallos recientes (los más recientes primero).
  const failed = Object.entries(items)
    .filter(([id, m]) => m.seen > 0 && m.streak === 0 && reviewable(id))
    .sort((a, b) => t(b[1].lastAt) - t(a[1].lastAt))
    .slice(0, MAX_FAILED);
  for (const [id] of failed) add(id, "fallo");

  // 3. Pendientes según la repetición espaciada (los más atrasados primero).
  const due = Object.entries(items)
    .filter(([id, m]) => m.streak > 0 && t(m.dueAt) <= now.getTime() && reviewable(id))
    .sort((a, b) => t(a[1].dueAt) - t(b[1].dueAt));
  for (const [id] of due) add(id, "pendiente");

  // 4. Palabras nuevas de los temas que ya se han empezado (o de los primeros temas).
  const practicedTopics = new Set(Object.keys(items).filter((id) => vocabById.has(id)).map((id) => vocabById.get(id)!.topic));
  const topicOrder = vocabTopics.map((vt) => vt.topic).sort((a, b) => Number(practicedTopics.has(b)) - Number(practicedTopics.has(a)));
  let added = 0;
  const hasPractice = state.attempts.length > 0;
  if (hasPractice) {
    for (const topic of topicOrder) {
      for (const v of vocabTopics.find((vt) => vt.topic === topic)!.entries) {
        if (added >= MAX_NEW || chosen.size >= MAX_ITEMS) break;
        if (!items[v.id] && v.difficulty === 1) {
          add(v.id, "nuevo");
          added += 1;
        }
      }
    }
  }

  const list = [...chosen.entries()].map(([id, reason]) => ({ id, reason }));
  const counts: Record<Reason, number> = { refuerzo: 0, fallo: 0, pendiente: 0, nuevo: 0 };
  for (const i of list) counts[i.reason] += 1;
  return {
    items: list,
    counts,
    patterns,
    minutes: Math.max(1, Math.round(list.length * 0.5)),
    empty: !hasPractice,
  };
}

function lastSeen(m: ItemMastery | undefined): number {
  return m ? t(m.lastAt) : 0;
}

/**
 * Formato adaptado para una palabra:
 * - nueva → reconocerla (portugués → español);
 * - fallada una vez → elegirla en portugués; fallada varias → escribirla;
 * - bien asentada → escribirla (lo más exigente).
 */
export function adaptiveVocabMode(m: ItemMastery | undefined, v: VocabEntry): VocabMode {
  if (!m || m.seen === 0) return "pt2es";
  const misses = m.seen - m.correct;
  if (m.streak === 0) return misses >= 2 && isTypable(v) ? "type" : "es2pt";
  if (m.streak >= 2 && isTypable(v)) return "type";
  return "es2pt";
}

export type ReviewItem = SessionItem & { reason: Reason };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function materializeReview(plan: ReviewPlan, state: ProgressState): ReviewItem[] {
  const toItem = ({ id, reason }: PlannedItem): ReviewItem | null => {
    const e: Exercise | undefined = exerciseById.get(id);
    if (e) return { ...e, reason };
    const v = vocabById.get(id);
    if (v) return { ...vocabExercise(v, vocabulary, adaptiveVocabMode(state.items[id], v)), reason };
    const f = ffById.get(id);
    if (f) return { ...falseFriendExercise(f, falseFriends), reason };
    return null;
  };
  const all = plan.items.map(toItem).filter((x): x is ReviewItem => x !== null);
  // Primero el refuerzo (va justo después de la micro-explicación), luego el resto mezclado.
  const reinforce = all.filter((i) => i.reason === "refuerzo");
  const middle = shuffle(all.filter((i) => i.reason === "fallo" || i.reason === "pendiente"));
  const fresh = all.filter((i) => i.reason === "nuevo");
  return [...reinforce, ...middle, ...fresh];
}

/** Registra una respuesta y actualiza el patrón de error de su tema. */
export function registerAnswer(state: ProgressState, input: AttemptInput, now = new Date()): ProgressState {
  return updatePatternForTopic(recordAttempt(state, input, now), input.topic, isPatternTopic, now);
}

export function markReviewDone(state: ProgressState, now = new Date()): ProgressState {
  return { ...state, review: { lastDate: localDate(now), sessions: state.review.sessions + 1 } };
}

/** Ids de los elementos de un tema de gramática (para calcular su dominio). */
export function grammarItemIds(topicId: string): string[] {
  return exercises.filter((e) => e.topic === topicId && e.type !== "free").map((e) => e.id);
}
