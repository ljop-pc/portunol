"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getExercises, grammarById, lessonById, lessons } from "@/lib/content";
import { setLessonStep } from "@/lib/progress/store";
import { getStore, updateProgress, useHydrated } from "@/lib/progress/react";
import { Button, ProgressBar, ReviewNote } from "@/components/ui/primitives";
import { IconClose } from "@/components/ui/icons";
import { useFocusMode } from "@/components/ui/focus";
import { GrammarContrast, GrammarExamples, GrammarRule, GrammarTables } from "@/components/content/GrammarContent";
import { ExerciseSession, type SessionSummary } from "@/components/exercises/ExerciseSession";

const STEPS = ["Objetivo", "Explicación", "Ejemplos", "Contraste con el español", "Ejercicios", "Resumen"] as const;
const EXERCISES = 4;
const SUMMARY = 5;

export function LessonPlayer({ lessonId }: { lessonId: string }) {
  const lesson = lessonById.get(lessonId)!;
  const topic = grammarById.get(lesson.grammarId)!;
  const router = useRouter();
  const hydrated = useHydrated();
  const [step, setStep] = useState<number | null>(null);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  useFocusMode();

  // Recuperar el paso guardado al abrir la lección.
  useEffect(() => {
    if (!hydrated || step !== null) return;
    const saved = getStore().get().lessons[lessonId];
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lectura única del progreso guardado tras hidratar
    setStep(saved && saved.status === "en-curso" ? Math.min(saved.step, EXERCISES) : 0);
  }, [hydrated, lessonId, step]);

  if (step === null) return <div className="h-40" aria-hidden />;

  const go = (s: number, completed = false) => {
    setStep(s);
    updateProgress((p) => setLessonStep(p, lessonId, s, completed));
    window.scrollTo({ top: 0 });
  };
  const exit = () => router.push("/");
  const next = lessons.find((l) => l.order === lesson.order + 1);

  if (step === EXERCISES) {
    return (
      <ExerciseSession
        items={getExercises(lesson.exerciseIds)}
        title={lesson.title}
        onExit={exit}
        finishLabel="Ver resumen de la lección"
        onFinish={(s) => {
          setSummary(s);
          go(SUMMARY, true);
        }}
      />
    );
  }

  return (
    <div>
      <div className="sticky top-0 z-20 -mx-4 mb-4 bg-bg/95 px-4 pb-3 pt-2 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={exit}
            aria-label="Cerrar lección"
            className="-ml-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-2 active:bg-surface-2"
          >
            <IconClose />
          </button>
          <ProgressBar value={step / SUMMARY} label="Progreso de la lección" />
        </div>
        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-brand">
          Lección {lesson.order} · {STEPS[step]}
        </p>
      </div>

      {step === 0 && (
        <div>
          <h1 className="text-[28px] font-bold leading-tight">{lesson.title}</h1>
          <div className="mt-4 rounded-2xl bg-brand-soft p-4">
            <p className="text-sm font-semibold text-brand">Al terminar sabrás…</p>
            <p className="mt-1 text-[17px] leading-relaxed">{lesson.goal}</p>
          </div>
          <p className="mt-4 text-ink-2">
            Unos {lesson.minutes} minutos · explicación breve, ejemplos y {lesson.exerciseIds.length} ejercicios.
          </p>
        </div>
      )}
      {step === 1 && (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">{topic.title}</h1>
          <GrammarRule topic={topic} />
          <GrammarTables topic={topic} />
        </div>
      )}
      {step === 2 && (
        <div>
          <h1 className="mb-1 text-2xl font-bold">Ejemplos en portugués de Portugal</h1>
          <p className="mb-4 text-ink-2">Lee cada frase e intenta entenderla antes de ver la traducción.</p>
          <GrammarExamples topic={topic} />
        </div>
      )}
      {step === 3 && (
        <div>
          <h1 className="mb-4 text-2xl font-bold">Cuándo el español ayuda… y cuándo engaña</h1>
          <GrammarContrast topic={topic} />
        </div>
      )}
      {step === SUMMARY && (
        <div>
          <h1 className="text-[28px] font-bold leading-tight">Lección completada</h1>
          {summary && (
            <p className="mt-1 text-ink-2">
              {summary.correct} de {summary.total} respuestas correctas.
            </p>
          )}
          <div className="mt-4 rounded-2xl border border-line bg-surface p-4">
            <p className="mb-2 font-semibold">Lo que te llevas</p>
            <ul className="list-disc space-y-1.5 pl-5 text-[16px] leading-relaxed">
              {lesson.takeaways.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <p className="mt-4 text-sm text-ink-2">
            Puedes volver a la ficha completa cuando quieras en{" "}
            <Link className="text-brand underline" href={`/gramatica/${topic.id}/`}>
              Gramática → {topic.title}
            </Link>
            .
          </p>
        </div>
      )}

      <div className="mt-8 flex gap-2">
        {step > 0 && step < SUMMARY && (
          <Button variant="secondary" onClick={() => go(step - 1)}>
            Atrás
          </Button>
        )}
        {step < EXERCISES - 1 && (
          <Button className="flex-1" onClick={() => go(step + 1)}>
            {step === 0 ? "Empezar" : "Siguiente"}
          </Button>
        )}
        {step === EXERCISES - 1 && (
          <Button className="flex-1" onClick={() => go(EXERCISES)}>
            Practicar
          </Button>
        )}
        {step === SUMMARY && (
          <>
            <Button variant="secondary" onClick={() => go(EXERCISES)}>
              Repetir ejercicios
            </Button>
            <Button className="flex-1" onClick={() => router.push(next ? `/aprender/${next.id}/` : "/")}>
              {next ? "Siguiente lección" : "Volver al inicio"}
            </Button>
          </>
        )}
      </div>
      {step < SUMMARY && <ReviewNote />}
    </div>
  );
}
