# Projeto: Português de Bolso

## Especificação funcional y prompt de construcción para Claude Code

> **Objetivo:** construir una aplicación móvil-first para que un
> hispanohablante aprenda a comprender y hablar portugués europeo
> (Portugal) con soltura en conversaciones cotidianas. La aplicación
> debe enseñar de forma explícita la gramática y el vocabulario, y
> después llevar al alumno a utilizarlos en situaciones reales.
>
> **Principio del producto:** no queremos clonar Duolingo. Queremos un
> profesor particular estructurado, práctico y paciente, que explique
> las diferencias entre español y portugués europeo y ayude a corregir
> errores concretos.

------------------------------------------------------------------------

# 1. Instrucciones para Claude Code

Actúa como ingeniero full-stack sénior, diseñador UX/UI móvil y
especialista en productos educativos digitales.

Antes de escribir código:

1.  Inspecciona el repositorio y averigua qué tecnologías y archivos
    existen.
2.  Si el proyecto está vacío, propone una arquitectura sencilla y
    mantenible para una **PWA mobile-first**, optimizada para iPhone y
    Safari.
3.  Presenta un plan breve de implementación, las decisiones técnicas y
    los posibles riesgos.
4.  No destruyas ni sobrescribas archivos existentes sin explicar antes
    por qué.
5.  Construye el producto por fases. Prioriza una primera versión
    funcional y coherente frente a una gran cantidad de funciones
    incompletas.
6.  No inventes contenido lingüístico. Si hay dudas sobre una expresión,
    su uso o su registro en Portugal, señálalas y evita presentarlas
    como certezas.
7.  Al terminar cada fase, ejecuta las comprobaciones disponibles,
    corrige errores y resume qué funciona y qué queda pendiente.

Si falta una decisión técnica no esencial, elige la opción más sencilla,
documenta la decisión y continúa. Pregunta únicamente cuando la decisión
afecte de forma importante al producto o requiera credenciales,
servicios de pago o una acción del propietario.

## Entrega inicial esperada

Primero entrega: - propuesta de arquitectura; - estructura de
carpetas; - diseño de navegación; - modelo de datos; - plan de fases.

Después de validar ese plan, implementa la primera versión. No te
limites a generar una maqueta estática: los botones, ejercicios,
navegación y guardado del progreso deben funcionar.

------------------------------------------------------------------------

# 2. Visión del producto

**Nombre provisional:** Português de Bolso.

**Usuario inicial:** adulto hispanohablante que parte de un nivel
principiante o básico y quiere desenvolverse hablando con personas de
Portugal, especialmente en contextos familiares, sociales y cotidianos.

**Variante lingüística obligatoria:** portugués europeo (PT-PT). No
utilizar portugués brasileño como modelo por defecto.

**Resultado deseado:** que el alumno pueda construir frases correctas,
entender respuestas habituales y mantener conversaciones cada vez más
naturales. No basta con reconocer palabras o traducir frases aisladas.

## Diferenciación respecto a aplicaciones convencionales

-   Explicaciones gramaticales breves, claras y explícitas antes de
    practicar.
-   Comparaciones entre español y portugués para aprovechar las
    similitudes y advertir de las diferencias.
-   Atención especial a falsos amigos, interferencias y errores típicos
    de hispanohablantes.
-   Frases completas y expresiones naturales, no vocabulario
    descontextualizado.
-   Conversaciones situacionales con respuestas posibles y variaciones.
-   Pronunciación y comprensión auditiva de portugués europeo.
-   Repaso adaptativo basado en errores y dificultad real.
-   Progresión transparente: el alumno debe entender qué está
    aprendiendo y por qué.

------------------------------------------------------------------------

# 3. Principios pedagógicos

1.  **Explicar antes de exigir:** introducir una estructura o regla de
    forma breve antes de pedir que el alumno la utilice.
2.  **De lo sencillo a lo complejo:** una dificultad nueva cada vez;
    combinar contenidos conocidos gradualmente.
3.  **Aprender produciendo:** incluir ejercicios en los que el alumno
    tenga que construir frases, no solo reconocer la respuesta correcta.
4.  **Contextualizar:** cada palabra o estructura debe aparecer en una
    situación verosímil.
5.  **Contrastar idiomas:** explicar cuándo el español ayuda y cuándo
    induce a error.
6.  **Corregir con explicación:** mostrar la respuesta del alumno, una
    versión natural y una explicación concreta del error.
7.  **Repetir con inteligencia:** recuperar contenidos después de un
    intervalo y priorizar aquello que el alumno falla.
8.  **Enseñar portugués real:** distinguir, cuando sea relevante, entre
    registro informal, neutro y formal.
