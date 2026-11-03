"use client";
import Link from "next/link";
import { conversations, lessons } from "@/lib/content";
import { useHydrated, useProgress } from "@/lib/progress/react";
import { getStore } from "@/lib/progress/react";
import { Badge, LinkCard, SectionTitle } from "@/components/ui/primitives";
import { IconCheck } from "@/components/ui/icons";
import { InstallHint } from "./InstallHint";

export function HomeView() {
  const progress = useProgress();
  const hydrated = useHydrated();
  const status = (id: string) => progress.lessons[id]?.status;
  const current =
    lessons.find((l) => status(l.id) === "en-curso") ?? lessons.find((l) => status(l.id) !== "completada");
  const completed = lessons.filter((l) => status(l.id) === "completada").length;
  const units = [...new Set(lessons.map((l) => l.unit))];

  return (
    <div>
      <header className="mb-8 pt-6">
        <p className="text-[15px] font-semibold tracking-[-0.01em] text-ink-2">Português de Bolso</p>
        <h1 className="mt-2 text-[40px] font-bold leading-[1.05] tracking-[-0.035em]">
          Portugués de Portugal.
          <br />
          <span className="text-gradient">Explicado desde el español.</span>
        </h1>
      </header>

      {hydrated && !getStore().persistent && (
        <div role="alert" className="mb-4 rounded-2xl border border-warn bg-warn-soft p-3 text-sm text-warn">
          Este navegador no permite guardar datos (¿modo privado?). Tu progreso se perderá al cerrar la página.
        </div>
      )}

      {hydrated && current && (
        <Link
          href={`/aprender/${current.id}/`}
          className="block rounded-3xl bg-hero p-6 text-hero-ink shadow-card transition active:scale-[0.99]"
        >
          <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-hero-ink/60">
            {status(current.id) === "en-curso" ? "Continuar" : completed === 0 ? "Empieza aquí" : "Siguiente lección"}
          </p>
          <p className="mt-2 text-[28px] font-bold leading-[1.1] tracking-[-0.03em]">{current.title}</p>
          <p className="mt-2 text-[15px] text-hero-ink/60">
            Lección {current.order} · {current.minutes} min
          </p>
          <span className="mt-5 inline-flex min-h-[40px] items-center rounded-full bg-brand px-5 text-[15px] font-medium text-white">
            {status(current.id) === "en-curso" ? "Continuar" : "Empezar"}
          </span>
        </Link>
      )}
      {hydrated && !current && (
        <div className="rounded-3xl bg-hero p-6 text-hero-ink">
          <p className="text-[28px] font-bold leading-tight tracking-[-0.03em]">Has completado todas las lecciones.</p>
          <p className="mt-2 text-[15px] text-hero-ink/60">Repasa vocabulario y practica las conversaciones. Pronto habrá más unidades.</p>
        </div>
      )}
      {!hydrated && <div className="h-[210px] rounded-3xl bg-surface-2" aria-hidden />}

      <InstallHint />

      {units.map((u) => (
        <section key={u}>
          <SectionTitle>Unidad {u}</SectionTitle>
          <ol className="space-y-2">
            {lessons
              .filter((l) => l.unit === u)
              .map((l) => {
                const s = hydrated ? status(l.id) : undefined;
                return (
                  <li key={l.id}>
                    <LinkCard
                      href={`/aprender/${l.id}/`}
                      title={
                        <span className="flex items-center gap-2">
                          <span
                            className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                              s === "completada" ? "bg-brand text-white" : "bg-surface-2 text-ink-2"
                            }`}
                          >
                            {s === "completada" ? <IconCheck width={16} height={16} /> : l.order}
                          </span>
                          {l.title}
                        </span>
                      }
                      subtitle={
                        <span className="ml-9 inline-flex items-center gap-2">
                          {l.minutes} min {s === "en-curso" && <Badge tone="brand">en curso</Badge>}
                        </span>
                      }
                    />
                  </li>
                );
              })}
          </ol>
        </section>
      ))}

      <SectionTitle>Practicar</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        <Link href="/vocabulario/" className="rounded-2xl bg-surface p-4 shadow-card transition active:scale-[0.98]">
          <p className="font-semibold tracking-[-0.02em]">Vocabulario</p>
          <p className="mt-0.5 text-sm text-ink-2">Por temas</p>
        </Link>
        <Link href="/vocabulario/ojo/" className="rounded-2xl bg-surface p-4 shadow-card transition active:scale-[0.98]">
          <p className="font-semibold tracking-[-0.02em]">Ojo con esta palabra</p>
          <p className="mt-0.5 text-sm text-ink-2">Falsos amigos</p>
        </Link>
        <Link href={`/conversacion/${conversations[0].id}/`} className="col-span-2 rounded-2xl bg-surface p-4 shadow-card transition active:scale-[0.99]">
          <p className="font-semibold tracking-[-0.02em]">Conversación: {conversations[0].title}</p>
          <p className="mt-0.5 text-sm text-ink-2">Lee, escucha y responde</p>
        </Link>
      </div>
    </div>
  );
}
