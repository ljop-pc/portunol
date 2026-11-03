# Português de Bolso

Aplicación web (PWA, pensada para iPhone) para que un hispanohablante aprenda a
**entender y hablar portugués europeo (PT-PT)**: gramática explicada desde el
español, vocabulario real, falsos amigos y conversaciones de la vida cotidiana.

> Estado: **Fase 1 (prototipo funcional)**. Ver [`docs/PLAN_FASE_1.md`](docs/PLAN_FASE_1.md)
> y la especificación completa en [`docs/ESPECIFICACION.md`](docs/ESPECIFICACION.md).

## Qué incluye la Fase 1

| Sección | Contenido |
|---|---|
| **Aprender** | 7 lecciones guiadas: objetivo → explicación → ejemplos → contraste con el español → ejercicios → resumen |
| **Gramática** | 7 fichas consultables libremente (conjugaciones, tablas, ejemplos, errores típicos, ejercicio corto) |
| **Vocabulario** | 421 palabras y expresiones en 12 temas, con ejemplo, notas y diferencias con Brasil; buscador; práctica generada que prioriza lo que fallas |
| **Ojo con esta palabra** | 27 falsos amigos y trampas (esquisito, apelido, propina, todavia…) con su test |
| **Conversación** | 3 escenarios completos (saludo, comida familiar, planes) con diálogo, alternativas, práctica guiada y reto final |
| **Mi progreso** | lecciones, competencias por separado, errores recurrentes, palabras a repasar, tiempo de práctica, ajustes, exportar/importar/reiniciar |

- **74 ejercicios redactados** de 7 tipos (comprensión, completar, construir la frase,
  traducción, detectar el error, diálogo, producción libre) + ejercicios de
  vocabulario generados automáticamente.
- **Corrección explicada**: acepta varias respuestas válidas, tolera tildes con aviso
  y reconoce errores previstos con su categoría (interferencia del español, forma de
  Brasil, gramática, vocabulario, registro, poco natural…).
- **Repetición espaciada básica** (`lib/srs`): cada acierto/fallo actualiza el dominio
  de cada elemento; las prácticas de vocabulario priorizan lo fallado.

### Lo que todavía NO hace (y la app lo dice)

- **Audio**: solo usa una voz sintética si el dispositivo tiene una voz `pt-PT`
  instalada. Nunca usa voces de Brasil. Si no la hay, lo indica. No hay grabaciones nativas.
- **Pronunciación**: no se evalúa.
- **Producción libre**: no se corrige automáticamente (autoevaluación con respuestas modelo).
- **Offline**: no hay service worker; necesita conexión para cargar.
- **Contenido lingüístico**: todo está marcado como *pendiente de revisión nativa*
  (ver [`docs/REVISION_LINGUISTICA.md`](docs/REVISION_LINGUISTICA.md)).

## Desarrollo

Requisitos: Node 22.

```bash
npm install
npm run dev          # http://localhost:3000
npm run check        # tipos + lint + tests unitarios + build
npm run build        # genera la web estática en out/
npm run test:e2e     # pruebas en viewport de iPhone (tras el build)
```

## Publicar en Cloudflare Pages

1. Cloudflare → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Elige el repositorio `portunol` y la rama a publicar.
3. Ajustes de build:
   - **Framework preset**: `None` (o Next.js *Static HTML Export*)
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - Variable de entorno (si hace falta): `NODE_VERSION = 22` (el repo incluye `.node-version`)
4. Abre la URL en Safari del iPhone → **Compartir** → **Añadir a pantalla de inicio**.

## Arquitectura

```
app/          rutas (Next.js App Router, exportación estática)
components/   ui/, exercises/, content/, audio/, screens/
content/      ⟵ TODO el contenido educativo en JSON (editable sin tocar código)
lib/content   esquemas Zod + carga/validación + generación de prácticas
lib/correction motor de corrección determinista
lib/progress  ProgressStore (localStorage, versionado, exportable)
lib/srs       repetición espaciada (separada de la UI)
lib/audio     capa de audio intercambiable (nativo → sintético pt-PT → sin audio)
tests/        unit (Vitest) y e2e (Playwright, iPhone)
```

### Añadir contenido

- **Vocabulario**: añade entradas en `content/vocabulary/<tema>.json`. Para un tema
  nuevo, crea el archivo y regístralo en `lib/content/index.ts`.
- **Ejercicios**: `content/exercises/*.json`. Cada ejercicio con respuesta escrita
  admite `accepted` (todas las respuestas válidas) y `expectedErrors` (errores
  previstos con `category` y `feedback`; `acceptable: true` si se da por buena con nota).
- **Gramática / lecciones / conversaciones**: `content/grammar.json`,
  `content/lessons.json`, `content/conversations/*.json`.
- `npm test` valida todo: estructura, ids únicos, referencias cruzadas, que cada
  respuesta aceptada se corrija como correcta y que ningún error previsto se acepte.

## Privacidad

- El progreso se guarda **solo en el dispositivo** (`localStorage`, clave `pdb:progress`).
- No hay cuentas, analítica ni llamadas a servicios externos.
- No se graba audio del usuario.
- Desde «Mi progreso» se puede exportar, importar y reiniciar el progreso.
