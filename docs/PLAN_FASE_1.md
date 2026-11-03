# Português de Bolso — Propuesta de arquitectura y plan de la Fase 1

> Estado: **propuesta pendiente de validación**. No se ha escrito código de
> aplicación todavía. La especificación completa está en
> [`ESPECIFICACION.md`](./ESPECIFICACION.md).

---

## 0. Estado del repositorio (inspección)

- Rama de trabajo: `claude/new-session-jc3szd`.
- Contenido: solo `README.md` (1 línea) y un commit inicial. **Proyecto vacío.**
- Entorno disponible: Node 22, npm 10. Versiones estables publicadas hoy:
  Next.js 16.4, React 19.3, Tailwind CSS 4.3.
- No se sobrescribe nada existente: el `README.md` se ampliará, no se borrará.

---

## 1. Decisiones técnicas

| Área | Decisión | Por qué | Alternativa descartada |
|---|---|---|---|
| Framework | **Next.js 16 (App Router) + TypeScript** | Lo sugiere la especificación y, sobre todo, la Fase 4 (tutor IA) necesitará un backend seguro: Next ofrece *route handlers* sin cambiar de stack. | Vite + React: más ligero hoy, pero obligaría a añadir un backend aparte en la Fase 4. |
| Despliegue Fase 1 | **Exportación estática** (`output: 'export'`) | Sin servidor ni costes. **Alojamiento elegido: Cloudflare Pages** (el propietario ya tiene cuenta; plan gratuito, admite repositorio privado y uso comercial). Cuando llegue la IA (Fase 4), las llamadas irán a un Cloudflare Worker con la clave guardada como secreto, nunca en el frontend. | SSR desde el día 1: complejidad sin beneficio. |
| Estilos | **Tailwind CSS 4** | Rápido, sin hoja de estilos que mantener, tokens de color claros (modo claro/oscuro). | Biblioteca de componentes completa (MUI, Chakra): peso innecesario. |
| Componentes | Propios, accesibles, mínimos (botón, tarjeta, barra inferior, hoja de feedback) | Pocas piezas; evitar dependencias. | shadcn/Radix: se puede añadir más tarde si hace falta un diálogo complejo. |
| Estado / persistencia | **`localStorage` detrás de una interfaz `ProgressStore`** con esquema versionado y migraciones | Cumple "guardar y recuperar progreso" sin cuentas. La interfaz permite cambiar a sincronización en la nube sin tocar la UI. | IndexedDB: más potente pero innecesario para el volumen de la Fase 1. |
| Contenido | **Archivos JSON en `content/`** validados con **Zod** | Ampliable sin tocar lógica; un revisor nativo puede editar JSON. Zod detecta errores de estructura en los tests y en el *build*. | Contenido en TS: tipado, pero menos editable por no programadores. |
| Corrección | Motor propio y determinista (`lib/correction`) | Sin IA en Fase 1, la corrección honesta es: respuestas válidas múltiples + **errores previstos** redactados a mano con su categoría y explicación. | Comparación literal de cadenas: no cumple "aceptar varias respuestas". |
| Audio | Interfaz `AudioService` con proveedores intercambiables | La especificación exige no reproducir nunca PT-BR. Ver §6. | Llamar a `speechSynthesis` directamente desde los componentes. |
| Tests | **Vitest** (lógica + validación de contenido) y **Playwright** con viewport de iPhone (prueba de humo) | Comprobar el criterio de aceptación: completar sesión → recargar → progreso recuperado. | — |

**Dependencias de ejecución previstas:** `next`, `react`, `react-dom`, `zod`.
Todo lo demás es de desarrollo (TypeScript, Tailwind, ESLint, Vitest, Playwright).

---

## 2. Estructura de carpetas

