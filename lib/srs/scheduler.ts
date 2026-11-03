/**
 * Repetición espaciada (versión sencilla, inspirada en SM-2).
 *
 * Separada de la interfaz a propósito: en la Fase 2 se usará para construir
 * la sesión "Repaso de hoy" y se podrá sustituir por un algoritmo mejor sin
 * tocar los componentes.
 */
export interface ItemMastery {
  seen: number;
  correct: number;
  /** Aciertos seguidos. */
  streak: number;
  /** Factor de facilidad (1.3 – 2.8). */
  ease: number;
  intervalDays: number;
  lastAt: string;
  dueAt: string;
}

const DAY = 24 * 60 * 60 * 1000;

export function newMastery(now: Date): ItemMastery {
  return { seen: 0, correct: 0, streak: 0, ease: 2.3, intervalDays: 0, lastAt: now.toISOString(), dueAt: now.toISOString() };
}

export function updateMastery(prev: ItemMastery | undefined, isCorrect: boolean, now: Date = new Date()): ItemMastery {
  const m = prev ? { ...prev } : newMastery(now);
  m.seen += 1;
  m.lastAt = now.toISOString();
  if (isCorrect) {
    m.correct += 1;
    m.streak += 1;
    m.ease = Math.min(2.8, m.ease + 0.1);
    m.intervalDays = m.streak === 1 ? 1 : m.streak === 2 ? 3 : Math.round(m.intervalDays * m.ease);
  } else {
    m.streak = 0;
    m.ease = Math.max(1.3, m.ease - 0.2);
    // Se repasa pronto: en la misma sesión siguiente (≈ 10 minutos).
    m.intervalDays = 0;
  }
  const delay = m.intervalDays === 0 ? 10 * 60 * 1000 : m.intervalDays * DAY;
  m.dueAt = new Date(now.getTime() + delay).toISOString();
  return m;
}

/** Nivel de dominio estimado, de 0 a 1. */
export function masteryLevel(m: ItemMastery | undefined): number {
  if (!m || m.seen === 0) return 0;
  const accuracy = m.correct / m.seen;
  const stability = Math.min(1, m.streak / 4);
  return Math.round((accuracy * 0.5 + stability * 0.5) * 100) / 100;
}

export function isDue(m: ItemMastery | undefined, now: Date = new Date()): boolean {
  return !!m && new Date(m.dueAt).getTime() <= now.getTime();
}