9.  **No saturar:** sesiones breves, preferiblemente de 5 a 15 minutos.
10. **Medir competencia, no solo rachas:** valorar comprensión,
    vocabulario, gramática, producción y pronunciación por separado.

------------------------------------------------------------------------

# 4. Estructura principal de la aplicación

La navegación principal tendrá cinco secciones accesibles desde el
móvil:

## A. Aprender

Ruta guiada de lecciones ordenadas por nivel y tema.

Cada lección debe incluir: - objetivo de aprendizaje; - explicación
breve; - ejemplos en portugués europeo; - traducción al español; -
observaciones de uso; - ejercicios de aplicación; - resumen de lo
aprendido.

## B. Gramática

Biblioteca organizada progresivamente.

Temario inicial orientativo: 1. Pronombres personales y tratamiento. 2.
Género y número. 3. Artículos definidos e indefinidos. 4. Ser y estar.
5. Tener (`ter`) y haber (`haver`). 6. Presente de indicativo: verbos
regulares. 7. Verbos irregulares frecuentes. 8. Orden básico de la
frase. 9. Negación y preguntas. 10. Adjetivos y concordancia. 11.
Preposiciones frecuentes y contracciones (`do`, `da`, `no`, `na`, etc.).
12. Verbos reflexivos. 13. Futuro próximo y formas habituales de
expresar planes. 14. Pasado: introducción al pretérito perfecto simple.
15. Pronombres de complemento y colocación básica en portugués europeo.

No presentar todo el temario de golpe. Dividirlo en unidades y
desbloquearlo de forma progresiva, sin impedir que el usuario consulte
libremente una explicación.

Cada ficha gramatical tendrá: - regla explicada en español; - estructura
o patrón; - conjugación cuando corresponda; - ejemplos PT-PT; -
traducción; - comparación con el español; - errores frecuentes; -
ejercicio corto.

## C. Vocabulario

Vocabulario por temas y situaciones: - familia y relaciones; - casa y
vida doméstica; - comida, cocina y restaurantes; - salud y bienestar; -
tiempo y meteorología; - actividades y rutinas; - compras; - viajes y
desplazamientos; - emociones y opiniones; - conversación social.

Cada entrada incluirá: - palabra o expresión en portugués europeo; -
traducción al español; - categoría gramatical; - pronunciación o audio,
si está disponible; - ejemplo natural; - traducción del ejemplo; - nota
de uso cuando sea necesaria; - etiqueta de dificultad; - posibles falsos
amigos o contrastes con el español.

Crear una categoría especial **«Ojo con esta palabra»** para falsos
amigos y palabras que parecen equivalentes, pero no lo son.

No asumir que una palabra es idéntica en ambos idiomas solo porque se
parece. Explicar los matices de significado y uso.

## D. Conversación

El módulo más importante del producto.

Crear escenarios interactivos con turnos de conversación. El alumno debe
poder leer, escuchar y responder.

Primeros escenarios: 1. Saludar y preguntar cómo está alguien. 2.
Conversar con familiares. 3. Hablar de cómo ha ido el día. 4. Preguntar
qué hay para comer. 5. Participar en una comida familiar. 6. Hablar de
planes para el fin de semana. 7. Explicar gustos y preferencias. 8.
Hablar del tiempo. 9. Hacer preguntas y mantener una conversación. 10.
Despedirse de forma natural.

Cada escenario incluirá: - contexto; - objetivo comunicativo; - diálogo
modelo en PT-PT; - traducción; - expresiones alternativas; - vocabulario
relevante; - estructuras gramaticales utilizadas; - práctica guiada con
respuestas posibles; - reto final en el que el alumno responde sin ver
la solución.

Las conversaciones deben sonar naturales en Portugal. Evitar diálogos
artificiales o frases traducidas literalmente del español.

## E. Mi progreso

Mostrar de forma sencilla: - lecciones completadas; - temas
estudiados; - vocabulario aprendido; - palabras que necesitan repaso; -
errores gramaticales recurrentes; - resultados de comprensión y
producción; - tiempo de práctica, si se puede medir de forma fiable.

No utilizar las rachas o puntos como medida principal del aprendizaje.
Pueden existir elementos de motivación, pero nunca deben sustituir el
progreso lingüístico real.

------------------------------------------------------------------------

# 5. Sistema de ejercicios

Implementar inicialmente estos tipos:

1.  **Comprensión:** elegir el significado de una frase escuchada o
    leída.
2.  **Construcción:** ordenar palabras para formar una frase.
3.  **Completar:** introducir la palabra o forma verbal que falta.
4.  **Traducción contextual:** traducir una frase del español al
    portugués.
5.  **Producción libre:** escribir una respuesta propia.
6.  **Diálogo:** responder a una intervención dentro de una
    conversación.
