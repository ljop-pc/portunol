"use client";
import { useState } from "react";
import type { VocabEntry } from "@/lib/content/schema";
import { AudioButton } from "@/components/audio/AudioButton";
import { Badge } from "@/components/ui/primitives";
import { RegisterTag } from "./RegisterTag";
import type { ItemMastery } from "@/lib/srs/scheduler";

const POS_SHORT: Record<string, string> = {
  sustantivo: "sust.",
  verbo: "verbo",
  adjetivo: "adj.",
  adverbio: "adv.",
  expresión: "expr.",
  interjección: "interj.",
  preposición: "prep.",
};

export function masteryBadge(m: ItemMastery | undefined) {
  if (!m) return null;
  if (m.streak === 0) return <Badge tone="warn">repasar</Badge>;
  if (m.streak >= 2) return <Badge tone="ok">aprendida</Badge>;
  return <Badge tone="brand">vista</Badge>;
}

export function VocabCard({ entry, mastery, showTopic }: { entry: VocabEntry; mastery?: ItemMastery; showTopic?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="rounded-2xl bg-surface shadow-card">
      <div className="flex items-center gap-2 p-3">
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="min-w-0 flex-1 text-left">
          <p className="text-[17px] font-semibold" lang="pt-PT">
            {entry.pt}
            {entry.register && <RegisterTag register={entry.register} />}
          </p>
          <p className="text-[15px] text-ink-2">
            {entry.es} <span className="text-xs">· {POS_SHORT[entry.pos]}{entry.gender ? ` ${entry.gender}.` : ""}</span>
            {showTopic && <span className="text-xs"> · {showTopic}</span>}
          </p>
        </button>
        {masteryBadge(mastery)}
        <AudioButton text={entry.pt.replace(/\s*\/\s*/g, ", ")} size="sm" />
      </div>
      {open && (
        <div className="border-t border-line px-3 pb-3 pt-2 text-[15px]">
          <div className="flex items-start gap-2">
            <p className="flex-1 font-medium" lang="pt-PT">
              {entry.exPt}
            </p>
            <AudioButton text={entry.exPt} size="sm" />
          </div>
          <p className="text-ink-2">{entry.exEs}</p>
          {entry.note && <p className="mt-2 text-sm">{entry.note}</p>}
          {entry.ptBr && (
            <p className="mt-1 text-sm text-ink-2">
              En Brasil: <span lang="pt-BR">{entry.ptBr}</span>
            </p>
          )}
        </div>
      )}
    </li>
  );
}
