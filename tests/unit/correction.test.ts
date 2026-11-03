import { describe, expect, it } from "vitest";
import { correct, normalize } from "@/lib/correction";

describe("normalize", () => {
  it("ignora mayúsculas, espacios y puntuación", () => {
    expect(normalize("  Não, obrigado. Já chega!  ")).toBe("não obrigado já chega");
  });
  it("conserva los guiones de los pronombres", () => {
    expect(normalize("Chamo-me Ana.")).toBe("chamo-me ana");
  });
  it("trata obrigado/obrigada como equivalentes", () => {
    expect(normalize("Obrigada")).toBe(normalize("obrigado"));
  });
});

describe("correct", () => {
  const accepted = ["Estou a trabalhar", "Eu estou a trabalhar"];
  const expected = [
    { answers: ["Estou trabalhando"], category: "variante-br" as const, feedback: "PT-BR", acceptable: false },
  ];

  it("acepta cualquier respuesta válida", () => {
    expect(correct("eu estou a trabalhar", accepted).status).toBe("correct");
    expect(correct("Estou a trabalhar!", accepted).isCorrect).toBe(true);
  });

  it("detecta errores previstos y los clasifica", () => {
    const r = correct("Estou trabalhando.", accepted, expected);
    expect(r.status).toBe("close");
    expect(r.isCorrect).toBe(false);
    expect(r.category).toBe("variante-br");
    expect(r.feedback).toBe("PT-BR");
  });

  it("acepta con aviso si solo fallan las tildes", () => {
    const r = correct("Eles tem", ["Eles têm"]);
    expect(r.status).toBe("accepted-with-note");
    expect(r.isCorrect).toBe(true);
    expect(r.category).toBe("ortografia");
  });

  it("acepta con aviso si falta el guion", () => {
    expect(correct("Chamo me Ana", ["Chamo-me Ana"]).status).toBe("accepted-with-note");
  });

  it("errores previstos aceptables cuentan como acierto", () => {
    const r = correct("Minha casa é pequena", ["A minha casa é pequena"], [
      { answers: ["Minha casa é pequena"], category: "poco-natural", feedback: "x", acceptable: true },
    ]);
    expect(r.status).toBe("accepted-with-note");
    expect(r.isCorrect).toBe(true);
  });

  it("no inventa diagnóstico si la respuesta es desconocida", () => {
    const r = correct("qualquer coisa", accepted, expected);
    expect(r.status).toBe("incorrect");
    expect(r.category).toBeUndefined();
  });

  it("respuesta vacía es incorrecta", () => {
    expect(correct("   ", accepted).status).toBe("incorrect");
  });
});