```
portunol/
├── app/                         # Rutas (App Router)
│   ├── layout.tsx               # <html lang="es">, barra inferior, safe-areas iOS
│   ├── page.tsx                 # Aprender (inicio): "continuar" + ruta de lecciones
│   ├── aprender/[leccion]/      # Lección guiada: objetivo → explicación → ejercicios → resumen
│   ├── gramatica/               # Biblioteca + ficha /gramatica/[tema]
│   ├── vocabulario/             # Temas + "Ojo con esta palabra" + /vocabulario/[tema]
│   ├── conversacion/            # Escenarios + /conversacion/[escenario]
│   ├── progreso/                # Mi progreso + reiniciar + "qué datos se guardan"
│   └── manifest.ts              # Manifest PWA
├── components/
│   ├── ui/                      # Button, Card, BottomNav, Badge, Sheet
│   ├── exercises/               # Un componente por tipo + ExerciseRunner + FeedbackPanel
│   ├── content/                 # PtText (texto PT con traducción), RegisterTag, ReviewFlag
│   └── audio/                   # AudioButton (muestra el estado real del audio)
├── content/                     # ⟵ CONTENIDO EDUCATIVO (JSON), separado de la UI
│   ├── grammar/*.json
│   ├── lessons/*.json
│   ├── vocabulary/*.json
│   ├── false-friends.json
│   ├── conversations/*.json
│   └── exercises/*.json
├── lib/
│   ├── content/                 # Esquemas Zod + cargadores tipados
│   ├── correction/              # normalizar, comparar, diagnosticar errores
│   ├── progress/                # ProgressStore (interfaz) + LocalStorageStore + migraciones
│   ├── srs/                     # Repetición espaciada (Fase 2, interfaz ya preparada)
│   └── audio/                   # AudioService + proveedores
├── public/icons/                # Iconos PWA y apple-touch-icon
├── tests/                       # Vitest (unitarios, contenido) + e2e Playwright
└── docs/                        # Especificación, este plan, decisiones, guía de contenido
```

---

## 3. Navegación

Barra inferior fija con 5 pestañas (iconos + texto, zona táctil ≥ 44 pt,
respetando `env(safe-area-inset-bottom)` del iPhone):

```
[ Aprender ] [ Gramática ] [ Vocabulario ] [ Conversación ] [ Progreso ]
```

- **Aprender** (inicio): tarjeta "Continuar donde lo dejaste" + ruta de lecciones
  por unidad. Una lección = objetivo → explicación breve → ejemplos → ejercicios
  → resumen. Duración objetivo: 5–10 min.
- **Gramática**: biblioteca consultable libremente. Las unidades se marcan como
  "recomendada / ya estudiada", pero **nunca se bloquea la consulta**.
- **Vocabulario**: temas + sección destacada **«Ojo con esta palabra»**.
- **Conversación**: escenarios. Modos: *Leer diálogo* → *Práctica guiada* →
  *Reto* (sin ver la solución).
- **Mi progreso**: competencias separadas, errores recurrentes, botón
  "Reiniciar progreso" con confirmación y explicación de qué se guarda.

Dentro de un ejercicio la barra inferior se oculta para no distraer; se sale
con "Cerrar" (el avance parcial se guarda).

---

## 4. Modelo de datos

### 4.1 Contenido (JSON, de solo lectura)

```ts
type Register = "informal" | "neutro" | "formal";
type Review   = "pendiente-nativo" | "revisado";   // control lingüístico

interface Example { pt: string; es: string; register?: Register; note?: string }

interface GrammarTopic {
  id: string; order: number; unit: number; title: string;
  rule: string;                 // explicación en español
  pattern?: string;             // p. ej. "estar a + infinitivo"
  conjugation?: { verb: string; forms: Record<"eu"|"tu"|"ele"|"nos"|"eles", string> }[];
  examples: Example[];
  contrastEs: string;           // comparación con el español
  commonErrors: { wrong: string; right: string; why: string }[];
  exerciseIds: string[];
  review: Review;
}

interface VocabEntry {
  id: string; pt: string; es: string; topic: string;
  pos: "sustantivo" | "verbo" | "adjetivo" | "adverbio" | "expresión" | …;
  gender?: "m" | "f";
  example: Example; note?: string;
  difficulty: 1 | 2 | 3;
  falseFriend?: { looksLike: string; actually: string; warning: string };
  ptBrDiffers?: string;         // p. ej. "PT-BR: café da manhã"
  audio?: AudioRef; review: Review;
}

interface Conversation {
  id: string; title: string; context: string; goal: string;
  turns: { speaker: string; pt: string; es: string; alternatives?: string[] }[];
  vocabIds: string[]; grammarIds: string[];
  guided: ExerciseId[];         // práctica guiada
  challenge: ExerciseId[];      // reto final
  review: Review;
}

type Exercise =
  | { type: "comprehension"; prompt: string; options: string[]; answer: number; … }
  | { type: "build";         tokens: string[]; accepted: string[][]; … }
  | { type: "fill";          sentence: string /* con ___ */; accepted: string[]; … }
  | { type: "translate";     es: string; accepted: string[]; … }
  | { type: "dialogue";      context: Turn[]; accepted: string[]; … }
  | { type: "fix-error";     wrong: string; accepted: string[]; … }
  | { type: "free";          prompt: string; modelAnswers: string[]; … };  // autoevaluación
// Común a todos: id, skill, grammarIds/vocabIds, explanation,
// expectedErrors: { match: string; category: ErrorCategory; feedback: string }[]

type ErrorCategory =
  | "gramatica" | "vocabulario" | "interferencia-es"
  | "poco-natural" | "registro" | "ortografia";
```

