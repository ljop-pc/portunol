/**
 * Progreso del alumno.
 *
 * `ProgressStore` es una interfaz mínima (leer, suscribirse, modificar).
 * La implementación actual guarda en `localStorage` del propio dispositivo.
 * En una fase posterior se puede añadir otra implementación con
 * sincronización en la nube sin cambiar los componentes.
 */
import type { ErrorCategory, Skill } from "@/lib/content/schema";
import { updateMastery, type ItemMastery } from "@/lib/srs/scheduler";

export const STORAGE_KEY = "pdb:progress";
export const SCHEMA_VERSION = 1;
const MAX_ATTEMPTS = 2000;
/** Tiempo máximo que se cuenta por ejercicio (evita contar la app abierta sin usar). */
const MAX_MS_PER_EXERCISE = 2 * 60 * 1000;

export interface Attempt {
  exerciseId: string;
  topic: string;
  skill: Skill;
  at: string;
  correct: boolean;
  status: string;
  category?: ErrorCategory;
  answer: string;
}

export interface ErrorRecord {
  category: ErrorCategory;
  topic: string;
  count: number;
  lastAt: string;
}

export interface LessonProgress {
  status: "en-curso" | "completada";
  step: number;
  updatedAt: string;
  completedAt?: string;
}

export interface ProgressState {
  schemaVersion: number;
  createdAt: string;
  lessons: Record<string, LessonProgress>;
  conversations: Record<string, { guidedDone: boolean; challengeDone: boolean; updatedAt: string }>;
  attempts: Attempt[];
  items: Record<string, ItemMastery>;
  errors: Record<string, ErrorRecord>;
  practiceMs: number;
  settings: { audioRate: number; showTranslations: "siempre" | "al-tocar" };
}

export function emptyState(now = new Date()): ProgressState {
  return {
    schemaVersion: SCHEMA_VERSION,
    createdAt: now.toISOString(),
    lessons: {},
    conversations: {},
    attempts: [],
    items: {},
    errors: {},
    practiceMs: 0,
    settings: { audioRate: 0.9, showTranslations: "al-tocar" },
  };
}

/** Migraciones entre versiones del esquema. Hoy solo existe la v1. */
export function migrate(raw: unknown): ProgressState {
  if (!raw || typeof raw !== "object") return emptyState();
  const data = raw as Partial<ProgressState>;
  if (data.schemaVersion !== SCHEMA_VERSION) return emptyState();
  const base = emptyState();
  return {
    ...base,
    ...data,
    settings: { ...base.settings, ...(data.settings ?? {}) },
  } as ProgressState;
}

/* ------------------------------------------------------------- Operaciones */

export interface AttemptInput {
  exerciseId: string;
  /** Otros elementos cuyo dominio se actualiza (p. ej. una palabra). */
  itemIds?: string[];
  topic: string;
  skill: Skill;
  correct: boolean;
  status: string;
  category?: ErrorCategory;
  answer: string;
  elapsedMs?: number;
}

export function recordAttempt(state: ProgressState, input: AttemptInput, now = new Date()): ProgressState {
  const at = now.toISOString();
  const attempt: Attempt = {
    exerciseId: input.exerciseId,
    topic: input.topic,
    skill: input.skill,
    at,
    correct: input.correct,
    status: input.status,
    category: input.category,
    answer: input.answer.slice(0, 300),
  };
  const items = { ...state.items };
  for (const id of [input.exerciseId, ...(input.itemIds ?? [])]) {
    items[id] = updateMastery(items[id], input.correct, now);
  }
  const errors = { ...state.errors };
  if (!input.correct && input.category) {
    const key = `${input.category}|${input.topic}`;
    const prev = errors[key];
    errors[key] = { category: input.category, topic: input.topic, count: (prev?.count ?? 0) + 1, lastAt: at };
  }
  const elapsed = Math.max(0, Math.min(MAX_MS_PER_EXERCISE, input.elapsedMs ?? 0));
  return {
    ...state,
    attempts: [...state.attempts, attempt].slice(-MAX_ATTEMPTS),
    items,
    errors,
    practiceMs: state.practiceMs + elapsed,
  };
}

export function setLessonStep(state: ProgressState, lessonId: string, step: number, completed = false, now = new Date()): ProgressState {
  const prev = state.lessons[lessonId];
  const wasCompleted = prev?.status === "completada";
  return {
    ...state,
    lessons: {
      ...state.lessons,
      [lessonId]: {
        status: completed || wasCompleted ? "completada" : "en-curso",
        step,
        updatedAt: now.toISOString(),
        completedAt: completed ? now.toISOString() : prev?.completedAt,
      },
    },
  };
}

export function markConversation(
  state: ProgressState,
  id: string,
  part: "guided" | "challenge",
  now = new Date(),
): ProgressState {
  const prev = state.conversations[id] ?? { guidedDone: false, challengeDone: false, updatedAt: "" };
  return {
    ...state,
    conversations: {
      ...state.conversations,
      [id]: {
        guidedDone: prev.guidedDone || part === "guided",
        challengeDone: prev.challengeDone || part === "challenge",
        updatedAt: now.toISOString(),
      },
    },
  };
}

/* ------------------------------------------------------------- Persistencia */

export interface ProgressStore {
  get(): ProgressState;
  subscribe(listener: () => void): () => void;
  update(fn: (s: ProgressState) => ProgressState): void;
  reset(): void;
  exportJson(): string;
  importJson(json: string): void;
  /** false si el navegador no permite guardar (modo privado, almacenamiento lleno…). */
  readonly persistent: boolean;
}

export function createLocalStore(storage: Storage | undefined): ProgressStore {
  let persistent = !!storage;
  let state: ProgressState = emptyState();
  if (storage) {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      state = raw ? migrate(JSON.parse(raw)) : emptyState();
    } catch {
      state = emptyState();
    }
  }
  const listeners = new Set<() => void>();
  const save = () => {
    if (!storage) return;
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(state));
      persistent = true;
    } catch {
      persistent = false;
    }
  };
  const set = (next: ProgressState) => {
    state = next;
    save();
    listeners.forEach((l) => l());
  };
  return {
    get: () => state,
    subscribe(l) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    update: (fn) => set(fn(state)),
    reset: () => set(emptyState()),
    exportJson: () => JSON.stringify(state, null, 2),
    importJson(json) {
      const raw = JSON.parse(json);
      if (!raw || raw.schemaVersion !== SCHEMA_VERSION) {
        throw new Error("El archivo no es una copia de progreso válida de esta aplicación.");
      }
      set(migrate(raw));
    },
    get persistent() {
      return persistent;
    },
  };
}
