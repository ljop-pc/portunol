import type { ErrorCategory, Exercise } from "@/lib/content/schema";
import type { CorrectionStatus } from "@/lib/correction";

export interface AnswerResult {
  answer: string;
  isCorrect: boolean;
  status: CorrectionStatus | "self-assessed";
  category?: ErrorCategory;
  feedback?: string;
  model?: string;
}

/** Ejercicio listo para mostrarse. Los generados (vocabulario) llevan su propio id de elemento. */
export type SessionItem = Exercise & {
  /** Elemento cuyo dominio se actualiza además del propio ejercicio (p. ej. una palabra). */
  itemId?: string;
};

export interface ExerciseViewProps<E extends Exercise = Exercise> {
  exercise: E;
  /** Se ha respondido: la vista se bloquea y muestra su estado. */
  locked: boolean;
  onSubmit: (result: AnswerResult) => void;
  hideTranslations?: boolean;
}
