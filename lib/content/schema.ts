/**
 * Esquemas del contenido educativo.
 *
 * Todo el contenido vive en `content/*.json` y se valida aquí al cargarse
 * (también durante el build y los tests). Si un archivo JSON tiene un error
 * de estructura, el build falla con un mensaje claro en vez de romper la UI.
 */
import { z } from "zod";

export const ReviewSchema = z.enum(["pendiente-nativo", "revisado"]);
export const RegisterSchema = z.enum(["informal", "neutro", "formal"]);

export const ErrorCategorySchema = z.enum([
  "gramatica",
  "vocabulario",
  "interferencia-es",
  "variante-br",
  "poco-natural",
  "registro",
  "orden",
  "ortografia",
  "comprension",
]);
export type ErrorCategory = z.infer<typeof ErrorCategorySchema>;

export const SkillSchema = z.enum(["comprension", "vocabulario", "gramatica", "produccion"]);
export type Skill = z.infer<typeof SkillSchema>;

export const ExampleSchema = z.object({
  pt: z.string().min(1),
  es: z.string().min(1),
  register: RegisterSchema.optional(),
  note: z.string().optional(),
});
export type Example = z.infer<typeof ExampleSchema>;

/* ---------------------------------------------------------------- Ejercicios */

/**
 * Un "error previsto" es una respuesta incorrecta (o mejorable) que ya
 * sabemos que un hispanohablante suele dar. Permite explicar el error
 * concreto en lugar de decir solo "incorrecto".
 *
 * - `acceptable: true` → la respuesta se da por buena, pero con una nota
 *   (p. ej. "también se dice así, pero en Portugal es más habitual…").
 * - `acceptable: false` (por defecto) → no se acepta; se explica por qué.
 */
export const ExpectedErrorSchema = z.object({
  answers: z.array(z.string().min(1)).min(1),
  category: ErrorCategorySchema,
  feedback: z.string().min(1),
  acceptable: z.boolean().default(false),
});
export type ExpectedError = z.infer<typeof ExpectedErrorSchema>;

const ContextTurnSchema = z.object({ speaker: z.string(), pt: z.string(), es: z.string() });

const ExerciseBase = {
  id: z.string().min(1),
  skill: SkillSchema,
  /** Tema gramatical o escenario al que se asocian los errores. */
  topic: z.string().min(1),
  /** Instrucción en español, visible para el alumno. */
  instruction: z.string().min(1),
  /** Explicación que se muestra siempre tras responder. */
  explanation: z.string().min(1),
  expectedErrors: z.array(ExpectedErrorSchema).default([]),
  review: ReviewSchema.default("pendiente-nativo"),
};

export const ChoiceExerciseSchema = z.object({
  ...ExerciseBase,
  type: z.literal("choice"),
  /** Frase o pregunta que se muestra (en PT o ES según el ejercicio). */
  prompt: z.string().min(1),
  promptLang: z.enum(["pt", "es"]).default("pt"),
  options: z.array(z.string().min(1)).min(2),
  answer: z.number().int().min(0),
});

export const FillExerciseSchema = z.object({
  ...ExerciseBase,
  type: z.literal("fill"),
  /** Frase en portugués con `___` donde va el hueco. */
  sentence: z.string().includes("___"),
  translation: z.string().min(1),
  hint: z.string().optional(),
  accepted: z.array(z.string().min(1)).min(1),
});

export const BuildExerciseSchema = z.object({
  ...ExerciseBase,
  type: z.literal("build"),
  translation: z.string().min(1),
  /** Palabras disponibles (se barajan). Puede incluir distractores. */
  tokens: z.array(z.string().min(1)).min(2),
  accepted: z.array(z.string().min(1)).min(1),
});

export const TranslateExerciseSchema = z.object({
  ...ExerciseBase,
  type: z.literal("translate"),
  es: z.string().min(1),
  accepted: z.array(z.string().min(1)).min(1),
});

export const FixExerciseSchema = z.object({
  ...ExerciseBase,
  type: z.literal("fix"),
  wrong: z.string().min(1),
  accepted: z.array(z.string().min(1)).min(1),
});

export const DialogueExerciseSchema = z.object({
  ...ExerciseBase,
  type: z.literal("dialogue"),
  context: z.array(ContextTurnSchema).min(1),
  /** Qué debe decir el alumno, en español. */
  task: z.string().min(1),
  accepted: z.array(z.string().min(1)).min(1),
});

export const FreeExerciseSchema = z.object({
  ...ExerciseBase,
  type: z.literal("free"),
  prompt: z.string().min(1),
  modelAnswers: z.array(z.string().min(1)).min(1),
});

export const ExerciseSchema = z.discriminatedUnion("type", [
  ChoiceExerciseSchema,
  FillExerciseSchema,
  BuildExerciseSchema,
  TranslateExerciseSchema,
  FixExerciseSchema,
  DialogueExerciseSchema,
  FreeExerciseSchema,
]);
export type Exercise = z.infer<typeof ExerciseSchema>;
export type ExerciseType = Exercise["type"];
export type TypedAnswerExercise = Extract<Exercise, { accepted: string[] }>;

