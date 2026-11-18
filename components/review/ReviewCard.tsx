"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { grammarById } from "@/lib/content";
import { localDate, planDailyReview } from "@/lib/review/daily";
import type { ProgressState } from "@/lib/progress/store";

/** Tarjeta de la portada: qué toca repasar hoy. */
export function ReviewCard({ progress }: { progress: ProgressState }) {
  const [now] = useState(() => Date.now());
  const plan = useMemo(() => planDailyReview(progress, new Date(now)), [progress, now]);
  if (plan.empty) return null;
  const doneToday = progress.review.lastDate === localDate(new Date(now));
  const parts = [
    plan.counts.fallo + plan.counts.refuerzo > 0 && `${plan.counts.fallo + plan.counts.refuerzo} para corregir`,
    plan.counts.pendiente > 0 && `${plan.counts.pendiente} para no olvidar`,
    plan.counts.nuevo > 0 && `${plan.counts.nuevo} palabras nuevas`,
  ].filter(Boolean);

  return (
    <Link href="/repaso/" className="mb-4 block rounded-3xl bg-surface p-6 shadow-card transition active:scale-[0.99]">
      <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-ink-2">Repaso de hoy</p>
      {plan.items.length === 0 ? (
        <>
          <p className="mt-2 text-[24px] font-bold leading-tight tracking-[-0.03em]">Estás al día.</p>
          <p className="mt-1 text-[15px] text-ink-2">No hay nada pendiente ahora mismo.</p>
        </>
      ) : (
        <>
          <p className="mt-2 text-[24px] font-bold leading-tight tracking-[-0.03em]">
            {doneToday ? "Hecho hoy. Quedan " : ""}
            {plan.items.length} {plan.items.length === 1 ? "elemento" : "elementos"} · {plan.minutes} min
          </p>
          <p className="mt-1 text-[15px] text-ink-2">{parts.join(" · ")}</p>
          {plan.patterns.length > 0 && (
            <p className="mt-3 inline-flex rounded-full bg-warn-soft px-3 py-1 text-[13px] font-semibold text-warn">
              Punto débil: {plan.patterns.map((p) => grammarById.get(p.topic)?.title).join(", ")}
            </p>
          )}
          <span
            className={`mt-5 flex min-h-[40px] w-fit items-center rounded-full px-5 text-[15px] font-medium ${
              doneToday ? "bg-surface-2 text-ink" : "bg-brand text-white"
            }`}
          >
            {doneToday ? "Repasar más" : "Empezar repaso"}
          </span>
        </>
      )}
    </Link>
  );
}
