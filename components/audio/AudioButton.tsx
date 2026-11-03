"use client";
import { useState } from "react";
import { play, sourceFor, useAudioStatus, type AudioRef } from "@/lib/audio/service";
import { useProgress } from "@/lib/progress/react";
import { IconSpeaker, IconSpeakerOff } from "@/components/ui/icons";

/**
 * Botón de audio honesto: indica el origen (nativo / sintético PT-PT) o que
 * no hay audio. Nunca reproduce una voz de otra variante como sustituto.
 */
export function AudioButton({ text, file, slow = false, size = "md" }: AudioRef & { slow?: boolean; size?: "sm" | "md" }) {
  const status = useAudioStatus();
  const { settings } = useProgress();
  const [playing, setPlaying] = useState<"normal" | "slow" | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const source = sourceFor({ text, file }, status);
  const dim = size === "sm" ? "h-9 w-9" : "h-11 w-11";

  if (!status.ready) {
    return <span className={`${dim} inline-block shrink-0`} aria-hidden />;
  }

  if (source === "none") {
    return (
      <span className="relative inline-flex shrink-0">
        <button
          type="button"
          onClick={() => setShowInfo((v) => !v)}
          aria-label="Sin audio disponible"
          className={`${dim} inline-flex items-center justify-center rounded-full text-ink-2/60`}
        >
          <IconSpeakerOff width={18} height={18} />
        </button>
        {showInfo && (
          <span role="status" className="absolute right-0 top-full z-30 mt-1 w-56 rounded-xl bg-surface shadow-card p-3 text-xs text-ink-2 shadow-lg">
            Sin audio: este dispositivo no tiene una voz de portugués de Portugal. No usamos voces de Brasil como sustituto. Más información en «Progreso → Audio».
          </span>
        )}
      </span>
    );
  }

  const doPlay = (mode: "normal" | "slow") => {
    setPlaying(mode);
    play({ text, file }, { rate: mode === "slow" ? 0.6 : settings.audioRate, onEnd: () => setPlaying(null) });
  };
  const label = source === "native" ? "Escuchar (grabación nativa)" : "Escuchar (voz sintética PT-PT)";

  return (
    <span className="inline-flex shrink-0 items-center">
      <button
        type="button"
        onClick={() => doPlay("normal")}
        aria-label={label}
        title={label}
        className={`${dim} inline-flex items-center justify-center rounded-full ${
          playing === "normal" ? "bg-brand text-brand-ink" : "bg-brand-soft text-brand"
        }`}
      >
        <IconSpeaker width={18} height={18} />
      </button>
      {slow && (
        <button
          type="button"
          onClick={() => doPlay("slow")}
          aria-label="Escuchar despacio"
          className={`ml-1 h-9 rounded-full px-2.5 text-xs font-semibold ${
            playing === "slow" ? "bg-brand text-brand-ink" : "bg-surface-2 text-ink-2"
          }`}
        >
          lento
        </button>
      )}
    </span>
  );
}

export function AudioSourceNote() {
  const status = useAudioStatus();
  if (!status.ready) return null;
  if (status.syntheticAvailable)
    return <p className="text-xs text-ink-2">Audio: voz sintética PT-PT ({status.voiceName}). No es una grabación nativa.</p>;
  return <p className="text-xs text-ink-2">Audio no disponible en este dispositivo (no hay voz PT-PT instalada).</p>;
}
