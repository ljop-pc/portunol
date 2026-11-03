"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { conversationById, getExercises, grammarById } from "@/lib/content";
import { markConversation } from "@/lib/progress/store";
import { updateProgress, useProgress } from "@/lib/progress/react";
import { play, stop, useAudioStatus } from "@/lib/audio/service";
import { Button, PageHeader, ReviewNote, SectionTitle } from "@/components/ui/primitives";
import { AudioButton, AudioSourceNote } from "@/components/audio/AudioButton";
import { PtText } from "@/components/content/PtText";
import { ExerciseSession } from "@/components/exercises/ExerciseSession";

type Mode = "dialogo" | "guiada" | "reto";

export function ConversationView({ conversationId }: { conversationId: string }) {
  const c = conversationById.get(conversationId)!;
  const progress = useProgress();
  const audio = useAudioStatus();
  const [mode, setMode] = useState<Mode | "practicing-guiada" | "practicing-reto">("dialogo");
  const [showEs, setShowEs] = useState(false);
  const [playingAll, setPlayingAll] = useState<number | null>(null);
  const cancelled = useRef(false);
  const you = c.characters[c.characters.length - 1].name;
  const p = progress.conversations[c.id];

  if (mode === "practicing-guiada" || mode === "practicing-reto") {
    const guided = mode === "practicing-guiada";
    return (
      <ExerciseSession
        items={getExercises(guided ? c.guidedIds : c.challengeIds)}
        title={`${guided ? "Práctica guiada" : "Reto"}: ${c.title}`}
        hideTranslations={!guided}
        onExit={() => setMode(guided ? "guiada" : "reto")}
        finishLabel="Volver a la conversación"
        onFinish={() => {
          updateProgress((s) => markConversation(s, c.id, guided ? "guided" : "challenge"));
          setMode(guided ? "reto" : "dialogo");
        }}
      />
    );
  }

  const playAll = () => {
    cancelled.current = false;
    const step = (i: number) => {
      if (cancelled.current || i >= c.turns.length) {
        setPlayingAll(null);
        return;
      }
      setPlayingAll(i);
      play({ text: c.turns[i].pt }, { rate: progress.settings.audioRate, onEnd: () => setTimeout(() => step(i + 1), 450) });
    };
    step(0);
  };
  const stopAll = () => {
    cancelled.current = true;
    stop();
    setPlayingAll(null);
  };

  return (
    <div>
      <PageHeader title={c.title} back="/conversacion/" />
      <div className="rounded-2xl bg-surface-2 p-4">
        <p className="text-[15px]">{c.context}</p>
        <p className="mt-2 text-sm font-semibold text-brand">Objetivo: {c.goal}</p>
      </div>

      <div role="tablist" aria-label="Modo" className="mt-5 grid grid-cols-3 gap-1 rounded-2xl bg-surface-2 p-1">
        {(
          [
            ["dialogo", "Diálogo"],
            ["guiada", `Práctica${p?.guidedDone ? " ✓" : ""}`],
            ["reto", `Reto${p?.challengeDone ? " ✓" : ""}`],
          ] as const
        ).map(([m, label]) => (
          <button
            key={m}
            role="tab"
            type="button"
            aria-selected={mode === m}
            onClick={() => {
              stopAll();
              setMode(m);
            }}
            className={`min-h-[44px] rounded-xl text-sm font-semibold ${mode === m ? "bg-surface text-ink shadow-sm" : "text-ink-2"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "dialogo" && (
        <div className="mt-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {audio.syntheticAvailable &&
              (playingAll === null ? (
                <Button variant="secondary" className="min-h-[40px] px-4 text-sm" onClick={playAll}>
                  ▶ Escuchar todo
                </Button>
              ) : (
                <Button variant="secondary" className="min-h-[40px] px-4 text-sm" onClick={stopAll}>
                  ■ Parar
                </Button>
              ))}
            <Button variant="ghost" className="min-h-[40px] px-3 text-sm" onClick={() => setShowEs((v) => !v)}>
              {showEs ? "Ocultar traducción" : "Mostrar traducción"}
            </Button>
          </div>
          <ol className="space-y-3">
            {c.turns.map((t, i) => {
              const mine = t.speaker === you;
              return (
                <li key={i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[88%] rounded-2xl p-3 ${mine ? "rounded-tr-md bg-brand-soft" : "rounded-tl-md bg-surface border border-line"} ${
                      playingAll === i ? "ring-2 ring-brand" : ""
                    }`}
                  >
                    <p className="text-xs font-semibold text-ink-2">{t.speaker}</p>
                    <div className="flex items-start gap-2">
                      <p lang="pt-PT" className="flex-1 text-[17px] font-medium leading-snug">
                        {t.pt}
                      </p>
                      <AudioButton text={t.pt} size="sm" slow />
                    </div>
                    {showEs && <p className="mt-1 text-[15px] text-ink-2">{t.es}</p>}
                    {(t.alternatives.length > 0 || t.note) && (
                      <details className="mt-1 text-sm">
                        <summary className="cursor-pointer text-brand">{t.alternatives.length > 0 ? "También se dice…" : "Nota"}</summary>
                        {t.alternatives.length > 0 && (
                          <ul className="mt-1 list-disc pl-5" lang="pt-PT">
                            {t.alternatives.map((a) => (
                              <li key={a}>{a}</li>
                            ))}
                          </ul>
                        )}
                        {t.note && <p className="mt-1 text-ink-2">💡 {t.note}</p>}
                      </details>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="mt-3">
            <AudioSourceNote />
          </div>

          <SectionTitle>Expresiones clave</SectionTitle>
          <div className="divide-y divide-line rounded-2xl border border-line bg-surface px-4">
            {c.expressions.map((e) => (
              <PtText key={e.pt} example={e} />
            ))}
          </div>

          {c.grammarNotes.length > 0 && (
            <>
              <SectionTitle>Gramática que aparece</SectionTitle>
              <div className="rounded-2xl border border-line bg-surface p-4">
                <ul className="list-disc space-y-1 pl-5 text-[15px]">
                  {c.grammarNotes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap gap-2">
                  {c.grammarIds.map((g) => (
                    <Link key={g} href={`/gramatica/${g}/`} className="rounded-full bg-brand-soft px-3 py-1.5 text-sm font-medium text-brand">
                      {grammarById.get(g)?.title}
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
          <Button className="mt-6 w-full" onClick={() => setMode("guiada")}>
            Pasar a la práctica
          </Button>
        </div>
      )}

      {mode === "guiada" && (
        <div className="mt-5">
          <h2 className="text-xl font-bold">Práctica guiada</h2>
          <p className="mt-1 text-ink-2">
            {c.guidedIds.length} ejercicios con traducción y pistas. Puedes volver al diálogo cuando quieras.
          </p>
          <Button className="mt-4 w-full" onClick={() => setMode("practicing-guiada")}>
            Empezar práctica
          </Button>
        </div>
      )}

      {mode === "reto" && (
        <div className="mt-5">
          <h2 className="text-xl font-bold">Reto final</h2>
          <p className="mt-1 text-ink-2">
            {c.challengeIds.length} intervenciones. Respondes sin ver el modelo ni la traducción (puedes mostrarla si te bloqueas). La solución aparece
            después de responder.
          </p>
          <Button className="mt-4 w-full" onClick={() => setMode("practicing-reto")}>
            Aceptar el reto
          </Button>
        </div>
      )}
      <ReviewNote />
    </div>
  );
}