7.  **Repetición:** escuchar una expresión y repetirla.
8.  **Detección de errores:** identificar y corregir una frase
    incorrecta.

La corrección debe distinguir entre: - error gramatical; - error de
vocabulario; - interferencia del español; - expresión comprensible pero
poco natural; - diferencia de registro.

Cuando haya varias respuestas válidas, aceptarlas y explicar las
diferencias. No imponer una única traducción literal.

------------------------------------------------------------------------

# 6. Pronunciación y audio

La pronunciación del portugués europeo es una parte esencial del
producto.

Requisitos: - priorizar voces PT-PT, no PT-BR; - permitir escuchar
palabras, frases y diálogos; - ofrecer controles de reproducir y
repetir; - mostrar el texto mientras se escucha; - permitir repetir una
frase a velocidad reducida cuando la tecnología lo permita; - separar
claramente audio auténtico, audio sintético y texto sin audio.

Antes de elegir una solución técnica, comprobar qué voces PT-PT están
realmente disponibles en los navegadores y dispositivos objetivo.

No asumir que `SpeechSynthesis` de Safari ofrece siempre una voz europea
de calidad. Crear una capa de audio intercambiable para poder incorporar
posteriormente archivos de hablantes nativos o un proveedor de TTS que
permita seleccionar explícitamente `pt-PT`.

Si no hay audio disponible para un contenido, indicarlo claramente.
Nunca reproducir silenciosamente una voz brasileña como sustituto.

La evaluación automática de pronunciación puede quedar fuera de la
primera versión. No afirmar que se evalúa la pronunciación si únicamente
se reproduce audio.

------------------------------------------------------------------------

# 7. Corrección inteligente y personalización

Diseñar el sistema para registrar los errores del alumno y adaptar los
repasos.

Cada error podrá asociarse a: - idioma de origen de la interferencia; -
categoría (gramática, vocabulario, orden de palabras, comprensión,
etc.); - contenido relacionado; - número de errores; - fecha del último
fallo; - nivel de dominio estimado.

Ejemplo: Si el alumno confunde repetidamente `ser` y `estar`, el sistema
debe: 1. detectar el patrón; 2. mostrar una explicación breve; 3.
proponer nuevos ejemplos; 4. programar un repaso; 5. comprobar más
adelante si el error se ha corregido.

Implementar una primera versión sencilla de repetición espaciada, con
intervalos ajustados según aciertos y errores. Mantener el algoritmo
separado de la interfaz para poder mejorarlo.

------------------------------------------------------------------------

# 8. Diseño UX/UI

## Prioridad: iPhone

La aplicación se utilizará principalmente desde un iPhone.

Diseño: - mobile-first; - interfaz limpia y moderna; - tipografía
legible; - botones cómodos para utilizar con una mano; - navegación
inferior sencilla; - sesiones sin pantallas innecesarias; - buen
contraste; - adaptación a distintos tamaños de pantalla; - estados de
carga, error y contenido vacío bien resueltos.

Evitar: - estética infantil; - exceso de animaciones; - puntos, monedas
y recompensas que distraigan; - pantallas recargadas; - ejercicios
repetitivos sin explicación.

La experiencia debe transmitir la sensación de una herramienta de
aprendizaje adulta, clara y cuidada.

## PWA

La primera versión debe ser una aplicación web progresiva: - instalable
desde Safari en iPhone mediante «Añadir a pantalla de inicio»; - icono y
nombre propios; - diseño adaptable; - funcionamiento estable; -
estructura preparada para añadir soporte offline progresivamente.

No prometer funcionamiento offline completo hasta que esté implementado
y probado.

------------------------------------------------------------------------

# 9. Arquitectura y tecnología

Propón una arquitectura moderna, sencilla y mantenible. Si el
repositorio está vacío, considera como punto de partida:

-   **Frontend:** Next.js con TypeScript.
-   **Estilos:** Tailwind CSS.
-   **Componentes:** biblioteca accesible y ligera, evitando
    dependencias innecesarias.
-   **PWA:** manifest, iconos y configuración de instalación.
-   **Persistencia inicial:** almacenamiento local para progreso y
    preferencias.
-   **Contenido educativo:** separado de los componentes de interfaz,
    preferiblemente en archivos de datos estructurados.
-   **Audio:** servicio desacoplado para permitir cambiar de proveedor.
-   **Backend:** posponerlo hasta que sea necesario para sincronización,
    cuentas o funciones de IA.

Antes de implementar, verifica la compatibilidad de las versiones
elegidas y explica cualquier alternativa que consideres mejor.

No incorporar una base de datos, autenticación o servicios de pago en la
primera versión si no son necesarios para validar el producto.

