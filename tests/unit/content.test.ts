import { describe, expect, it } from "vitest";
import {
  conversations,
  exerciseById,
  exercises,
  falseFriends,
  grammarById,
  grammarTopics,
  lessons,
  vocabTopics,
  vocabulary,
} from "@/lib/content";
import { correct } from "@/lib/correction";

describe("contenido", () => {
  it("cumple los mínimos de la especificación", () => {
    expect(grammarTopics.length).toBeGreaterThanOrEqual(5);
    expect(lessons.length).toBeGreaterThanOrEqual(5);
    expect(vocabulary.length).toBeGreaterThanOrEqual(40);
    expect(falseFriends.length).toBeGreaterThanOrEqual(10);
    expect(conversations.length).toBeGreaterThanOrEqual(3);
    expect(exercises.length).toBeGreaterThanOrEqual(30);
    expect(new Set(exercises.map((e) => e.type)).size).toBeGreaterThanOrEqual(7);
  });

  it("no tiene ids duplicados", () => {
    const dup = (ids: string[]) => ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(dup(exercises.map((e) => e.id))).toEqual([]);
    expect(dup(vocabulary.map((v) => v.id))).toEqual([]);
    expect(dup(falseFriends.map((f) => f.id))).toEqual([]);
    expect(dup(vocabTopics.map((t) => t.topic))).toEqual([]);
  });

  it("todas las referencias cruzadas existen", () => {
    for (const g of grammarTopics) for (const id of g.exerciseIds) expect(exerciseById.has(id), `${g.id} → ${id}`).toBe(true);
    for (const l of lessons) {
      expect(grammarById.has(l.grammarId), l.id).toBe(true);
      for (const id of l.exerciseIds) expect(exerciseById.has(id), `${l.id} → ${id}`).toBe(true);
    }
    for (const c of conversations) {
      for (const id of [...c.guidedIds, ...c.challengeIds]) expect(exerciseById.has(id), `${c.id} → ${id}`).toBe(true);
      for (const id of c.grammarIds) expect(grammarById.has(id), `${c.id} → ${id}`).toBe(true);
    }
  });

  it("los temas de los ejercicios existen", () => {
    const topics = new Set([...grammarTopics.map((g) => g.id), ...conversations.map((c) => c.id)]);
    for (const e of exercises) expect(topics.has(e.topic), `${e.id}: ${e.topic}`).toBe(true);
  });

  it("las opciones correctas existen y las respuestas aceptadas se corrigen como correctas", () => {
    for (const e of exercises) {
      if (e.type === "choice") expect(e.answer, e.id).toBeLessThan(e.options.length);
      if ("accepted" in e) {
        for (const a of e.accepted) expect(correct(a, e.accepted, e.expectedErrors).status, `${e.id}: ${a}`).toBe("correct");
      }
    }
  });

  it("ningún error previsto coincide con una respuesta aceptada", () => {
    for (const e of exercises) {
      if (!("accepted" in e)) continue;
      for (const err of e.expectedErrors) {
        for (const a of err.answers) {
          const r = correct(a, e.accepted, e.expectedErrors);
          expect(r.status, `${e.id}: «${a}» no debería ser correcta`).not.toBe("correct");
        }
      }
    }
  });

  it("los ejercicios de ordenar pueden formar la respuesta con sus fichas", () => {
    for (const e of exercises) {
      if (e.type !== "build") continue;
      const words = e.accepted[0].split(" ");
      const pool = [...e.tokens];
      for (const w of words) {
        const i = pool.indexOf(w);
        expect(i, `${e.id}: falta la ficha «${w}»`).toBeGreaterThanOrEqual(0);
        pool.splice(i, 1);
      }
    }
  });

  it("los huecos solo aparecen una vez", () => {
    for (const e of exercises) if (e.type === "fill") expect(e.sentence.split("___").length, e.id).toBe(2);
  });
});
