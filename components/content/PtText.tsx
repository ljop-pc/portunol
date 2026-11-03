"use client";
import { useState } from "react";
import { AudioButton } from "@/components/audio/AudioButton";
import { useProgress } from "@/lib/progress/react";
import type { Example } from "@/lib/content/schema";
import { RegisterTag } from "./RegisterTag";

/** Frase en portugués con audio y traducción (visible o al tocar, según ajustes). */
export function PtText({ example, big = false }: { example: Example; big?: boolean }) {
  const { settings } = useProgress();
  const [revealed, setRevealed] = useState(false);
  const show = settings.showTranslations === "siempre" || revealed;
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p lang="pt-PT" className={`${big ? "text-xl" : "text-[17px]"} font-medium leading-snug`}>
          {example.pt} {example.register && <RegisterTag register={example.register} />}
        </p>
        <button
          type="button"
          onClick={() => setRevealed((v) => !v)}
          className={`mt-0.5 text-left text-[15px] ${show ? "text-ink-2" : "text-brand"}`}
          aria-expanded={show}
        >
          {show ? example.es : "Ver traducción"}
        </button>
        {example.note && show && <p className="mt-1 text-sm text-ink-2">{example.note}</p>}
      </div>
      <AudioButton text={example.pt} />
    </div>
  );
}
