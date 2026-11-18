import { expect, test, type Page } from "@playwright/test";
import { exerciseById, lessons } from "../../lib/content";
import type { Exercise } from "../../lib/content/schema";

const SHOTS = process.env.SCREENSHOTS_DIR;
const shot = async (page: Page, name: string) => {
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/${name}.png` });
};

/** Responde lo que sea (sin conocer el ejercicio): sirve para recorrer un repaso generado. */
async function answerAnything(page: Page) {
  const fill = page.getByLabel("Palabra que falta");
  const text = page.getByLabel("Tu respuesta");
  const options = page.locator("ul li button");
  const tokens = page.locator("button.rounded-full.bg-surface");
  if (await fill.count()) {
    await fill.fill("x");
    await page.getByRole("button", { name: "Comprobar" }).click();
  } else if (await text.count()) {
    await text.fill("x");
    await page.getByRole("button", { name: "Comprobar" }).click();
  } else if ((await options.count()) > 0) {
    await options.first().click();
  } else {
    await tokens.first().click();
    await page.getByRole("button", { name: "Comprobar" }).click();
  }
}

async function answer(page: Page, e: Exercise, wrong?: string) {
  if (e.type === "choice") return page.getByRole("button", { name: e.options[e.answer], exact: true }).click();
  if (e.type === "fill") await page.getByLabel("Palabra que falta").fill(wrong ?? e.accepted[0]);
  else if (e.type === "build") {
    for (const w of e.accepted[0].split(" ")) await page.getByRole("button", { name: w, exact: true }).last().click();
  } else if (e.type !== "free") await page.getByLabel("Tu respuesta").fill(wrong ?? e.accepted[0]);
  await page.getByRole("button", { name: "Comprobar" }).click();
}

test("Fase 2: fallar ser/estar → punto débil → el repaso empieza por ese tema", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

  const lesson = lessons.find((l) => l.grammarId === "ser-estar")!;
  const wrong: Record<string, string> = { "g4-01": "estou", "g4-02": "sou", "g4-03": "Estou trabalhando" };

  await page.goto(`/aprender/${lesson.id}/`);
  await page.getByRole("button", { name: "Empezar" }).click();
  await page.getByRole("button", { name: "Siguiente" }).click();
  await page.getByRole("button", { name: "Siguiente" }).click();
  await page.getByRole("button", { name: "Practicar" }).click();
  for (const id of lesson.exerciseIds) {
    await answer(page, exerciseById.get(id)!, wrong[id]);
    if (id === "g4-03") {
      await expect(page.getByText("Punto débil detectado: Ser y estar")).toBeVisible();
      await shot(page, "f2-01-detectado");
    }
    await page.getByRole("button", { name: /Continuar|Ver resultado/ }).click();
  }
  await page.getByRole("button", { name: "Ver resumen de la lección" }).click();

  // La portada propone el repaso con el punto débil.
  await page.goto("/");
  const card = page.getByRole("link", { name: /Repaso de hoy/ });
  await expect(card).toContainText("Punto débil: Ser y estar");
  await shot(page, "f2-02-portada");
  await card.click();

  await expect(page.getByRole("heading", { name: "Repaso de hoy" })).toBeVisible();
  await expect(page.getByText("Refuerzo de un punto débil")).toBeVisible();
  await shot(page, "f2-03-plan");
  await page.getByRole("button", { name: "Empezar repaso" }).click();

  // Micro-explicación antes de practicar.
  await expect(page.getByRole("heading", { name: "Ser y estar (y «estar a + infinitivo»)" })).toBeVisible();
  await shot(page, "f2-04-explicacion");
  await page.getByRole("button", { name: "Entendido, a practicar" }).click();

  // El primer ejercicio es un refuerzo NUEVO de ser/estar (no uno de los fallados).
  const refuerzo = ["g4-04", "g4-05", "g4-06", "g4-07", "r4-01", "r4-02", "r4-03", "r4-04", "r4-05"].map((id) => exerciseById.get(id)!.instruction);
  const firstInstruction = (await page.locator("h2").first().textContent())!.trim();
  expect(refuerzo).toContain(firstInstruction);
  await shot(page, "f2-05-refuerzo");

  for (let i = 0; i < 15; i++) {
    if (await page.getByText("Sesión terminada").count()) break;
    await answerAnything(page);
    await page.getByRole("button", { name: /Continuar|Ver resultado/ }).click();
  }
  await page.getByRole("button", { name: "Terminar repaso" }).click();
  await expect(page.getByRole("heading", { name: "Repaso completado." })).toBeVisible();

  // Mi progreso muestra el punto débil y el dominio por tema.
  await page.goto("/progreso/");
  await expect(page.getByRole("link", { name: /Ser y estar.*en refuerzo/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Dominio por tema" })).toBeVisible();
  await page.getByRole("heading", { name: "Puntos débiles" }).scrollIntoViewIfNeeded();
  await shot(page, "f2-06-progreso");
  expect(errors).toEqual([]);
});
