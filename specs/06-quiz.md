# 06 · Quiz (modo juego)

Hay dos puntos de entrada:

| Entrada | Componente | Estado |
|---|---|---|
| Botón ▶ del header dentro de una materia | `QuizModal.jsx` (modal a pantalla completa) | ✅ Funcional (QUIZ-01..09) |
| Botón **Quiz** de la tarjeta de materia → `/quiz/:id` | `Quiz.jsx` (página) | ✅ Funcional (QUIZ-10) |

**Tests:** `QuizModal.test.jsx`, `Quiz.test.jsx`, `Header.test.jsx`, `SubjectCard.test.jsx`, `src/test/integration/app.integration.test.jsx`

## Quiz en modal (`QuizModal`)

### QUIZ-01 · Iniciar
Dentro de una materia, ▶ (`aria-label="iniciar quiz"`) abre el quiz de esa materia.

### QUIZ-02 · Tarjetas del quiz
El quiz lee las tarjetas de la materia desde `localStorage` y las presenta **en orden de creación** (sin mezclar), una por vez: pregunta como encabezado y una opción por botón. Solo incluye tarjetas de esa materia. Si la materia no tiene tarjetas, no se abre nada. Al cambiar de materia se recargan las tarjetas y se reinicia el progreso.

### QUIZ-03 · Responder "Respuesta única"
Elegir una opción la resalta y reemplaza la anterior. **Enviar** está deshabilitado hasta elegir una.

### QUIZ-04 · Resultado
Al pulsar **Enviar**:
- cada opción muestra "Verdadero" (correcta) o "Falso" (incorrecta);
- el botón pasa a **Siguiente**, en verde si la respuesta es correcta y en rojo si no.

### QUIZ-05 · Bloqueo tras enviar
Después de enviar, las opciones quedan deshabilitadas y la selección no puede cambiarse.

### QUIZ-06 · Responder "Respuesta múltiple"
Las opciones se marcan/desmarcan de forma independiente. **Enviar** está habilitado siempre (incluso sin selección).

### QUIZ-07 · Evaluación "Respuesta múltiple"
Es correcta solo si se eligieron **exactamente** todas las opciones correctas (ni una de menos ni una de más). Una selección vacía es incorrecta.

### QUIZ-08 · Avanzar y terminar
**Siguiente** pasa a la próxima tarjeta con la selección y el resultado reiniciados. En la última tarjeta, cierra el quiz.

### QUIZ-09 · Salir
El botón ✕ cierra el quiz en cualquier momento.

## Página de quiz (`/quiz/:id`)

### QUIZ-10 · Página de quiz
- El botón **Quiz** de una materia en la grilla navega a `/quiz/:id` (sin abrir la materia).
- Sin tarjetas: "No hay tarjetas para hacer el quiz." y **← Volver** → `/subject/:id`.
- Con tarjetas: muestra **← Volver** → `/subject/:id` y, al entrar, una tarjeta de la materia **elegida al azar**: la pregunta como encabezado y una opción por botón. Si la materia pasa de no tener tarjetas a tenerlas, o se cambia de materia sin salir de la página, se elige una tarjeta nueva.
- Elegir una opción responde de inmediato (sin botón Enviar): la opción correcta se pinta en verde; si la elegida es incorrecta, se pinta en rojo. Todas las opciones quedan deshabilitadas.
- Tras responder aparece **Siguiente pregunta**, que elige otra tarjeta al azar (puede repetirse) con la respuesta reiniciada. El quiz no termina: se sale con **← Volver**.
