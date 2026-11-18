/**
 * Detección de patrones de error (Fase 2).
 *
 * Un patrón es un tema de gramática en el que el alumno falla de forma
 * repetida. Ciclo de vida:
 *   1. Detectar: ≥ PATTERN_MIN_FAILURES fallos en el tema en los últimos
 *      PATTERN_WINDOW_DAYS días → estado «activo».
 *   2. Mientras está activo, el repaso diario muestra una micro-explicación
 *      y ejercicios nuevos del tema.
 *   3. Comprobar más adelante: RESOLVE_STREAK aciertos seguidos en el tema
 *      después de detectarlo, y al menos uno pasadas RESOLVE_DELAY_HOURS
 *      (es decir, en otra sesión, no justo a continuación) → «superado».
 *   4. Si vuelve a fallar después de superarlo, puede detectarse de nuevo.
 *
 * Lógica pura: no depende de la interfaz ni del almacenamiento.
 */
import type { ErrorCategory } from "@/lib/content/schema";
import type { Attempt, PatternRecord, ProgressState } from "@/lib/progress/store";

export const PATTERN_MIN_FAILURES = 3;
export const PATTERN_WINDOW_DAYS = 21;
export const RESOLVE_STREAK = 3;
export const RESOLVE_DELAY_HOURS = 20;

const HOUR = 60 * 60 * 1000;
const t = (iso: string) => new Date(iso).getTime();

function mostFrequent(categories: ErrorCategory[]): ErrorCategory {
  const counts = new Map<ErrorCategory, number>();
  for (const c of categories) counts.set(c, (counts.get(c) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

/**
 * Recalcula el patrón de UN tema (el del último intento).
 * `isPatternTopic` decide qué temas pueden tener patrón (los de gramática).
 */
export function updatePatternForTopic(
  state: ProgressState,
  topic: string,
  isPatternTopic: (topic: string) => boolean,
  now = new Date(),
): ProgressState {
  if (!isPatternTopic(topic)) return state;
  const attempts = state.attempts.filter((a) => a.topic === topic);
  const existing = state.patterns[topic];
  let next: PatternRecord | undefined = existing;

  if (!existing || existing.status === "superado") {
    const windowStart = now.getTime() - PATTERN_WINDOW_DAYS * 24 * HOUR;
    const since = Math.max(windowStart, existing?.resolvedAt ? t(existing.resolvedAt) : 0);
    const fails = attempts.filter((a): a is Attempt & { category: ErrorCategory } => !a.correct && !!a.category && t(a.at) > since);
    if (fails.length >= PATTERN_MIN_FAILURES) {
      next = {
        topic,
        category: mostFrequent(fails.map((f) => f.category)),
        detectedAt: now.toISOString(),
        status: "activo",
        failures: fails.length,
      };
    }
  } else {
    const after = attempts.filter((a) => t(a.at) >= t(existing.detectedAt));
    const last = after.slice(-RESOLVE_STREAK);
    const resolved =
      last.length === RESOLVE_STREAK &&
      last.every((a) => a.correct) &&
      last.some((a) => t(a.at) - t(existing.detectedAt) >= RESOLVE_DELAY_HOURS * HOUR);
    const latest = attempts[attempts.length - 1];
    next = resolved
      ? { ...existing, status: "superado", resolvedAt: now.toISOString() }
      : { ...existing, failures: existing.failures + (latest && !latest.correct && t(latest.at) >= t(existing.detectedAt) ? 1 : 0) };
  }

  if (next === existing) return state;
  return { ...state, patterns: { ...state.patterns, [topic]: next! } };
}

export function activePatterns(state: ProgressState): PatternRecord[] {
  return Object.values(state.patterns)
    .filter((p) => p.status === "activo")
    .sort((a, b) => b.failures - a.failures);
}

export function markTipSeen(state: ProgressState, topic: string, now = new Date()): ProgressState {
  const p = state.patterns[topic];
  if (!p) return state;
  return { ...state, patterns: { ...state.patterns, [topic]: { ...p, tipSeenAt: now.toISOString() } } };
}
