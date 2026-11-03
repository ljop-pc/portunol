/**
 * Motor de corrección determinista (Fase 1, sin IA).
 *
 * Orden de comprobación:
 *  1. Coincidencia con una respuesta aceptada (tras normalizar).
 *  2. Coincidencia con un error previsto (explicación específica).
 *  3. Coincidencia ignorando tildes → se acepta con aviso de ortografía.
 *  4. Error previsto ignorando tildes.
 *  5. Ninguna coincidencia → "no coincide con lo previsto" (sin inventar
 *     un diagnóstico que no tenemos).
 */
import type { ErrorCategory, ExpectedError } from "@/lib/content/schema";

export type CorrectionStatus =
  /** Correcta. */
  | "correct"
  /** Aceptada, pero con una observación (tilde, alternativa menos habitual…). */
  | "accepted-with-note"
  /** Comprensible, pero no es la forma de Portugal o no es natural. Cuenta como fallo. */
  | "close"
  /** Incorrecta. */
  | "incorrect";

export interface CorrectionResult {
  status: CorrectionStatus;
  /** true si cuenta como acierto para el progreso. */
  isCorrect: boolean;
  category?: ErrorCategory;
  feedback?: string;
  /** Respuesta modelo que se muestra al alumno. */
  model: string;
}

const PUNCTUATION = /[.,!?¿¡;:"«»“”()…–—-]/g;

/**
 * Pares que tratamos como equivalentes al comparar: dependen de quién habla
 * (obrigado/obrigada, cansado/cansada…) y no son errores.
 */
const SPEAKER_GENDER_PAIRS: [RegExp, string][] = [
  [/\bobrigada\b/g, "obrigado"],
  [/\bcansada\b/g, "cansado"],
  [/\bsatisfeita\b/g, "satisfeito"],
];

export function normalize(input: string): string {
  let s = input
    .normalize("NFC")
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    // El guion de los pronombres (chamo-me) se conserva como espacio para
    // que "chamo-me" y "chamo - me" coincidan, pero se compara aparte.
    .replace(/(\p{L})-(\p{L})/gu, "$1‑$2")
    .replace(PUNCTUATION, " ")
    .replace(/‑/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  for (const [re, rep] of SPEAKER_GENDER_PAIRS) s = s.replace(re, rep);
  return s;
}

/** Plegado tolerante: sin tildes ni cedilla, y guiones como espacios. */
export function stripAccents(input: string): string {
  return input.normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC").replace(/-/g, " ");
}

function matchesAny(answer: string, candidates: string[], fold: (s: string) => string): string | undefined {
  const a = fold(normalize(answer));
  return candidates.find((c) => fold(normalize(c)) === a);
}

const identity = (s: string) => s;

export function correct(answer: string, accepted: string[], expectedErrors: ExpectedError[] = []): CorrectionResult {
  const model = accepted[0];

  if (normalize(answer) === "") {
    return { status: "incorrect", isCorrect: false, model, feedback: "No has escrito ninguna respuesta." };
  }

  // 1. Exacta
  if (matchesAny(answer, accepted, identity)) {
    return { status: "correct", isCorrect: true, model };
  }

  // 2. Error previsto exacto
  for (const err of expectedErrors) {
    if (matchesAny(answer, err.answers, identity)) return fromExpected(err, model);
  }

  // 3. Solo fallan tildes o la cedilla
  const accentMatch = matchesAny(answer, accepted, stripAccents);
  if (accentMatch) {
    return {
      status: "accepted-with-note",
      isCorrect: true,
      category: "ortografia",
      model: accentMatch,
      feedback: `Correcto, pero fíjate en la escritura (tildes, cedilla o guion): se escribe «${accentMatch}». En portugués la tilde puede cambiar el significado (avô/avó, tem/têm).`,
    };
  }

  // 4. Error previsto sin tildes
  for (const err of expectedErrors) {
    if (matchesAny(answer, err.answers, stripAccents)) return fromExpected(err, model);
  }

  return {
    status: "incorrect",
    isCorrect: false,
    model,
    feedback:
      "Tu respuesta no coincide con ninguna de las previstas. Compárala con la versión natural. " +
      "(Puede que tu frase también sea válida: en esta versión solo reconocemos respuestas previstas.)",
  };
}

function fromExpected(err: ExpectedError, model: string): CorrectionResult {
  if (err.acceptable) {
    return { status: "accepted-with-note", isCorrect: true, category: err.category, feedback: err.feedback, model };
  }
  const close = err.category === "variante-br" || err.category === "poco-natural" || err.category === "registro";
  return {
    status: close ? "close" : "incorrect",
    isCorrect: false,
    category: err.category,
    feedback: err.feedback,
    model,
  };
}

export const CATEGORY_LABELS: Record<ErrorCategory, string> = {
  gramatica: "Error gramatical",
  vocabulario: "Error de vocabulario",
  "interferencia-es": "Interferencia del español",
  "variante-br": "Forma de Brasil, no de Portugal",
  "poco-natural": "Comprensible, pero poco natural",
  registro: "Diferencia de registro",
  orden: "Orden de las palabras",
  ortografia: "Ortografía / tildes",
  comprension: "Comprensión",
};
