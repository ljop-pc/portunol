import { defineConfig, devices } from "@playwright/test";

// Prueba de humo sobre la exportación estática (carpeta out/), con viewport de iPhone.
// Requiere `npm run build` antes. En este entorno solo hay Chromium; en un Mac se puede
// añadir un proyecto con WebKit (el motor de Safari).
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  use: { baseURL: "http://127.0.0.1:4173", trace: "retain-on-failure" },
  projects: [{ name: "iphone", use: { ...devices["iPhone 13"], browserName: "chromium" } }],
  webServer: {
    command: "python3 -m http.server 4173 --bind 127.0.0.1 --directory out",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
  },
});
