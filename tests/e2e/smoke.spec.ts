import { expect, test, type Page } from "@playwright/test";
import { conversations, exerciseById, grammarTopics, lessons, vocabTopics } from "../../lib/content";
import type { Exercise } from "../../lib/content/schema";

const SHOTS = process.env.SCREENSHOTS_DIR;

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

async function shot(page: Page, name: string) {
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: false });
}

/** Responde correctamente a un ejercicio (salvo que se pase `wrong`). */
async function answer(page: Page, e: Exercise, wrong?: string) {
  switch (e.type) {
    case "choice":
      await page.getByRole("button", { name: e.options[e.answer], exact: true }).click();
      return;
    case "fill":
      await page.getByLabel("Palabra que falta").fill(wrong ?? e.accepted[0]);
      break;
    case "build":
      for (const w of e.accepted[0].split(" ")) {
        await page.getByRole("button", { name: w, exact: true }).last().click();
      }
      break;
    case "translate":
    case "fix":
    case "dialogue":
      await page.getByLabel("Tu respuesta").fill(wrong ?? e.accepted[0]);
      break;
    case "free":
      await page.getByLabel("Tu respuesta").fill(e.modelAnswers[0]);
      await page.getByRole("button", { name: "Comprobar" }).click();
      await page.getByRole("button", { name: "Bien" }).click();
      return;
  }
  await page.getByRole("button", { name: "Comprobar" }).click();
}

test("criterio de aceptación: completar una lección, cerrar y recuperar el progreso", async ({ page, context }) => {
  const errors = collectErrors(page);
  await page.goto("/");
  await shot(page, "01-inicio");
  await page.getByRole("link", { name: /Empieza aquí/ }).click();
  await expect(page.getByRole("heading", { name: lessons[0].title })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Navegación principal" })).toHaveCount(0);

  await page.getByRole("button", { name: "Empezar" }).click();
  await shot(page, "02-explicacion");
  await page.getByRole("button", { name: "Siguiente" }).click();
  await page.getByRole("button", { name: "Siguiente" }).click();
  await page.getByRole("button", { name: "Practicar" }).click();

  for (const id of lessons[0].exerciseIds) {
    const e = exerciseById.get(id)!;
    if (id === "g1-04") {
      // Error típico: colocación brasileña del pronombre.
      await answer(page, e, "Me chamo Ana");
      await expect(page.getByText("Forma de Brasil, no de Portugal")).toBeVisible();
      await shot(page, "03-correccion");
    } else {
      await answer(page, e);
      await expect(page.locator("#feedback")).toContainText(/Correcto/);
    }
    await page.getByRole("button", { name: /Continuar|Ver resultado/ }).click();
  }
  await expect(page.getByText("Sesión terminada")).toBeVisible();
  await expect(page.getByText(`${lessons[0].exerciseIds.length - 1}/${lessons[0].exerciseIds.length}`)).toBeVisible();
  await page.getByRole("button", { name: "Ver resumen de la lección" }).click();
  await expect(page.getByRole("heading", { name: "Lección completada" })).toBeVisible();

  // "Cerrar la app": nueva pestaña en el mismo dispositivo.
  await page.close();
  const page2 = await context.newPage();
  const errors2 = collectErrors(page2);
  await page2.goto("/");
  await expect(page2.getByRole("link", { name: /Siguiente lección/ })).toContainText(lessons[1].title);
  await page2.getByRole("link", { name: "Progreso" }).click();
  await expect(page2.getByText(`1/${lessons.length}`)).toBeVisible();
  await expect(page2.getByText("Forma de Brasil, no de Portugal")).toBeVisible();
  await shot(page2, "04-progreso");

  expect(errors).toEqual([]);
  expect(errors2).toEqual([]);
});

test("conversación: práctica guiada y reto", async ({ page }) => {
  const errors = collectErrors(page);
  const c = conversations[1];
  await page.goto(`/conversacion/${c.id}/`);
  await expect(page.getByText(c.turns[0].pt)).toBeVisible();
  await shot(page, "05-conversacion");
  await page.getByRole("tab", { name: /Práctica/ }).click();
  await page.getByRole("button", { name: "Empezar práctica" }).click();
  for (const id of c.guidedIds) {
    await answer(page, exerciseById.get(id)!);
    await page.getByRole("button", { name: /Continuar|Ver resultado/ }).click();
  }
  await page.getByRole("button", { name: "Volver a la conversación" }).click();
  await page.getByRole("button", { name: "Aceptar el reto" }).click();
  for (const id of c.challengeIds) {
    await answer(page, exerciseById.get(id)!);
    if (id === c.challengeIds[0]) await shot(page, "06-reto");
    await page.getByRole("button", { name: /Continuar|Ver resultado/ }).click();
  }
  await page.getByRole("button", { name: "Volver a la conversación" }).click();
  await expect(page.getByRole("tab", { name: "Reto ✓" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("vocabulario: sesión generada y falsos amigos", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/vocabulario/");
  await page.getByLabel("Buscar vocabulario").fill("pequeno");
  await expect(page.getByText("o pequeno-almoço", { exact: true })).toBeVisible();
  await shot(page, "07-vocabulario");
  await page.goto(`/vocabulario/${vocabTopics[0].topic}/`);
  await page.getByRole("button", { name: /Practicar/ }).click();
  for (let i = 0; i < 10; i++) {
    const options = page.locator("ul li button");
    if (await options.count()) await options.first().click();
    else {
      await page.getByLabel("Tu respuesta").fill("não sei");
      await page.getByRole("button", { name: "Comprobar" }).click();
    }
    await page.getByRole("button", { name: /Continuar|Ver resultado/ }).click();
  }
  await expect(page.getByText("Sesión terminada")).toBeVisible();
  await page.goto("/vocabulario/ojo/");
  await expect(page.getByText("esquisito", { exact: true })).toBeVisible();
  await shot(page, "08-ojo");
  expect(errors).toEqual([]);
});

test("todas las páginas cargan sin errores ni scroll horizontal", async ({ page }) => {
  test.setTimeout(180_000); // ~35 páginas; contra la web publicada va por red
  const errors = collectErrors(page);
  const routes = [
    "/",
    "/gramatica/",
    "/vocabulario/",
    "/vocabulario/ojo/",
    "/conversacion/",
    "/progreso/",
    ...lessons.map((l) => `/aprender/${l.id}/`),
    ...grammarTopics.map((g) => `/gramatica/${g.id}/`),
    ...vocabTopics.map((t) => `/vocabulario/${t.topic}/`),
    ...conversations.map((c) => `/conversacion/${c.id}/`),
  ];
  for (const r of routes) {
    await page.goto(r);
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `scroll horizontal en ${r}`).toBeLessThanOrEqual(0);
  }
  await page.goto(`/gramatica/${grammarTopics[3].id}/`);
  await shot(page, "09-ficha-gramatica");
  expect(errors).toEqual([]);
});
