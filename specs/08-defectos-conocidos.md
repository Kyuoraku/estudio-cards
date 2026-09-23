# 08 · Defectos conocidos y deuda técnica

Comportamientos detectados durante el relevamiento que **no** coinciden con lo esperado. No se corrigieron en esta tarea (el objetivo fue documentar y proteger con tests lo que ya funciona).

Los defectos marcados con 🧪 tienen un test `it.fails(...)` que describe el comportamiento **esperado**. Hoy ese test “pasa porque falla”. Cuando alguien corrija el defecto, el test empezará a fallar en rojo con el mensaje *“Expect test to fail”*: en ese momento hay que cambiar `it.fails` por `it` para que el arreglo quede protegido.

## Defectos funcionales

| ID | Severidad | Descripción | Test |
|---|---|---|---|
| BUG-01 | Alta | **La página `/quiz/:id` nunca muestra preguntas.** `Quiz.jsx` solo elige una tarjeta al pulsar "Siguiente pregunta", que solo aparece después de responder; al entrar no hay tarjeta elegida, así que solo se ve "← Volver". Es el destino del botón **Quiz** de la grilla. | 🧪 `Quiz.test.jsx` |
| BUG-02 | Media | `QuizModal` lee las tarjetas de `localStorage` solo cuando cambia `subjectId`. Si se abre el quiz de una materia, se cierra, y luego se agregan, editan o borran tarjetas, al reabrirlo se usan los datos viejos. | 🧪 `app.integration.test.jsx` |
| BUG-03 | Media | Reabrir el quiz de la misma materia conserva el progreso anterior (tarjeta actual, selección y resultado). Si se terminó, reabre mostrando la última tarjeta ya respondida. | 🧪 `QuizModal.test.jsx` |
| BUG-04 | Baja | `QuizModal.propTypes.subjectId` está declarado como `number` requerido, pero la app pasa strings (o `null` antes de abrirlo) → warnings de PropTypes en la consola. | — |
| BUG-05 | Baja | `deleteSubject` del contexto borra las tarjetas de la materia en `localStorage` pero no del estado `cards` en memoria (quedan “huérfanas” hasta recargar). Hoy no es visible en la UI. | 🧪 `AppContext.test.jsx` |
| BUG-06 | Baja | Los ids se generan con `Date.now()`. Dos altas en el mismo milisegundo (p. ej. importaciones o automatizaciones) producen ids duplicados, y editar/borrar una afecta a la otra. | 🧪 `localStorage.test.js` |

## Inconsistencias menores de UX

- El estado vacío de la grilla dice *Haz clic en "Agregar nuevas materias"*, pero el botón se llama **Nueva Materia**.
- El estado vacío de una materia (CARD-01) no tiene botón "← Volver" (sí se puede volver con el título).
- El nombre de la materia se guarda sin recortar espacios (SUBJ-02), a diferencia de preguntas y opciones (CARD-09).
- "Respuesta múltiple" permite guardar tarjetas sin ninguna opción correcta (CARD-10); en el quiz la única respuesta correcta para esas tarjetas es no marcar nada.

## Deuda técnica

- **Código muerto:**
  - `src/components/QuizView.jsx`: vista de quiz con tarjetas mezcladas y feedback "¡Correcto!/Incorrecto", pero no está enrutada.
  - `src/components/SubjectList.jsx`: importa `../lib/supabase`, que no existe (rompería el build si se importara). La dependencia `@supabase/supabase-js` no se usa.
  - Ambos están excluidos del reporte de cobertura.
- `CardList.jsx` renderiza un `QuizModal` que nunca se abre y sin `subjectId` (genera un warning de PropTypes).
- `AppProvider` se monta dos veces (en `main.jsx` y en `App.jsx`); se usa el interno.
- `AddCardForm` se define dentro de `CardList`, así que cualquier re-render de `CardList` lo vuelve a montar y se pierde lo escrito en el formulario.
- `npm run lint` no funciona: `--ext` no está soportado con `eslint.config.js` (flat config).
- El README menciona carpetas `pages/` y `styles/` y el uso de Jest, que no existen en el proyecto.