`expectedErrors` es la pieza clave: por ejemplo, en un ejercicio sobre
"Estou a trabalhar", la respuesta `estou trabalhando` se acepta como
**comprensible pero propia de PT-BR** (categoría `registro`/variante) y se
explica la forma europea, en lugar de marcarla simplemente como "mal".

### 4.2 Progreso del alumno (`localStorage`, clave `pdb:v1`)

```ts
interface ProgressState {
  schemaVersion: 1;
  createdAt: string;
  lessons:  Record<LessonId, { status: "en-curso" | "completada"; step: number; completedAt?: string }>;
  attempts: Attempt[];          // historial acotado (p. ej. últimos 2 000)
  items:    Record<ItemId, ItemMastery>;   // vocab, gramática o ejercicio
  errors:   Record<ErrorKey, { category: ErrorCategory; relatedId: string; count: number; lastAt: string }>;
  practiceMs: number;           // solo tiempo con la app visible y activa
  settings: { audioRate: number; showTranslations: "siempre" | "al-tocar" };
}

interface Attempt { exerciseId: string; at: string; correct: boolean; answer: string; category?: ErrorCategory }

interface ItemMastery {         // ya registrado en Fase 1, usado por el SRS en Fase 2
  seen: number; correct: number; streak: number;
  ease: number; intervalDays: number; dueAt?: string;
}
```

Competencias que muestra *Mi progreso* (calculadas, no guardadas):
comprensión, vocabulario, gramática, producción. **Pronunciación aparece como
"no evaluada"** hasta que exista reconocimiento de voz real.

---

## 5. Motor de corrección (Fase 1, sin IA)

1. **Normalización**: minúsculas, espacios, puntuación final y comillas.
2. **Comparación** con todas las respuestas aceptadas.
3. **Tolerancia a tildes**: si solo falla un acento (`é`/`e`, `ã`/`a`, `ç`/`c`),
   se acepta con aviso de ortografía (en un iPhone es fácil equivocarse).
4. **Errores previstos**: si la respuesta coincide con un error redactado,
   se muestra su categoría y su explicación específica.
5. **Resto de casos**: "No coincide con las respuestas previstas" + respuesta del
   alumno + versión natural + explicación general. Sin fingir un diagnóstico
   que no existe.
6. **Producción libre**: la Fase 1 muestra respuestas modelo y el alumno se
   autoevalúa ("lo dije bien / parecido / no"). Se indica expresamente que no
   hay corrección automática hasta el tutor IA (Fase 4).

---

## 6. Audio: honestidad ante todo

- `AudioService.play(ref)` → proveedores en orden: **grabación nativa** (archivo,
  fase futura) → **voz sintética PT-PT** (Web Speech, solo si existe una voz cuyo
  `lang` sea exactamente `pt-PT`) → **sin audio**.
- Nunca se usa una voz `pt-BR` ni `pt` genérica como sustituto.
- Cada botón indica el origen: 🎙 *Nativo* · 🤖 *Sintético PT-PT* · *Sin audio*.
- Riesgo conocido: en iOS la lista de voces llega de forma asíncrona y la voz
  PT-PT ("Joana") puede no estar instalada. Se detectará en el propio
  dispositivo y se informará al usuario de cómo instalarla en Ajustes.
- En la Fase 1 se incluye esta capa mínima (es barata y útil); los controles de
  velocidad y los diálogos completos con audio son la Fase 3.

---

## 7. Contenido inicial de la Fase 1

