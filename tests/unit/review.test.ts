import { describe, expect, it } from "vitest";
import { emptyState, type AttemptInput, type ProgressState } from "@/lib/progress/store";
import { exerciseById, vocabulary } from "@/lib/content";
import {
  adaptiveVocabMode,
  materializeReview,
  markReviewDone,
  planDailyReview,
  registerAnswer,
} from "@/lib/review/daily";
import { PATTERN_MIN_FAILURES } from "@/lib/review/patterns";
import { itemLevel, levelCounts, overallLevel } from "@/lib/review/mastery";
import { updateMastery } from "@/lib/srs/scheduler";

const HOUR = 3600_000;
const at = (base: Date, hours: number) => new Date(base.getTime() + hours * HOUR);

function answer(state: ProgressState, exerciseId: string, correct: boolean, when: Date, category: AttemptInput["category"] = "gramatica") {
  const e = exerciseById.get(exerciseId)!;
  return registerAnswer(
    state,
    { exerciseId, topic: e.topic, skill: e.skill, correct, status: correct ? "correct" : "incorrect", category: correct ? undefined : category, answer: "x" },
    when,
  );
}

describe("Fase 2 · los errores influyen en los repasos", () => {
  const t0 = new Date("2026-11-20T10:00:00Z");

  it("sin práctica previa no hay repaso", () => {
    const plan = planDailyReview(emptyState(t0), t0);
    expect(plan.empty).toBe(true);
    expect(plan.items).toHaveLength(0);
  });

  it("un fallo aparece en el repaso, primero entre los fallos", () => {
    let s = emptyState(t0);
    s = answer(s, "g1-01", true, t0);
    s = answer(s, "g4-03", false, at(t0, 0.1), "variante-br");
    const plan = planDailyReview(s, at(t0, 1));
    expect(plan.items.find((i) => i.id === "g4-03")?.reason).toBe("fallo");
    // Lo acertado no se repasa todavía (no le toca hasta mañana).
    expect(plan.items.find((i) => i.id === "g1-01")).toBeUndefined();
  });

  it("tres fallos en ser/estar → patrón activo y ejercicios NUEVOS de refuerzo del tema", () => {
    let s = emptyState(t0);
    s = answer(s, "g4-01", false, t0);
    s = answer(s, "g4-02", false, at(t0, 0.1));
    expect(s.patterns["ser-estar"]).toBeUndefined();
    s = answer(s, "g4-03", false, at(t0, 0.2), "variante-br");
    expect(PATTERN_MIN_FAILURES).toBe(3);
    expect(s.patterns["ser-estar"].status).toBe("activo");

    const plan = planDailyReview(s, at(t0, 1));
    const reinforce = plan.items.filter((i) => i.reason === "refuerzo").map((i) => i.id);
    expect(reinforce.length).toBeGreaterThanOrEqual(2);
    // Son ejercicios del mismo tema, distintos de los fallados.
    for (const id of reinforce) {
      expect(exerciseById.get(id)!.topic).toBe("ser-estar");
      expect(["g4-01", "g4-02", "g4-03"]).not.toContain(id);
    }
    // Y los fallados también vuelven.
    expect(plan.items.filter((i) => i.reason === "fallo").map((i) => i.id)).toEqual(expect.arrayContaining(["g4-01", "g4-02", "g4-03"]));
    // El refuerzo va primero en la sesión.
    const session = materializeReview(plan, s);
    expect(session[0].reason).toBe("refuerzo");
  });

  it("el patrón solo se da por superado si se acierta MÁS ADELANTE, no justo después", () => {
    let s = emptyState(t0);
    for (const [i, id] of ["g4-01", "g4-02", "g4-03"].entries()) s = answer(s, id, false, at(t0, i * 0.1));
    // Aciertos inmediatos: todavía no cuenta como corregido.
    for (const [i, id] of ["r4-01", "r4-02", "r4-04"].entries()) s = answer(s, id, true, at(t0, 0.5 + i * 0.1));
    expect(s.patterns["ser-estar"].status).toBe("activo");
    // Al día siguiente, otra racha de aciertos → superado.
    for (const [i, id] of ["g4-01", "g4-02", "g4-03"].entries()) s = answer(s, id, true, at(t0, 24 + i * 0.1));
    expect(s.patterns["ser-estar"].status).toBe("superado");
    expect(planDailyReview(s, at(t0, 25)).items.some((i) => i.reason === "refuerzo")).toBe(false);
  });

  it("los temas que no son de gramática no generan patrón", () => {
    let s = emptyState(t0);
    for (let i = 0; i < 4; i++) s = answer(s, "c1-05", false, at(t0, i * 0.1));
    expect(Object.keys(s.patterns)).toHaveLength(0);
  });

  it("lo que toca por repetición espaciada aparece como pendiente", () => {
    let s = emptyState(t0);
    s = answer(s, "g2-01", true, t0); // intervalo: 1 día
    expect(planDailyReview(s, at(t0, 2)).items.find((i) => i.id === "g2-01")).toBeUndefined();
    expect(planDailyReview(s, at(t0, 25)).items.find((i) => i.id === "g2-01")?.reason).toBe("pendiente");
  });

  it("añade palabras nuevas cuando ya se ha empezado a practicar", () => {
    let s = emptyState(t0);
    s = answer(s, "g1-01", true, t0);
    const plan = planDailyReview(s, at(t0, 1));
    expect(plan.counts.nuevo).toBeGreaterThan(0);
    expect(plan.items.length).toBeLessThanOrEqual(12);
  });

  it("marca el repaso del día como completado", () => {
    const s = markReviewDone(emptyState(t0), t0);
    expect(s.review.sessions).toBe(1);
    expect(s.review.lastDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("Fase 2 · formato adaptado y dominio", () => {
  const v = vocabulary.find((x) => x.pt === "dezasseis")!;
  const now = new Date("2026-11-20T10:00:00Z");

  it("una palabra fallada varias veces se pide escrita; una nueva, solo reconocerla", () => {
    expect(adaptiveVocabMode(undefined, v)).toBe("pt2es");
    let m = updateMastery(undefined, false, now);
    expect(adaptiveVocabMode(m, v)).toBe("es2pt");
    m = updateMastery(m, false, now);
    expect(adaptiveVocabMode(m, v)).toBe("type");
  });

  it("calcula niveles: nuevo → aprendiendo → consolidado → dominado", () => {
    let m = updateMastery(undefined, true, now);
    expect(itemLevel(undefined)).toBe("nuevo");
    expect(itemLevel(m)).toBe("aprendiendo");
    m = updateMastery(m, true, now);
    expect(itemLevel(m)).toBe("consolidado");
    m = updateMastery(updateMastery(m, true, now), true, now);
    expect(itemLevel(m)).toBe("dominado");
    const c = levelCounts(["a", "b"], { a: m });
    expect(c).toEqual({ nuevo: 1, aprendiendo: 0, consolidado: 0, dominado: 1 });
    expect(overallLevel(c)).toBe("dominado");
  });
});
