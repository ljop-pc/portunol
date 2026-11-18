# Fase 2 · Aprendizaje adaptativo

> Estado: **implementada**. Criterio de aceptación de la especificación:
> *los errores anteriores influyen de forma comprobable en los repasos posteriores*.
> Lo comprueban `tests/unit/review.test.ts` (10 pruebas) y `tests/e2e/review.spec.ts`.

## Qué hace

| Pieza | Dónde | Qué hace |
|---|---|---|
| Repaso de hoy | `/repaso`, tarjeta en la portada | Sesión corta (máx. 12 elementos ≈ 6 min) con: refuerzo de puntos débiles → fallos recientes → pendientes por repetición espaciada → hasta 3 palabras nuevas. Sugerido, no obligatorio. |
| Patrones de error | `lib/review/patterns.ts` | ≥ 3 fallos en un tema de gramática en 21 días → **punto débil activo**. Se avisa en el momento («Punto débil detectado»). |
| Micro-explicación | `components/review/PatternTip.tsx` | Antes del repaso: qué está fallando (categoría), los 2 errores típicos del tema con su corrección y enlace a la ficha. |
| Ejemplos nuevos | `content/exercises/repaso.json` (36) | El refuerzo usa ejercicios del tema que el alumno no ha fallado, empezando por los nunca vistos. |
| Comprobar más adelante | `lib/review/patterns.ts` | El punto débil pasa a **superado** con 3 aciertos seguidos en el tema, al menos uno ≥ 20 h después de detectarlo (otra sesión). Si se vuelve a fallar, puede detectarse de nuevo. |
| Formato adaptado | `adaptiveVocabMode` en `lib/review/daily.ts` | Palabra nueva → reconocerla; fallada → elegirla en portugués; fallada varias veces o ya asentada → escribirla. |
| Niveles de dominio | `lib/review/mastery.ts` | nuevo → aprendiendo → consolidado → dominado, por elemento y por tema. Se ven en Mi progreso, Gramática y Vocabulario. |

## Datos

El progreso pasa a la versión 2 del esquema (`patterns`, `review`). La migración desde la v1
conserva todo lo anterior (probado en `tests/unit/progress.test.ts`).

## Parámetros (ajustables)

`PATTERN_MIN_FAILURES = 3`, `PATTERN_WINDOW_DAYS = 21`, `RESOLVE_STREAK = 3`,
`RESOLVE_DELAY_HOURS = 20`, `MAX_ITEMS = 12`. Están en `lib/review/` y no afectan a la interfaz.

## Fuera de alcance

Recordatorios/notificaciones (limitados en webs de iPhone; pospuestos por decisión del propietario).