Preparar el código para que, en una fase posterior, sea posible
añadir: - sincronización entre dispositivos; - cuenta personal; - tutor
conversacional con IA; - reconocimiento de voz; - audio PT-PT de alta
calidad; - estadísticas de aprendizaje más avanzadas.

------------------------------------------------------------------------

# 10. Contenido inicial obligatorio

La primera versión no debe ser una carcasa vacía.

Incluir contenido real y revisable:

-   al menos 5 lecciones de gramática básica;
-   al menos 40 entradas de vocabulario;
-   al menos 10 falsos amigos o contrastes español-portugués;
-   al menos 3 conversaciones completas;
-   al menos 30 ejercicios variados;
-   ejemplos en portugués europeo con traducción al español.

El contenido debe estar organizado en archivos independientes para poder
ampliarlo sin modificar la lógica de la aplicación.

**Control lingüístico:** revisar especialmente las conjugaciones, las
contracciones, el orden de palabras, la colocación de pronombres y las
diferencias entre portugués europeo y brasileño. Marcar como pendiente
cualquier contenido que requiera validación de un hablante nativo.

------------------------------------------------------------------------

# 11. Privacidad y seguridad

-   No incluir claves API en el código del frontend.
-   No enviar datos personales a servicios externos sin necesidad.
-   Si se incorpora IA, realizar las llamadas desde un backend seguro.
-   Explicar qué datos se guardan y dónde.
-   Permitir reiniciar el progreso.
-   No recopilar audio del usuario sin informar y solicitar el permiso
    correspondiente.

------------------------------------------------------------------------

# 12. Plan de desarrollo por fases

## Fase 1: prototipo funcional

-   estructura de navegación;
-   diseño mobile-first;
-   pantalla de inicio;
-   módulos de gramática, vocabulario y conversación;
-   contenido inicial;
-   ejercicios interactivos;
-   guardado local del progreso.

**Criterio de aceptación:** poder completar una pequeña sesión de
aprendizaje desde un iPhone, cerrar la aplicación y recuperar el
progreso.

## Fase 2: aprendizaje adaptativo

-   registro de errores;
-   repaso espaciado;
-   indicadores de dominio;
-   ejercicios adaptados a las dificultades del alumno.

**Criterio de aceptación:** los errores anteriores influyen de forma
comprobable en los repasos posteriores.

## Fase 3: audio

-   audio PT-PT;
-   controles de reproducción;
-   diálogos con audio;
-   velocidad ajustable cuando sea posible.

**Criterio de aceptación:** el alumno puede escuchar expresiones y
diálogos con una voz identificada como portugués europeo.

## Fase 4: tutor conversacional

-   conversación libre o semiguiada;
-   corrección de errores;
-   explicaciones adaptadas a hispanohablantes;
-   selección de dificultad;
-   evaluación de progreso.

**Criterio de aceptación:** el tutor mantiene el contexto de la
conversación, corrige sin interrumpir constantemente y explica los
errores de forma útil.

## Fase 5: consolidación

-   pruebas en distintos iPhone;
-   accesibilidad;
-   rendimiento;
-   funcionamiento offline, si se decide incorporarlo;
-   preparación para publicación o distribución.

------------------------------------------------------------------------

# 13. Criterios generales de calidad

El proyecto se considerará una primera versión satisfactoria cuando:

1.  Se pueda utilizar cómodamente desde Safari en iPhone.
2.  La navegación principal funcione.
3.  Exista contenido educativo real, no solo ejemplos de relleno.
4.  Las explicaciones gramaticales sean comprensibles para un
    hispanohablante.
5.  Los ejercicios permitan responder y recibir correcciones.
6.  El progreso se guarde y se recupere.
7.  El contenido esté claramente identificado como PT-PT.
8.  No se presenten funciones simuladas como si fueran reales.
9.  No haya errores graves en la interfaz ni en la consola.
10. Exista documentación suficiente para continuar desarrollando el
    proyecto.

------------------------------------------------------------------------

# 14. Primera tarea para Claude Code

Empieza inspeccionando el repositorio.

Después, presenta una propuesta concreta de arquitectura y un plan de
implementación para la Fase 1. Si el repositorio está vacío, prepara la
estructura inicial del proyecto.

No intentes implementar todas las fases de una sola vez.

Prioriza una experiencia pequeña, funcional y bien terminada. El
objetivo es probar el método de aprendizaje con contenido auténtico
antes de añadir complejidad técnica.

**La pregunta que debe guiar todas las decisiones del proyecto es:**

> ¿Esta funcionalidad ayuda realmente a un hispanohablante a comprender,
> construir y utilizar frases naturales en portugués europeo?

Si la respuesta es no, probablemente no necesitamos esa funcionalidad.