| Requisito | Plan |
|---|---|
| ≥ 5 lecciones de gramática | 1) Pronombres y tratamiento (`tu`/`você`/`o senhor`) · 2) Género, número y artículos · 3) Ser y estar (+ `estar a` + infinitivo) · 4) Presente regular `-ar/-er/-ir` · 5) Contracciones `de/em/a/por` + artículo |
| ≥ 40 vocabulario | ~50 entradas: familia, casa, comida y cocina, rutinas, conversación social. Incluye pares PT-PT/PT-BR útiles (`pequeno-almoço`, `autocarro`, `comboio`, `casa de banho`, `telemóvel`…) |
| ≥ 10 falsos amigos | ~14: `esquisito`, `polvo`, `apelido`, `borracha`, `rato`, `propina`, `presunto`, `salsa`, `largo`, `copo`, `oficina`, `ligar`, `embaraçada`, `cena` |
| ≥ 3 conversaciones | 1) Saludar y preguntar cómo está alguien · 2) Comida familiar ("o que é o almoço?") · 3) Planes para el fin de semana |
| ≥ 30 ejercicios | ~40, de 7 tipos (todos salvo *repetición*, que depende del audio) |

**Control lingüístico:** todo el contenido nace con `review: "pendiente-nativo"`
y la interfaz lo muestra con una etiqueta discreta. Se documentarán en
`docs/REVISION_LINGUISTICA.md` las dudas concretas (registro de `você`,
colocación de pronombres, expresiones regionales) para que un hablante nativo
las valide. Cuando algo sea dudoso, no se presentará como certeza.

---

## 8. Plan de implementación de la Fase 1 (orden)

1. **Base**: Next 16 + TS + Tailwind 4, exportación estática, ESLint, Vitest.
2. **PWA**: manifest, iconos, `apple-touch-icon`, `viewport-fit=cover`,
   modo standalone. *Sin service worker*: no se promete funcionamiento offline.
3. **Contenido**: esquemas Zod + cargadores + test que valida todos los JSON
   (ids únicos, referencias cruzadas existentes, respuestas no vacías).
4. **Progreso**: `ProgressStore` + `localStorage` + migraciones + reinicio.
5. **Ejercicios**: `ExerciseRunner`, los 7 componentes, panel de feedback.
6. **Pantallas**: las 5 secciones + flujo de lección completo.
7. **Contenido real** (§7) y documento de revisión lingüística.
8. **Verificación**: `typecheck`, `lint`, tests, *build*, y prueba Playwright
   en viewport iPhone (completar lección → recargar → progreso intacto, sin
   errores de consola). Capturas de pantalla para revisión.
9. **Documentación**: README (cómo ejecutar, cómo añadir contenido, qué datos
   se guardan y dónde).

**Criterio de aceptación** (de la especificación): completar una pequeña sesión
desde un iPhone, cerrar la app y recuperar el progreso.

---

## 9. Fases siguientes (sin implementar ahora)

- **Fase 2 – Adaptativo**: SRS tipo SM-2 simplificado sobre `ItemMastery`,
  sesión "Repaso de hoy", detección de patrones de error (p. ej. ser/estar)
  → micro-explicación + ejercicios nuevos + repaso programado.
- **Fase 3 – Audio**: grabaciones nativas o TTS con `pt-PT` explícito
  (Azure / Google / Polly vía Cloudflare Worker), velocidad lenta, diálogos.
- **Fase 4 – Tutor IA**: Cloudflare Worker (claves nunca en el
  frontend), conversación semiguiada con corrección por categorías.
- **Fase 5 – Consolidación**: accesibilidad, rendimiento, offline real con
  service worker probado.

---

## 10. Riesgos

| Riesgo | Mitigación |
|---|---|
| **Calidad lingüística**: no soy hablante nativo de PT-PT; hay riesgo de brasileñismos o de matices de registro incorrectos. | Etiqueta `pendiente-nativo` en todo; lista de dudas explícita; preferir frases simples y muy frecuentes. **Recomendado: revisión por un nativo antes de dar el contenido por bueno.** |
| Voz PT-PT ausente en el iPhone | Detección real + mensaje claro; nunca sustituir por PT-BR. |
| `localStorage` en Safari: iOS puede borrar datos de webs no usadas en ~7 días **si se usa en el navegador**; instalada en pantalla de inicio el riesgo es menor. | Recomendar instalar la PWA; exportar/importar progreso (JSON) como copia de seguridad sencilla. |
| Corrección limitada sin IA | Errores previstos redactados a mano + mensajes honestos; la IA llega en la Fase 4. |
| Exportación estática impide API | Asumido conscientemente; en la Fase 4 se añade un Cloudflare Worker para la API. |
| Teclado iOS (autocorrector en español) | `autocapitalize="off"`, `autocorrect="off"`, `spellcheck=false`, `lang="pt-PT"` en los campos de respuesta. |
