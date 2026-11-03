"use client";
import { useMemo, useRef, useState } from "react";
import type { Exercise } from "@/lib/content/schema";
import { correct } from "@/lib/correction";
import { Button } from "@/components/ui/primitives";
import { AudioButton } from "@/components/audio/AudioButton";
import type { AnswerResult, ExerciseViewProps } from "./types";

type Of<T extends Exercise["type"]> = Extract<Exercise, { type: T }>;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const skillCategory = { comprension: "comprension", vocabulario: "vocabulario", gramatica: "gramatica", produccion: "gramatica" } as const;

/* ------------------------------------------------------------------ Elegir */

export function ChoiceView({ exercise: e, locked, onSubmit }: ExerciseViewProps<Of<"choice">>) {
  const order = useMemo(() => shuffle(e.options.map((_, i) => i)), [e]);
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div>
      <div className="mb-5 flex items-start gap-3 rounded-2xl bg-surface-2 p-4">
        <p lang={e.promptLang === "pt" ? "pt-PT" : "es"} className="flex-1 text-xl font-semibold leading-snug">
          {e.prompt}
        </p>
        {e.promptLang === "pt" && <AudioButton text={e.prompt} />}
      </div>
      <ul className="space-y-2.5">
        {order.map((i) => {
          const isAnswer = i === e.answer;
          const isPicked = i === picked;
          let style = "border-line bg-surface active:bg-surface-2";
          if (locked && isAnswer) style = "border-ok bg-ok-soft";
          else if (locked && isPicked) style = "border-bad bg-bad-soft";
          return (
            <li key={i}>
              <button
                type="button"
                disabled={locked}
                onClick={() => {
                  setPicked(i);
                  onSubmit({
                    answer: e.options[i],
                    isCorrect: isAnswer,
                    status: isAnswer ? "correct" : "incorrect",
                    category: isAnswer ? undefined : skillCategory[e.skill],
                    model: e.options[e.answer],
                  });
                }}
                className={`w-full min-h-[52px] rounded-2xl border-2 px-4 py-3 text-left text-[17px] ${style}`}
              >
                {e.options[i]}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* --------------------------------------------------------- Escribir (común) */

function TextAnswer({
  locked,
  onCheck,
  placeholder = "Escribe en portugués…",
  initial = "",
  multiline = false,
}: {
  locked: boolean;
  onCheck: (value: string) => void;
  placeholder?: string;
  initial?: string;
  multiline?: boolean;
}) {
  const [value, setValue] = useState(initial);
  const ref = useRef<HTMLTextAreaElement>(null);
  const submit = () => {
    if (!locked && value.trim()) {
      ref.current?.blur();
      onCheck(value);
    }
  };
  return (
    <div>
      <textarea
        ref={ref}
        value={value}
        disabled={locked}
        onChange={(ev) => setValue(ev.target.value)}
        onKeyDown={(ev) => {
          if (ev.key === "Enter" && !ev.shiftKey && !multiline) {
            ev.preventDefault();
            submit();
          }
        }}
        rows={multiline ? 4 : 2}
        lang="pt-PT"
        autoCapitalize="sentences"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        placeholder={placeholder}
        aria-label="Tu respuesta"
        className="w-full resize-none rounded-2xl border-2 border-line bg-surface px-4 py-3 text-[17px] outline-none focus:border-brand disabled:opacity-80"
      />
      <p className="mt-1.5 text-xs text-ink-2">
        Consejo: activa el teclado portugués en el iPhone para escribir ã, ç, ê… (Ajustes → General → Teclado).
      </p>
      {!locked && (
        <Button className="mt-3 w-full" onClick={submit} disabled={!value.trim()}>
          Comprobar
        </Button>
      )}
    </div>
  );
}

function check(e: Of<"fill" | "build" | "translate" | "fix" | "dialogue">, answer: string): AnswerResult {
  const r = correct(answer, e.accepted, e.expectedErrors);
  return { answer, isCorrect: r.isCorrect, status: r.status, category: r.category ?? (r.isCorrect ? undefined : skillCategory[e.skill]), feedback: r.feedback, model: r.model };
}

/* ------------------------------------------------------------------ Completar */

export function FillView({ exercise: e, locked, onSubmit, hideTranslations }: ExerciseViewProps<Of<"fill">>) {
  const [before, after] = e.sentence.split("___");
  const [value, setValue] = useState("");
  const submit = () => value.trim() && onSubmit(check(e, value));
  return (
    <div>
      <div className="mb-4 rounded-2xl bg-surface-2 p-4">
        <p lang="pt-PT" className="text-xl font-semibold leading-relaxed">
          {before}
          <input
            value={value}
            onChange={(ev) => setValue(ev.target.value)}
            onKeyDown={(ev) => ev.key === "Enter" && submit()}
            disabled={locked}
            lang="pt-PT"
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            aria-label="Palabra que falta"
            className="mx-1 inline-block w-32 rounded-lg border-b-2 border-brand bg-surface px-2 py-0.5 text-center text-xl font-semibold outline-none"
          />
          {after}
        </p>
        {!hideTranslations && <p className="mt-2 text-ink-2">{e.translation}</p>}
        {e.hint && <p className="mt-1 text-sm text-ink-2">Pista: {e.hint}</p>}
      </div>
      {!locked && (
        <Button className="w-full" onClick={submit} disabled={!value.trim()}>
          Comprobar
        </Button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ Ordenar */

export function BuildView({ exercise: e, locked, onSubmit }: ExerciseViewProps<Of<"build">>) {
  const tokens = useMemo(() => shuffle(e.tokens.map((t, i) => ({ t, i }))), [e]);
  const [chosen, setChosen] = useState<number[]>([]);
  const sentence = chosen.map((i) => e.tokens[i]).join(" ");
  return (
    <div>
      <p className="mb-3 text-lg font-medium text-ink-2">«{e.translation}»</p>
      <div
        aria-label="Tu frase"
        className="mb-4 flex min-h-[64px] flex-wrap gap-2 rounded-2xl border-2 border-dashed border-line p-3"
      >
        {chosen.length === 0 && <span className="self-center text-ink-2">Toca las palabras en orden</span>}
        {chosen.map((i, pos) => (
          <button
            key={`${i}-${pos}`}
            type="button"
            lang="pt-PT"
            disabled={locked}
            onClick={() => setChosen((c) => c.filter((_, p) => p !== pos))}
            className="min-h-[44px] rounded-xl bg-brand-soft px-3 text-[17px] font-medium text-brand"
          >
            {e.tokens[i]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {tokens.map(({ t, i }) =>
          chosen.includes(i) ? (
            <span key={i} className="min-h-[44px] rounded-xl border border-dashed border-line px-3 opacity-0" aria-hidden>
              {t}
            </span>
          ) : (
            <button
              key={i}
              type="button"
              lang="pt-PT"
              disabled={locked}
              onClick={() => setChosen((c) => [...c, i])}
              className="min-h-[44px] rounded-xl border border-line bg-surface px-3 text-[17px] font-medium active:bg-surface-2"
            >
              {t}
            </button>
          ),
        )}
      </div>
      {!locked && (
        <Button className="mt-5 w-full" disabled={chosen.length === 0} onClick={() => onSubmit(check(e, sentence))}>
          Comprobar
        </Button>
      )}
    </div>
  );
}

/* ----------------------------------------------------- Traducir / Corregir */

export function TranslateView({ exercise: e, locked, onSubmit }: ExerciseViewProps<Of<"translate">>) {
  return (
    <div>
      <div className="mb-4 rounded-2xl bg-surface-2 p-4">
        <p className="text-xl font-semibold leading-snug">«{e.es}»</p>
      </div>
      <TextAnswer locked={locked} onCheck={(v) => onSubmit(check(e, v))} />
    </div>
  );
}

export function FixView({ exercise: e, locked, onSubmit }: ExerciseViewProps<Of<"fix">>) {
  return (
    <div>
      <div className="mb-4 rounded-2xl border-2 border-bad/40 bg-bad-soft p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-bad">Frase con error</p>
        <p lang="pt-PT" className="mt-1 text-xl font-semibold leading-snug">
          {e.wrong}
        </p>
      </div>
      <TextAnswer locked={locked} initial={e.wrong} placeholder="Escribe la frase corregida…" onCheck={(v) => onSubmit(check(e, v))} />
    </div>
  );
}

/* ------------------------------------------------------------------ Diálogo */

export function DialogueView({ exercise: e, locked, onSubmit, hideTranslations }: ExerciseViewProps<Of<"dialogue">>) {
  const [showEs, setShowEs] = useState(!hideTranslations);
  return (
    <div>
      <div className="mb-4 space-y-2">
        {e.context.map((t, i) => (
          <div key={i} className="max-w-[90%] rounded-2xl rounded-tl-md bg-surface-2 p-3">
            <p className="text-xs font-semibold text-ink-2">{t.speaker}</p>
            <div className="flex items-start gap-2">
              <p lang="pt-PT" className="flex-1 text-[17px] font-medium">
                {t.pt}
              </p>
              <AudioButton text={t.pt} size="sm" />
            </div>
            {showEs ? (
              <p className="text-sm text-ink-2">{t.es}</p>
            ) : (
              <button type="button" className="text-sm text-brand" onClick={() => setShowEs(true)}>
                Ver traducción
              </button>
            )}
          </div>
        ))}
      </div>
      <p className="mb-3 rounded-xl bg-brand-soft p-3 font-medium text-brand">Tu turno: {e.task}</p>
      <TextAnswer locked={locked} onCheck={(v) => onSubmit(check(e, v))} placeholder="Responde en portugués…" />
    </div>
  );
}

/* ------------------------------------------------------- Producción libre */

export function FreeView({ exercise: e, locked, onSubmit }: ExerciseViewProps<Of<"free">>) {
  const [written, setWritten] = useState<string | null>(null);
  return (
    <div>
      <div className="mb-4 rounded-2xl bg-surface-2 p-4">
        <p className="text-lg font-semibold leading-snug">{e.prompt}</p>
      </div>
      <TextAnswer locked={written !== null} multiline onCheck={(v) => setWritten(v)} placeholder="Escribe tu respuesta…" />
      {written !== null && (
        <div className="mt-4 rounded-2xl border border-line bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-2">Respuestas modelo</p>
          <ul className="mt-2 space-y-1.5">
            {e.modelAnswers.map((m) => (
              <li key={m} lang="pt-PT" className="flex items-start gap-2 text-[17px]">
                <span className="flex-1">{m}</span>
                <AudioButton text={m} size="sm" />
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-ink-2">
            Esta respuesta <strong>no se corrige automáticamente</strong> (llegará con el tutor de IA). Compárala con los modelos y valórate:
          </p>
          {!locked && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { label: "Bien", ok: true },
                { label: "Parecido", ok: true },
                { label: "No me salió", ok: false },
              ].map((o) => (
                <Button
                  key={o.label}
                  variant="secondary"
                  className="px-2 text-sm"
                  onClick={() =>
                    onSubmit({
                      answer: written,
                      isCorrect: o.ok,
                      status: "self-assessed",
                      category: o.ok ? undefined : "gramatica",
                      model: e.modelAnswers[0],
                      feedback: `Autoevaluación: ${o.label.toLowerCase()}.`,
                    })
                  }
                >
                  {o.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ExerciseView(props: ExerciseViewProps) {
  const e = props.exercise;
  switch (e.type) {
    case "choice":
      return <ChoiceView {...props} exercise={e} />;
    case "fill":
      return <FillView {...props} exercise={e} />;
    case "build":
      return <BuildView {...props} exercise={e} />;
    case "translate":
      return <TranslateView {...props} exercise={e} />;
    case "fix":
      return <FixView {...props} exercise={e} />;
    case "dialogue":
      return <DialogueView {...props} exercise={e} />;
    case "free":
      return <FreeView {...props} exercise={e} />;
  }
}

export const TYPE_LABEL: Record<Exercise["type"], string> = {
  choice: "Comprensión",
  fill: "Completar",
  build: "Construir la frase",
  translate: "Traducción",
  fix: "Detectar el error",
  dialogue: "Diálogo",
  free: "Producción libre",
};
