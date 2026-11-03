/**
 * Carga y valida todo el contenido educativo.
 * Para añadir contenido nuevo basta con editar o añadir archivos JSON en
 * `content/` y registrarlos en las listas de abajo.
 */
import {
  ConversationSchema,
  ExerciseFileSchema,
  FalseFriendSchema,
  GrammarTopicSchema,
  LessonSchema,
  VocabTopicFileSchema,
  type Conversation,
  type Exercise,
  type FalseFriend,
  type GrammarTopic,
  type Lesson,
  type VocabEntry,
  type VocabTopic,
} from "./schema";
import { z } from "zod";

import grammarJson from "@/content/grammar.json";
import lessonsJson from "@/content/lessons.json";
import falseFriendsJson from "@/content/false-friends.json";

import exGrammar1 from "@/content/exercises/g1-pronomes.json";
import exGrammar2 from "@/content/exercises/g2-artigos.json";
import exGrammar3 from "@/content/exercises/g3-presente.json";
import exGrammar4 from "@/content/exercises/g4-ser-estar.json";
import exGrammar5 from "@/content/exercises/g5-ter-haver.json";
import exGrammar6 from "@/content/exercises/g6-contracoes.json";
import exGrammar7 from "@/content/exercises/g7-negacao-perguntas.json";
import exConversations from "@/content/exercises/conversas.json";

import conv1 from "@/content/conversations/c1-cumprimentar.json";
import conv2 from "@/content/conversations/c2-almoco-familia.json";
import conv3 from "@/content/conversations/c3-fim-de-semana.json";

import vFamilia from "@/content/vocabulary/familia.json";
import vCasa from "@/content/vocabulary/casa.json";
import vComida from "@/content/vocabulary/comida.json";
import vCozinha from "@/content/vocabulary/cozinha.json";
import vRestaurante from "@/content/vocabulary/restaurante.json";
import vSaude from "@/content/vocabulary/saude.json";
import vTempo from "@/content/vocabulary/tempo.json";
import vRotinas from "@/content/vocabulary/rotinas.json";
import vCompras from "@/content/vocabulary/compras.json";
import vViagens from "@/content/vocabulary/viagens.json";
import vEmocoes from "@/content/vocabulary/emocoes.json";
import vSocial from "@/content/vocabulary/social.json";

function parse<T>(schema: z.ZodType<T>, data: unknown, file: string): T {
  const r = schema.safeParse(data);
  if (!r.success) {
    throw new Error(`Contenido inválido en ${file}:\n${z.prettifyError(r.error)}`);
  }
  return r.data;
}

export function slug(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/^(o|a|os|as) /, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const grammarTopics: GrammarTopic[] = parse(z.array(GrammarTopicSchema), grammarJson, "grammar.json").sort(
  (a, b) => a.order - b.order,
);
export const lessons: Lesson[] = parse(z.array(LessonSchema), lessonsJson, "lessons.json").sort(
  (a, b) => a.order - b.order,
);
export const falseFriends: FalseFriend[] = parse(z.array(FalseFriendSchema), falseFriendsJson, "false-friends.json");

const exerciseFiles: [string, unknown][] = [
  ["g1-pronomes", exGrammar1],
  ["g2-artigos", exGrammar2],
  ["g3-presente", exGrammar3],
  ["g4-ser-estar", exGrammar4],
  ["g5-ter-haver", exGrammar5],
  ["g6-contracoes", exGrammar6],
  ["g7-negacao-perguntas", exGrammar7],
  ["conversas", exConversations],
];
export const exercises: Exercise[] = exerciseFiles.flatMap(([f, d]) => parse(ExerciseFileSchema, d, `exercises/${f}.json`));
export const exerciseById = new Map(exercises.map((e) => [e.id, e]));

export const conversations: Conversation[] = (
  [
    ["c1-cumprimentar", conv1],
    ["c2-almoco-familia", conv2],
    ["c3-fim-de-semana", conv3],
  ] as [string, unknown][]
)
  .map(([f, d]) => parse(ConversationSchema, d, `conversations/${f}.json`))
  .sort((a, b) => a.order - b.order);

const vocabFiles: [string, unknown][] = [
  ["familia", vFamilia],
  ["casa", vCasa],
  ["comida", vComida],
  ["cozinha", vCozinha],
  ["restaurante", vRestaurante],
  ["saude", vSaude],
  ["tempo", vTempo],
  ["rotinas", vRotinas],
  ["compras", vCompras],
  ["viagens", vViagens],
  ["emocoes", vEmocoes],
  ["social", vSocial],
];
export const vocabTopics: VocabTopic[] = vocabFiles
  .map(([f, d]) => {
    const file = parse(VocabTopicFileSchema, d, `vocabulary/${f}.json`);
    return {
      ...file,
      entries: file.entries.map((e) => ({ ...e, topic: file.topic, id: `${file.topic}:${e.id ?? slug(e.pt)}` })),
    };
  })
  .sort((a, b) => a.order - b.order);
export const vocabulary: VocabEntry[] = vocabTopics.flatMap((t) => t.entries);

export const grammarById = new Map(grammarTopics.map((g) => [g.id, g]));
export const lessonById = new Map(lessons.map((l) => [l.id, l]));
export const conversationById = new Map(conversations.map((c) => [c.id, c]));
export const vocabTopicById = new Map(vocabTopics.map((t) => [t.topic, t]));

export function getExercises(ids: string[]): Exercise[] {
  return ids.map((id) => {
    const e = exerciseById.get(id);
    if (!e) throw new Error(`Ejercicio no encontrado: ${id}`);
    return e;
  });
}

/** Nombre legible del "tema" al que se asocia un error. */
export function topicLabel(topic: string): string {
  const g = grammarById.get(topic);
  if (g) return g.title;
  const c = conversationById.get(topic);
  if (c) return `Conversación: ${c.title}`;
  if (topic === "vocab:ojo") return "Ojo con esta palabra";
  if (topic.startsWith("vocab:")) {
    const t = vocabTopicById.get(topic.slice(6));
    if (t) return `Vocabulario: ${t.title}`;
  }
  return topic;
}

export function topicHref(topic: string): string | undefined {
  if (grammarById.has(topic)) return `/gramatica/${topic}/`;
  if (conversationById.has(topic)) return `/conversacion/${topic}/`;
  if (topic === "vocab:ojo") return "/vocabulario/ojo/";
  if (topic.startsWith("vocab:")) return `/vocabulario/${topic.slice(6)}/`;
  return undefined;
}
