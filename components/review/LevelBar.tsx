import { LEVEL_LABEL, LEVELS, type Level, type LevelCounts } from "@/lib/review/mastery";

const COLOR: Record<Level, string> = {
  nuevo: "bg-surface-2",
  aprendiendo: "bg-warn",
  consolidado: "bg-brand",
  dominado: "bg-ok",
};

/** Barra apilada con el reparto de niveles de dominio. */
export function LevelBar({ counts, label }: { counts: LevelCounts; label: string }) {
  const total = LEVELS.reduce((n, l) => n + counts[l], 0) || 1;
  const text = LEVELS.filter((l) => counts[l] > 0)
    .map((l) => `${counts[l]} ${LEVEL_LABEL[l].toLowerCase()}`)
    .join(", ");
  return (
    <div role="img" aria-label={`${label}: ${text}`} className="flex h-2 w-full overflow-hidden rounded-full bg-surface-2">
      {LEVELS.filter((l) => l !== "nuevo").map((l) =>
        counts[l] > 0 ? <div key={l} className={COLOR[l]} style={{ width: `${(counts[l] / total) * 100}%` }} /> : null,
      )}
    </div>
  );
}

export function LevelLegend() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-ink-2">
      {LEVELS.map((l) => (
        <li key={l} className="inline-flex items-center gap-1.5">
          <span className={`inline-block h-2 w-2 rounded-full ${COLOR[l]} ${l === "nuevo" ? "ring-1 ring-line" : ""}`} />
          {LEVEL_LABEL[l]}
        </li>
      ))}
    </ul>
  );
}
