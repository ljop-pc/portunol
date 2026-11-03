import { describe, expect, it } from "vitest";
import { createLocalStore, emptyState, recordAttempt, setLessonStep, STORAGE_KEY } from "@/lib/progress/store";
import { masteryLevel, updateMastery } from "@/lib/srs/scheduler";

class MemoryStorage implements Storage {
  private m = new Map<string, string>();
  get length() {
    return this.m.size;
  }
  clear() {
    this.m.clear();
  }
  getItem(k: string) {
    return this.m.get(k) ?? null;
  }
  key(i: number) {
    return [...this.m.keys()][i] ?? null;
  }
  removeItem(k: string) {
    this.m.delete(k);
  }
  setItem(k: string, v: string) {
    this.m.set(k, v);
  }
}

describe("progreso", () => {
  it("registra intentos, errores y dominio", () => {
    let s = emptyState();
    s = recordAttempt(s, { exerciseId: "g4-03", topic: "ser-estar", skill: "produccion", correct: false, status: "close", category: "variante-br", answer: "x", elapsedMs: 5000 });
    s = recordAttempt(s, { exerciseId: "g4-03", topic: "ser-estar", skill: "produccion", correct: false, status: "close", category: "variante-br", answer: "x", elapsedMs: 999999 });
    expect(s.attempts).toHaveLength(2);
    expect(s.errors["variante-br|ser-estar"].count).toBe(2);
    expect(s.items["g4-03"].seen).toBe(2);
    expect(s.practiceMs).toBe(5000 + 120000); // el segundo se limita a 2 minutos
  });

  it("se guarda y se recupera tras «cerrar la app»", () => {
    const storage = new MemoryStorage();
    const a = createLocalStore(storage);
    a.update((s) => setLessonStep(s, "l1-apresentar-se", 3));
    a.update((s) => setLessonStep(s, "l1-apresentar-se", 9, true));
    const b = createLocalStore(storage); // nueva sesión
    expect(b.get().lessons["l1-apresentar-se"].status).toBe("completada");
    expect(JSON.parse(storage.getItem(STORAGE_KEY)!).schemaVersion).toBe(1);
  });

  it("reinicia el progreso", () => {
    const storage = new MemoryStorage();
    const a = createLocalStore(storage);
    a.update((s) => setLessonStep(s, "l1", 1));
    a.reset();
    expect(createLocalStore(storage).get().lessons).toEqual({});
  });

  it("rechaza importar un archivo que no es una copia válida", () => {
    const a = createLocalStore(new MemoryStorage());
    expect(() => a.importJson('{"foo":1}')).toThrow();
  });

  it("funciona sin almacenamiento disponible", () => {
    const a = createLocalStore(undefined);
    a.update((s) => setLessonStep(s, "l1", 1));
    expect(a.get().lessons.l1.step).toBe(1);
    expect(a.persistent).toBe(false);
  });
});

describe("repetición espaciada", () => {
  it("amplía el intervalo con aciertos y lo reinicia con errores", () => {
    const now = new Date("2026-01-01T10:00:00Z");
    let m = updateMastery(undefined, true, now);
    expect(m.intervalDays).toBe(1);
    m = updateMastery(m, true, now);
    expect(m.intervalDays).toBe(3);
    m = updateMastery(m, false, now);
    expect(m.intervalDays).toBe(0);
    expect(m.streak).toBe(0);
    expect(masteryLevel(m)).toBeGreaterThan(0);
  });
});
