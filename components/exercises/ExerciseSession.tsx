"use client";
import { useEffect, useRef, useState } from "react";
import { CATEGORY_LABELS } from "@/lib/correction";
import { recordAttempt } from "@/lib/progress/store";
import { updateProgress } from "@/lib/progress/react";
import { Button, ProgressBar } from "@/components/ui/primitives";
import { IconAlert, IconCheck, IconClose } from "@/components/ui/icons";
import { useFocusMode } from "@/components/ui/focus";
import { AudioButton } from "@/components/audio/AudioButton";
import { ExerciseView, TYPE_LABEL } from "./views";
import type { AnswerResult, SessionItem } from "./types";

export interface SessionSummary {
  total: number;
  correct: number;
  results: { item: SessionItem; result: AnswerResult }[];
}

export function ExerciseSession({
  items,
  title,
  onExit,
  onFinish,
  finishLabel = "Terminar",
  hideTranslations = false,
}: {
  items: SessionItem[];
  title: string;
  onExit: () => void;
  onFinish: (summary: SessionSummary) => void;
  finishLabel?: string;
  hideTranslations?: boolean;
}) {
  useFocusMode();
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [results, setResults] = useState<SessionSummary["results"]>([]);
  const [done, setDone] = useState(false);
  const startedAt = useRef(0);
  const topRef = useRef<HTMLDivElement>(null);
  const item = items[index];

  // Momento en que aparece cada ejercicio (para medir el tiempo de práctica).
  useEffect(() => {
    startedAt.current = Date.now();
  }, [index]);

  const onSubmit = (r: AnswerResult) => {
    setResult(r);
    setResults((rs) => [...rs, { item, result: r }]);
    updateProgress((s) =>
      recordAttempt(s, {
        exerciseId: item.itemId ?? item.id,
        topic: item.topic,
        skill: item.skill,
        correct: r.isCorrect,
        status: r.status,
        category: r.category,
        answer: r.answer,
        elapsedMs: Date.now() - startedAt.current,
      }),
    );
    requestAnimationFrame(() => document.getElementById("feedback")?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  };

  const next = () => {
    if (index + 1 >= items.length) {
      setDone(true);
    } else {
      setIndex(index + 1);
      setResult(null);
    }
    topRef.current?.scrollIntoView({ block: "start" });
    window.scrollTo({ top: 0 });
  };

  const header = (
    <div ref={topRef} className="sticky top-0 z-20 -mx-4 mb-4 bg-bg/80 px-4 pb-3 pt-2 backdrop-blur-xl backdrop-saturate-150">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onExit}
          aria-label="Cerrar ejercicios"
          className="-ml-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-2 active:bg-surface-2"
        >
          <IconClose />
        </button>
        <ProgressBar value={(index + (result || done ? 1 : 0)) / items.length} label="Progreso de la sesión" />
        <span className="w-12 text-right text-sm tabular-nums text-ink-2">
          {Math.min(index + 1, items.length)}/{items.length}
        </span>
      </div>
    </div>
  );

  if (done) {
    const correct = results.filter((r) => r.result.isCorrect).length;
    const wrong = results.filter((r) => !r.result.isCorrect);
    return (
      <div>
        {header}
        <h2 className="text-[34px] font-bold leading-tight tracking-[-0.03em]">Sesión terminada.</h2>
        <p className="mt-1 text-ink-2">{title}</p>
        <div className="mt-6 rounded-3xl bg-surface p-8 text-center shadow-card">
          <p className="text-[56px] font-bold leading-none tracking-[-0.04em] tabular-nums">
            {correct}/{results.length}
          </p>
          <p className="mt-1 text-ink-2">respuestas correctas</p>
        </div>
        {wrong.length > 0 && (
          <div className="mt-5">
            <h3 className="mb-2 font-semibold">Para repasar</h3>
            <ul className="space-y-2">
              {wrong.map(({ item, result }) => (
                <li key={item.id} className="rounded-2xl bg-surface shadow-card p-3 text-sm">
                  <p className="text-ink-2">Tu respuesta: <span lang="pt-PT">{result.answer}</span></p>
                  {result.model && (
                    <p className="mt-0.5 font-medium" lang="pt-PT">
                      ✓ {result.model}
                    </p>
                  )}
                  {result.category && <p className="mt-1 text-xs text-ink-2">{CATEGORY_LABELS[result.category]}</p>}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-sm text-ink-2">Estos fallos quedan registrados en «Mi progreso» para repasarlos.</p>
          </div>
        )}
        <Button className="mt-6 w-full" onClick={() => onFinish({ total: results.length, correct, results })}>
          {finishLabel}
        </Button>
      </div>
    );
  }

  return (
    <div>
      {header}
      <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-ink-2">{TYPE_LABEL[item.type]}</p>
      <h2 className="mb-5 mt-1 text-[24px] font-bold leading-[1.15] tracking-[-0.03em]">{item.instruction}</h2>
      <ExerciseView key={item.id + index} exercise={item} locked={!!result} onSubmit={onSubmit} hideTranslations={hideTranslations} />
      {result && <Feedback item={item} result={result} />}
      {result && (
        <Button className="mt-4 w-full" onClick={next}>
          {index + 1 >= items.length ? "Ver resultado" : "Continuar"}
        </Button>
      )}
    </div>
  );
}

function Feedback({ item, result }: { item: SessionItem; result: AnswerResult }) {
  const tone = {
    correct: { box: "bg-ok-soft", title: "Correcto.", color: "text-ok" },
    "accepted-with-note": { box: "bg-ok-soft", title: "Correcto, con una observación.", color: "text-ok" },
    "self-assessed": { box: "bg-surface shadow-card", title: "Autoevaluación registrada.", color: "text-ink" },
    close: { box: "bg-warn-soft", title: "Casi. Se entiende, pero…", color: "text-warn" },
    incorrect: { box: "bg-bad-soft", title: "No es correcto.", color: "text-bad" },
  }[result.status];
  const showModel = result.model && result.status !== "correct" && item.type !== "choice";
  const others =
    "accepted" in item ? item.accepted.filter((a) => a !== result.model).slice(0, 3) : [];

  return (
    <div id="feedback" role="status" aria-live="polite" className={`mt-6 rounded-3xl p-5 ${tone.box}`}>
      <p className={`flex items-center gap-2 text-[20px] font-bold tracking-[-0.025em] ${tone.color}`}>
        {result.isCorrect ? <IconCheck width={22} height={22} /> : <IconAlert width={22} height={22} />}
        {tone.title}
      </p>
      {result.category && !result.isCorrect && (
        <p className="mt-1 text-sm font-semibold">{CATEGORY_LABELS[result.category]}</p>
      )}
      {result.feedback && result.status !== "self-assessed" && <p className="mt-2">{result.feedback}</p>}
      {showModel && (
        <div className="mt-4 rounded-2xl bg-surface p-4">
          {item.type !== "free" && (
            <p className="text-sm text-ink-2">
              Tu respuesta: <span lang="pt-PT">{result.answer}</span>
            </p>
          )}
          <div className="mt-1 flex items-center gap-2">
            <p lang="pt-PT" className="flex-1 font-semibold">
              Versión natural: {result.model}
            </p>
            <AudioButton text={result.model!} size="sm" />
          </div>
        </div>
      )}
      <p className="mt-3 text-[15px] text-ink-2">{item.explanation}</p>
      {others.length > 0 && result.isCorrect && (
        <details className="mt-2 text-sm text-ink-2">
          <summary className="cursor-pointer text-brand">Otras respuestas válidas</summary>
          <ul className="mt-1 list-disc pl-5" lang="pt-PT">
            {others.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
