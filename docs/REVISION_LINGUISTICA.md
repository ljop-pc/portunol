# Revisión lingüística pendiente

Todo el contenido se ha redactado con cuidado para el **portugués europeo (PT-PT)**,
pero no ha sido validado por un hablante nativo. Por eso todos los archivos llevan
`"review": "pendiente-nativo"` y la app muestra el aviso correspondiente.

Cuando un nativo revise un archivo o elemento, se puede cambiar a `"review": "revisado"`.

## Prioridad alta: puntos con matiz o duda

| # | Dónde | Duda |
|---|---|---|
| 1 | `grammar.json` → pronomes | Cuánto de distante o descortés resulta **«você»** según edad, región y situación. La explicación es prudente; conviene validarla. |
| 2 | `grammar.json` → ser-estar | Se menciona que el gerundio también se usa en el sur (Alentejo, Algarve). Confirmar la formulación. |
| 3 | `grammar.json` → contracoes | Preferencia de **«de Espanha / em Espanha»** sin artículo en el uso actual. |
| 4 | `conversations/c2` | Naturalidad de **«O que é o almoço?»** frente a «O que há para o almoço?». |
| 5 | `false-friends.json` → cena | Uso coloquial juvenil de **«cena»** = «cosa» («Que cena!»). |
| 6 | `false-friends.json` → contestar | Matiz exacto («rebatir, impugnar») en el uso cotidiano. |
| 7 | `vocabulary/comida.json` | **«imperial»** (Lisboa) / **«fino»** (Oporto) y **«bica»**: confirmar que la nota regional es correcta y actual. |
| 8 | `vocabulary/compras.json` → camisola | En PT-PT «camisola» ≈ jersey/sudadera; confirmar matiz frente a «t-shirt». |
| 9 | `exercises/*` | Revisar que las listas `accepted` no omitan respuestas naturales frecuentes (la app solo reconoce lo previsto). |

## Qué revisar en general

- Conjugaciones y tildes (têm/tem, avô/avó, às/as).
- Colocación de pronombres (ênclise: «chamo-me», «dói-me», «buscar-te»; próclise tras «como», «não»…).
- Contracciones (num, numa, à, às, pelo…).
- Que ningún ejemplo use una forma brasileña sin señalarlo.
- Registro: marcas `informal` / `formal` donde importan.
- Naturalidad de los diálogos (que no suenen a traducción del español).

## Cómo proponer cambios

Editar directamente el JSON en `content/` y ejecutar `npm test`: si una respuesta
aceptada deja de corregirse como correcta o un error previsto pasa a aceptarse, el
test falla y dice en qué ejercicio.