export const ExerciseFileSchema = z.array(ExerciseSchema);

/* ----------------------------------------------------------------- Gramática */

const PersonForms = z.object({
  eu: z.string(),
  tu: z.string(),
  ele: z.string(),
  nos: z.string(),
  eles: z.string(),
});

export const GrammarTopicSchema = z.object({
  id: z.string().min(1),
  order: z.number().int(),
  unit: z.number().int(),
  title: z.string().min(1),
  summary: z.string().min(1),
  rule: z.array(z.string().min(1)).min(1),
  pattern: z.string().optional(),
  conjugations: z
    .array(z.object({ verb: z.string(), meaning: z.string(), forms: PersonForms, note: z.string().optional() }))
    .default([]),
  table: z
    .object({ caption: z.string(), headers: z.array(z.string()), rows: z.array(z.array(z.string())) })
    .optional(),
  examples: z.array(ExampleSchema).min(3),
  contrastEs: z.array(z.string().min(1)).min(1),
  commonErrors: z.array(z.object({ wrong: z.string(), right: z.string(), why: z.string() })).min(1),
  exerciseIds: z.array(z.string()).min(1),
  review: ReviewSchema.default("pendiente-nativo"),
  reviewNotes: z.array(z.string()).default([]),
});
export type GrammarTopic = z.infer<typeof GrammarTopicSchema>;

/* ------------------------------------------------------------------ Lecciones */

export const LessonSchema = z.object({
  id: z.string().min(1),
  order: z.number().int(),
  unit: z.number().int(),
  title: z.string().min(1),
  goal: z.string().min(1),
  grammarId: z.string().min(1),
  minutes: z.number().int().min(1),
  exerciseIds: z.array(z.string()).min(3),
  takeaways: z.array(z.string().min(1)).min(2),
});
export type Lesson = z.infer<typeof LessonSchema>;

/* ---------------------------------------------------------------- Vocabulario */

export const PosSchema = z.enum([
  "sustantivo",
  "verbo",
  "adjetivo",
  "adverbio",
  "expresión",
  "interjección",
  "preposición",
]);

export const VocabEntryInputSchema = z.object({
  /** Opcional: solo si el id automático (derivado de `pt`) colisiona. */
  id: z.string().optional(),
  pt: z.string().min(1),
  es: z.string().min(1),
  pos: PosSchema,
  gender: z.enum(["m", "f"]).optional(),
  exPt: z.string().min(1),
  exEs: z.string().min(1),
  note: z.string().optional(),
  /** Forma o palabra distinta en portugués de Brasil, si la hay. */
  ptBr: z.string().optional(),
  register: RegisterSchema.optional(),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(1),
  review: ReviewSchema.default("pendiente-nativo"),
});

export const VocabTopicFileSchema = z.object({
  topic: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  order: z.number().int(),
  entries: z.array(VocabEntryInputSchema).min(1),
});

export type VocabEntry = z.infer<typeof VocabEntryInputSchema> & { id: string; topic: string };
export type VocabTopic = Omit<z.infer<typeof VocabTopicFileSchema>, "entries"> & { entries: VocabEntry[] };

/* --------------------------------------------------------- Ojo con esta palabra */

export const FalseFriendSchema = z.object({
  id: z.string().min(1),
  pt: z.string().min(1),
  /** Palabra española con la que se confunde. */
  looksLike: z.string().min(1),
  /** Lo que significa realmente en portugués europeo. */
  meaning: z.string().min(1),
  /** Cómo se dice en portugués lo que el hispanohablante cree que significa. */
  esFalseMeaningInPt: z.string().min(1),
  exPt: z.string().min(1),
  exEs: z.string().min(1),
  note: z.string().optional(),
  review: ReviewSchema.default("pendiente-nativo"),
});
export type FalseFriend = z.infer<typeof FalseFriendSchema>;

/* -------------------------------------------------------------- Conversación */

export const ConversationSchema = z.object({
  id: z.string().min(1),
  order: z.number().int(),
  title: z.string().min(1),
  context: z.string().min(1),
  goal: z.string().min(1),
  characters: z.array(z.object({ name: z.string(), role: z.string() })).min(2),
  turns: z
    .array(
      z.object({
        speaker: z.string(),
        pt: z.string(),
        es: z.string(),
        alternatives: z.array(z.string()).default([]),
        note: z.string().optional(),
      }),
    )
    .min(4),
  expressions: z.array(ExampleSchema).min(1),
  grammarIds: z.array(z.string()).default([]),
  grammarNotes: z.array(z.string()).default([]),
  guidedIds: z.array(z.string()).min(1),
  challengeIds: z.array(z.string()).min(1),
  review: ReviewSchema.default("pendiente-nativo"),
  reviewNotes: z.array(z.string()).default([]),
});
export type Conversation = z.infer<typeof ConversationSchema>;
