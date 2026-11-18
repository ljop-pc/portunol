/**
 * Niveles de dominio (Fase 2): nuevo → aprendiendo → consolidado → dominado.
 * Se calculan a partir del historial de repetición espaciada de cada elemento.
 */
import type { ItemMastery } from "@/lib/srs/scheduler";

export type Level = "nuevo" | "aprendiendo" | "consolidado" | "dominado";
export const LEVELS: Level[] = ["nuevo", "aprendiendo", "consolidado", "dominado"];

export const LEVEL_LABEL: Record<Level, string> = {
  nuevo: "Nuevo",
  aprendiendo: "Aprendiendo",
  consolidado: "Consolidado",
  dominado: "Dominado",
};

export function itemLevel(m: ItemMastery | undefined): Level {
  if (!m || m.seen === 0) return "nuevo";
  if (m.streak >= 4 || (m.streak >= 2 && m.intervalDays >= 21)) return "dominado";
  if (m.streak >= 2) return "consolidado";
  return "aprendiendo";
}

export type LevelCounts = Record<Level, number>;

export function levelCounts(ids: string[], items: Record<string, ItemMastery>): LevelCounts {
  const c: LevelCounts = { nuevo: 0, aprendiendo: 0, consolidado: 0, dominado: 0 };
  for (const id of ids) c[itemLevel(items[id])] += 1;
  return c;
}

/** Nivel global de un conjunto: el que alcanzan al menos la mitad de los elementos ya vistos. */
export function overallLevel(c: LevelCounts): Level {
  const seen = c.aprendiendo + c.consolidado + c.dominado;
  if (seen === 0) return "nuevo";
  if (c.dominado >= seen / 2) return "dominado";
  if (c.consolidado + c.dominado >= seen / 2) return "consolidado";
  return "aprendiendo";
}
