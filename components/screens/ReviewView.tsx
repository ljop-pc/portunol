"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { markReviewDone, materializeReview, planDailyReview, REASON_LABEL, localDate, type ReviewItem, type Reason } from "@/lib/review/daily";
import { markTipSeen } from "@/lib/review/patterns";
import { getStore, updateProgress, useHydrated, useProgress } from "@/lib/progress/react";
import { Button, Card, PageHeader } from "@/components/ui/primitives";
import { ExerciseSession } from "@/components/exercises/ExerciseSession";
import { grammarById } from "@/lib/content";
import { PatternTip } from "@/components/review/PatternTip";
import { useFocusMode } from "@/components/ui/focus";

type Phase = "plan" | "tips" | "session" | "done";

const ORDER: Reason[] = ["refuerzo", "fallo", "pendiente", "nuevo"];

export function ReviewView() {
  const progress = useProgress();
  const hydrated = useHydrated();
  const [phase, setPhase] = useState<Phase>("plan");
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [summary, setSummary] = useState<{ correct: number; total: number } | null>(null);
  // El plan se calcula al abrir la pantalla y no cambia mientras se repasa.
  const [frozenAt] = useState(() => Date.now());
  const plan = useMemo(() => planDailyReview(progress, new Date(frozenAt)), [progress, frozenAt]);
  useFocusMode(phase === "tips");

  if (!hydrated) return <PageHeader title="Repaso de hoy" />;

  const start = () => {
    const state = getStore().get();
    setItems(materializeReview(planDailyReview(state, new Date()), state));
    if (plan.patterns.length > 0) {
      setPhase("tips");
    } else {
      setPhase("session");
    }
    window.scrollTo({ top: 0 });
  };

  if (phase === "session") {
    return (
      <ExerciseSession
        items={items}
        title="Repaso de hoy"
        onExit={() => setPhase("plan")}
        finishLabel="Terminar repaso"
        onFinish={(s) => {
          updateProgress((st) => markReviewDone(st));
          setSummary({ correct: s.correct, total: s.total });
          setPhase("done");
          window.scrollTo({ top: 0 });
        }}
      />
    );
  }

  if (phase === "tips") {
    return (
      <div>
        <PageHeader title="Antes de empezar" subtitle="Hemos detectado puntos que se te resisten. Un vistazo rápido y vamos con ejemplos nuevos." />
        <div className="space-y-3">
          {plan.patterns.map((p) => (
            <PatternTip key={p.topic} pattern={p} />
          ))}
        </div>
        <Button
          className="mt-6 w-full"
          onClick={() => {
            for (const p of plan.patterns) updateProgress((s) => markTipSeen(s, p.topic));
            setPhase("session");
            window.scrollTo({ top: 0 });
          }}
        >
          Entendido, a practicar
        </Button>
      </div>
    );
  }

  if (phase === "done") {
    const active = Object.values(progress.patterns).filter((p) => p.status === "activo");
    return (
      <div>
        <PageHeader title="Repaso completado." />
        {summary && (
          <Card className="text-center">
            <p className="text-[56px] font-bold leading-none tracking-[-0.04em] tabular-nums">
              {summary.correct}/{summary.total}
            </p>
            <p className="mt-2 text-ink-2">respuestas correctas</p>
          </Card>
        )}
        <p className="mt-5 text-[17px] leading-relaxed">
          Lo que has fallado volverá pronto; lo que has acertado se espacia cada vez más.{" "}
          {active.length > 0
            ? "Los puntos débiles se darán por superados cuando los aciertes también otro día."
            : "No tienes puntos débiles activos."}
        </p>
        <Link href="/" className="mt-6 block">
          <Button className="w-full">Volver al inicio</Button>
        </Link>
      </div>
    );
  }

  const doneToday = progress.review.lastDate === localDate();

  return (
    <div>
      <PageHeader title="Repaso de hoy" subtitle="Lo que fallaste, lo que está a punto de olvidársete y algo nuevo. Unos minutos al día." />
      {plan.empty ? (
        <Card>
          <p className="text-[17px] font-semibold">Todavía no hay nada que repasar.</p>
          <p className="mt-1 text-ink-2">Haz tu primera lección y a partir de ahí el repaso se adaptará a tus errores.</p>
          <Link href="/" className="mt-4 inline-block font-medium text-brand">
            Ir a las lecciones ›
          </Link>
        </Card>
      ) : plan.items.length === 0 ? (
        <Card>
          <p className="text-[17px] font-semibold">Estás al día.</p>
          <p className="mt-1 text-ink-2">No hay nada pendiente ahora mismo. Vuelve mañana o sigue con una lección nueva.</p>
        </Card>
      ) : (
        <>
          {doneToday && (
            <p className="mb-4 rounded-2xl bg-ok-soft p-4 text-[15px] text-ok">Ya has hecho el repaso de hoy. Puedes repetir con lo que queda pendiente.</p>
          )}
          <Card>
            <p className="text-[34px] font-bold leading-none tracking-[-0.03em] tabular-nums">{plan.items.length}</p>
            <p className="mt-1 text-ink-2">elementos · unos {plan.minutes} min</p>
            <ul className="mt-5 space-y-2.5">
              {ORDER.filter((r) => plan.counts[r] > 0).map((r) => (
                <li key={r} className="flex items-center justify-between text-[16px]">
                  <span>{REASON_LABEL[r]}</span>
                  <span className="tabular-nums text-ink-2">{plan.counts[r]}</span>
                </li>
              ))}
            </ul>
          </Card>
          {plan.patterns.length > 0 && (
            <div className="mt-4 rounded-2xl bg-warn-soft p-4 text-[15px] text-warn">
              <p className="font-semibold">Puntos débiles detectados</p>
              <p className="mt-1">
                Empezarás con una explicación breve y ejemplos nuevos de:{" "}
                {plan.patterns.map((p) => grammarById.get(p.topic)?.title).join(", ")}.
              </p>
            </div>
          )}
          <Button className="mt-6 w-full" onClick={start}>
            Empezar repaso
          </Button>
        </>
      )}
    </div>
  );
}
