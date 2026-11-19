import { expect, test } from "@playwright/test";

/**
 * Simula la síntesis de voz de Safari en iOS (Chromium de pruebas no trae voces):
 * una voz pt-PT, y un cancel() asíncrono que descarta lo que se pida justo después,
 * como hace WebKit. Así se comprueba que el botón de audio realmente habla.
 */
test("el botón de audio reproduce los ejemplos con la voz pt-PT", async ({ page }) => {
  await page.addInitScript(() => {
    const spoken: { text: string; lang: string; voice?: string }[] = [];
    let cancelling = false;
    let speaking = false;
    const voice = { name: "Joana", lang: "pt-PT", voiceURI: "com.apple.voice.compact.pt-PT.Joana", localService: true, default: false };
    const synth = {
      get speaking() { return speaking; },
      pending: false,
      paused: false,
      getVoices: () => [voice, { ...voice, name: "Luciana", lang: "pt-BR", voiceURI: "luciana" }],
      addEventListener: () => {},
      cancel() {
        cancelling = true;
        setTimeout(() => (cancelling = false), 50);
        speaking = false;
      },
      resume() {},
      speak(u: SpeechSynthesisUtterance & { voice: typeof voice }) {
        if (cancelling) return; // comportamiento de WebKit: se pierde
        speaking = true;
        spoken.push({ text: u.text, lang: u.lang, voice: u.voice?.lang });
        setTimeout(() => u.onstart?.(new Event("start") as SpeechSynthesisEvent), 10);
        setTimeout(() => { speaking = false; u.onend?.(new Event("end") as SpeechSynthesisEvent); }, 60);
      },
    };
    Object.defineProperty(window, "speechSynthesis", { value: synth, configurable: true });
    (window as unknown as { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance = class {
      text: string; lang = ""; rate = 1; voice: unknown = null;
      onstart?: (e: Event) => void; onend?: (e: Event) => void; onerror?: (e: Event) => void;
      constructor(t: string) { this.text = t; }
    };
    (window as unknown as { __spoken: typeof spoken }).__spoken = spoken;
  });

  await page.goto("/gramatica/ser-estar/");
  const button = page.getByRole("button", { name: "Escuchar (voz sintética PT-PT)" }).first();
  await expect(button).toBeVisible();
  await button.click();
  await page.waitForTimeout(150);
  // Dos toques seguidos (el segundo cancela el primero): debe sonar igualmente.
  await page.getByRole("button", { name: "Escuchar (voz sintética PT-PT)" }).nth(1).click();
  await page.waitForTimeout(150);
  const spoken = await page.evaluate(() => (window as unknown as { __spoken: { text: string; lang: string; voice?: string }[] }).__spoken);
  expect(spoken[0]).toEqual({ text: "Sou espanhol, de Madrid.", lang: "pt-PT", voice: "pt-PT" });
  expect(spoken.length).toBe(2);
  await expect(page.getByText("No se ha podido reproducir")).toHaveCount(0);
});
