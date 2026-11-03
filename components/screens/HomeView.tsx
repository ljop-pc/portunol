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
      <header className="mb-5">
        <p className="text-sm font-semibold text-brand">Português de Bolso · PT-PT</p>
        <h1 className="mt-1 text-[28px] font-bold leading-tight tracking-tight">Aprender</h1>
        <p className="mt-1 text-ink-2">Portugués de Portugal, explicado desde el español.</p>
      </header>

      {hydrated && !getStore().persistent && (
        <div role="alert" className="mb-4 rounded-2xl border border-warn bg-warn-soft p-3 text-sm text-warn">
          Este navegador no permite guardar datos (¿modo privado?). Tu progreso se perderá al cerrar la página.
        </div>
      )}

      {hydrated && current && (
        <Link href={`/aprender/${current.id}/`} className="block rounded-3xl bg-brand p-5 text-brand-ink active:opacity-90">
          <p className="text-sm font-medium opacity-85">
            {status(current.id) === "en-curso" ? "Continuar donde lo dejaste" : completed === 0 ? "Empieza aquí" : "Siguiente lección"}
          </p>
          <p className="mt-1 text-xl font-bold leading-snug">{current.title}</p>
          <p className="mt-1 text-sm opacity-85">
            Lección {current.order} · {current.minutes} min
          </p>
        </Link>
      )}
      {hydrated && !current && (
        <div className="rounded-3xl bg-ok-soft p-5 text-ok">
          <p className="text-xl font-bold">¡Has completado todas las lecciones!</p>
          <p className="mt-1 text-sm">Repasa vocabulario y practica las conversaciones. Pronto habrá más unidades.</p>
        </div>
      )}
      {!hydrated && <div className="h-[116px] rounded-3xl bg-surface-2" aria-hidden />}

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
                              s === "completada" ? "bg-ok text-white" : "bg-surface-2 text-ink-2"
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
        <Link href="/vocabulario/" className="rounded-2xl border border-line bg-surface p-4 active:bg-surface-2">
          <p className="font-semibold">Vocabulario</p>
          <p className="mt-0.5 text-sm text-ink-2">Por temas</p>
        </Link>
        <Link href="/vocabulario/ojo/" className="rounded-2xl border border-line bg-surface p-4 active:bg-surface-2">
          <p className="font-semibold">Ojo con esta palabra</p>
          <p className="mt-0.5 text-sm text-ink-2">Falsos amigos</p>
        </Link>
        <Link href={`/conversacion/${conversations[0].id}/`} className="col-span-2 rounded-2xl border border-line bg-surface p-4 active:bg-surface-2">
          <p className="font-semibold">Conversación: {conversations[0].title}</p>
          <p className="mt-0.5 text-sm text-ink-2">Lee, escucha y responde</p>
        </Link>
      </div>
    </div>
  );
}
