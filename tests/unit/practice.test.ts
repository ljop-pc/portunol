import { describe, expect, it } from "vitest";
import { vocabulary } from "@/lib/content";
import { vocabExercises } from "@/lib/content/practice";
import { correct } from "@/lib/correction";

describe("práctica de vocabulario", () => {
  it("marca la forma de Brasil como error previsto al escribir", () => {
    const v = vocabulary.find((x) => x.pt === "dezasseis")!;
    // Tercera posición (i % 3 === 2) genera un ejercicio de escritura.
    const ex = vocabExercises([v, v, v], vocabulary)[2];
    expect(ex.type).toBe("translate");
    if (ex.type !== "translate") return;
    expect(correct("dezasseis", ex.accepted, ex.expectedErrors).status).toBe("correct");
    const r = correct("dezesseis", ex.accepted, ex.expectedErrors);
    expect(r.category).toBe("variante-br");
    expect(r.isCorrect).toBe(false);
  });

  it("incluye números, horas y días de la semana", () => {
    const pts = vocabulary.map((v) => v.pt);
    for (const w of ["dois / duas", "dezanove", "segunda-feira", "Que horas são?"]) expect(pts).toContain(w);
  });
});
