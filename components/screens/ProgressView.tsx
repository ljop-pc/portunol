"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { conversations, falseFriends, grammarTopics, lessons, topicHref, topicLabel, vocabTopicById, vocabulary } from "@/lib/content";
import type { Skill } from "@/lib/content/schema";
import { CATEGORY_LABELS } from "@/lib/correction";
import { getStore, updateProgress, useHydrated, useProgress } from "@/lib/progress/react";
import { useAudioStatus } from "@/lib/audio/service";
import { Button, Card, PageHeader, ProgressBar, SectionTitle } from "@/components/ui/primitives";

const SKILLS: { id: Skill; label: string }[] = [
  { id: "comprension", label: "Comprensión" },
  { id: "vocabulario", label: "Vocabulario" },
  { id: "gramatica", label: "Gramática" },
  { id: "produccion", label: "Producción (escribir frases)" },
];

function formatMinutes(ms: number) {
  const m = Math.round(ms / 60000);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}

export function ProgressView() {
  const p = useProgress();
  const hydrated = useHydrated();
  const audio = useAudioStatus();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!hydrated) return <PageHeader title="Mi progreso" />;

  const lessonsDone = lessons.filter((l) => p.lessons[l.id]?.status === "completada");
  const convDone = conversations.filter((c) => p.conversations[c.id]?.challengeDone).length;
  const vocabIds = [...vocabulary.map((v) => v.id), ...falseFriends.map((f) => `ff:${f.id}`)];
  const learned = vocabIds.filter((id) => (p.items[id]?.streak ?? 0) >= 2).length;
  const toReview = vocabIds.filter((id) => p.items[id] && p.items[id].streak === 0);
  const studiedTopics = grammarTopics.filter((g) => p.attempts.some((a) => a.topic === g.id));
  const errors = Object.values(p.errors).sort((a, b) => b.count - a.count).slice(0, 6);
  const recent = (skill: Skill) => p.attempts.filter((a) => a.skill === skill).slice(-30);

  const exportData = () => {
    const blob = new Blob([getStore().exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `portugues-de-bolso-progreso-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const importData = async (file: File) => {
    try {
      getStore().importJson(await file.text());
      setMessage("Progreso importado correctamente.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "No se pudo importar el archivo.");
    }
  };

  const vocabName = (id: string) => {
    if (id.startsWith("ff:")) return falseFriends.find((f) => `ff:${f.id}` === id)?.pt ?? id;
    return vocabulary.find((v) => v.id === id)?.pt ?? id;
  };
  const vocabHref = (id: string) => (id.startsWith("ff:") ? "/vocabulario/ojo/" : `/vocabulario/${id.split(":")[0]}/`);

  return (
    <div>
      <PageHeader title="Mi progreso" subtitle="Lo que de verdad importa: qué entiendes, qué sabes decir y qué fallas." />

      {p.attempts.length === 0 && (
        <Card className="mb-4">
          <p className="font-semibold">Todavía no hay datos</p>
          <p className="mt-1 text-ink-2">
            Completa tu primera lección y aquí verás tus avances.{" "}
            <Link href="/" className="text-brand underline">
              Ir a Aprender
            </Link>
          </p>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Stat value={`${lessonsDone.length}/${lessons.length}`} label="lecciones completadas" />
        <Stat value={`${convDone}/${conversations.length}`} label="retos de conversación" />
        <Stat value={`${learned}`} label="palabras aprendidas" hint="2 aciertos seguidos o más" />
        <Stat value={formatMinutes(p.practiceMs)} label="practicando" hint="aprox., solo tiempo en ejercicios" />
      </div>

      <SectionTitle>Competencias</SectionTitle>
      <Card>
        <ul className="space-y-4">
          {SKILLS.map((s) => {
            const r = recent(s.id);
            const acc = r.length ? r.filter((a) => a.correct).length / r.length : 0;
            return (
              <li key={s.id}>
                <div className="mb-1 flex justify-between text-[15px]">
                  <span className="font-medium">{s.label}</span>
                  <span className="tabular-nums text-ink-2">{r.length ? `${Math.round(acc * 100)} %` : "sin datos"}</span>
                </div>
                <ProgressBar value={acc} label={s.label} />
              </li>
            );
          })}
          <li>
            <div className="flex justify-between text-[15px]">
              <span className="font-medium">Pronunciación</span>
              <span className="text-ink-2">no evaluada</span>
            </div>
            <p className="mt-1 text-xs text-ink-2">Esta versión solo reproduce audio; no analiza tu pronunciación.</p>
          </li>
        </ul>
        <p className="mt-4 text-xs text-ink-2">Porcentaje de aciertos en tus últimos 30 ejercicios de cada tipo.</p>
      </Card>

      <SectionTitle>Errores recurrentes</SectionTitle>
      {errors.length === 0 ? (
        <p className="rounded-2xl bg-surface-2 p-4 text-ink-2">Aún no hay errores registrados.</p>
      ) : (
        <ul className="space-y-2">
          {errors.map((e) => {
            const href = topicHref(e.topic);
            const body = (
              <>
                <p className="font-semibold">{CATEGORY_LABELS[e.category]}</p>
                <p className="text-sm text-ink-2">
                  {topicLabel(e.topic)} · {e.count} {e.count === 1 ? "vez" : "veces"}
                </p>
              </>
            );
            return (
              <li key={`${e.category}|${e.topic}`}>
                {href ? (
                  <Link href={href} className="block rounded-2xl border border-line bg-surface p-3 active:bg-surface-2">
                    {body}
                  </Link>
                ) : (
                  <div className="rounded-2xl border border-line bg-surface p-3">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <SectionTitle>Palabras que necesitan repaso</SectionTitle>
      {toReview.length === 0 ? (
        <p className="rounded-2xl bg-surface-2 p-4 text-ink-2">Nada pendiente por ahora.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {toReview.slice(0, 30).map((id) => (
            <Link key={id} href={vocabHref(id)} lang="pt-PT" className="rounded-full bg-warn-soft px-3 py-1.5 text-sm font-medium text-warn">
              {vocabName(id)}
            </Link>
          ))}
        </div>
      )}

      <SectionTitle>Temas estudiados</SectionTitle>
      {studiedTopics.length === 0 ? (
        <p className="rounded-2xl bg-surface-2 p-4 text-ink-2">Aún ninguno.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {studiedTopics.map((g) => (
            <li key={g.id}>
              <Link href={`/gramatica/${g.id}/`} className="inline-block rounded-full bg-brand-soft px-3 py-1.5 text-sm font-medium text-brand">
                {g.title}
              </Link>
            </li>
          ))}
          {[...new Set(p.attempts.filter((a) => a.topic.startsWith("vocab:") && a.topic !== "vocab:ojo").map((a) => a.topic.slice(6)))].map((t) => (
            <li key={t}>
              <Link href={`/vocabulario/${t}/`} className="inline-block rounded-full bg-surface-2 px-3 py-1.5 text-sm font-medium">
                {vocabTopicById.get(t)?.title}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <SectionTitle>Audio</SectionTitle>
      <Card>
        {audio.syntheticAvailable ? (
          <p className="text-[15px]">
            ✅ Voz sintética de portugués europeo detectada: <strong>{audio.voiceName}</strong>. Es una voz del sistema, no una grabación nativa.
          </p>
        ) : (
          <div className="text-[15px]">
            <p>No se ha detectado una voz de portugués de Portugal en este dispositivo, así que la app no reproduce audio (no usamos voces de Brasil).</p>
            <p className="mt-2 text-ink-2">
              En iPhone puedes instalarla en Ajustes → Accesibilidad → Contenido leído → Voces → Português → Portugal. Después, vuelve a abrir la app.
            </p>
          </div>
        )}
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium">Velocidad normal de reproducción</p>
          <div className="flex gap-2">
            {[
              { v: 0.75, l: "Pausada" },
              { v: 0.9, l: "Normal" },
              { v: 1, l: "Natural" },
            ].map((o) => (
              <button
                key={o.v}
                type="button"
                onClick={() => updateProgress((s) => ({ ...s, settings: { ...s.settings, audioRate: o.v } }))}
                className={`min-h-[40px] flex-1 rounded-xl text-sm font-semibold ${
                  p.settings.audioRate === o.v ? "bg-ink text-bg" : "bg-surface-2 text-ink-2"
                }`}
              >
                {o.l}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <SectionTitle>Traducciones</SectionTitle>
      <Card>
        <div className="flex gap-2">
          {(
            [
              ["al-tocar", "Mostrar al tocar"],
              ["siempre", "Mostrar siempre"],
            ] as const
          ).map(([v, l]) => (
            <button
              key={v}
              type="button"
              onClick={() => updateProgress((s) => ({ ...s, settings: { ...s.settings, showTranslations: v } }))}
              className={`min-h-[40px] flex-1 rounded-xl text-sm font-semibold ${
                p.settings.showTranslations === v ? "bg-ink text-bg" : "bg-surface-2 text-ink-2"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-2">«Al tocar» te obliga a intentar entender la frase antes de ver la traducción.</p>
      </Card>

      <SectionTitle>Tus datos</SectionTitle>
      <Card>
        <p className="text-[15px]">
          Todo tu progreso se guarda <strong>solo en este dispositivo</strong> (almacenamiento local del navegador). No hay cuentas ni se envía nada a
          ningún servidor. Si borras los datos de Safari o cambias de móvil, se pierde: usa «Exportar» para guardar una copia.
        </p>
        {message && (
          <p role="status" className="mt-3 rounded-xl bg-surface-2 p-2 text-sm">
            {message}
          </p>
        )}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={exportData}>
            Exportar
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            Importar
          </Button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void importData(f);
            e.target.value = "";
          }}
        />
        {!confirmReset ? (
          <Button variant="ghost" className="mt-2 w-full text-bad" onClick={() => setConfirmReset(true)}>
            Reiniciar progreso
          </Button>
        ) : (
          <div className="mt-3 rounded-xl border border-bad bg-bad-soft p-3">
            <p className="text-sm font-semibold text-bad">¿Seguro? Se borrarán lecciones, errores y repasos. No se puede deshacer.</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => setConfirmReset(false)}>
                Cancelar
              </Button>
              <Button
                className="bg-bad"
                onClick={() => {
                  getStore().reset();
                  setConfirmReset(false);
                  setMessage("Progreso reiniciado.");
                }}
              >
                Borrar todo
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function Stat({ value, label, hint }: { value: string; label: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-sm text-ink-2">{label}</p>
      {hint && <p className="mt-0.5 text-[11px] text-ink-2">{hint}</p>}
    </div>
  );
}
