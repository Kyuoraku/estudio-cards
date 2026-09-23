# Especificaciones (SPECs) · Estudio Cards

Esta carpeta describe **todo el comportamiento actual** de la aplicación. Cada requisito tiene un ID estable (`STO-03`, `CARD-11`, …) y cada test lleva ese ID entre corchetes al inicio de su nombre, así que se puede rastrear en ambos sentidos:

```bash
grep -rn "CARD-11" specs src   # spec ↔ tests
```

## Índice

| Spec | Área | Prefijo |
|---|---|---|
| [01-persistencia.md](01-persistencia.md) | Modelo de datos y `localStorage` | `STO` |
| [02-estado-global.md](02-estado-global.md) | `AppProvider` / `useApp` | `CTX` |
| [03-navegacion-layout.md](03-navegacion-layout.md) | Rutas, header, modal, despliegue | `NAV` |
| [04-materias.md](04-materias.md) | Crear, listar, abrir y eliminar materias | `SUBJ` |
| [05-tarjetas.md](05-tarjetas.md) | Crear, validar, editar y eliminar tarjetas | `CARD` |
| [06-quiz.md](06-quiz.md) | Modo quiz | `QUIZ` |
| [07-importar-exportar.md](07-importar-exportar.md) | Backup JSON | `IO` |
| [08-defectos-conocidos.md](08-defectos-conocidos.md) | Defectos y deuda técnica | `BUG` |

## Tests

| Tipo | Ubicación | Qué cubre |
|---|---|---|
| Unitarios | `src/lib/*.test.js`, `src/context/*.test.jsx`, `src/components/*.test.jsx` | Cada módulo por separado, con `localStorage` real de jsdom y router en memoria |
| Integración | `src/test/integration/app.integration.test.jsx` | La `<App/>` completa (HashRouter, header, rutas, modales) haciendo flujos de punta a punta |
| Configuración | `src/test/deploy.test.js` | Base path, 404 y router para GitHub Pages |

Utilidades compartidas: `src/test/utils.jsx` (datos de ejemplo, `seedStorage`, `renderWithProviders`, ids deterministas). El setup (`src/test/setup.js`) limpia `localStorage`, el hash de la URL y los mocks entre tests.

```bash
npm run test:run       # una pasada
npm test               # modo watch
npm run test:coverage  # con cobertura y umbrales mínimos (90%)
```

Los tests corren en CI en cada push y PR (`.github/workflows/test.yml`), y el deploy a GitHub Pages no se hace si fallan (`deploy.yml`).

### Convenciones

- Nombre del test: `[ID] descripción del comportamiento`. Un test puede citar varios IDs.
- Comportamiento nuevo → primero la spec (con ID nuevo), después el test que la cita.
- Defectos conocidos → `it.fails('[BUG-xx] comportamiento esperado', …)`. Al corregir el defecto, cambiar a `it(...)` y mover el requisito a la spec correspondiente.

## Matriz de trazabilidad

| ID | Unitario | Integración |
|---|---|---|
| STO-01 … STO-09 | `lib/localStorage.test.js` | — |
| STO-10 | — | ✔ |
| CTX-01 … CTX-09 | `context/AppContext.test.jsx` | (indirecto en todos los flujos) |
| NAV-01, NAV-02, NAV-05 | — | ✔ |
| NAV-03, NAV-04 | `Header.test.jsx` | ✔ |
| NAV-06 | `Modal.test.jsx` | ✔ (modales de materia/tarjeta) |
| NAV-07 | `test/deploy.test.js` | — |
| SUBJ-01, SUBJ-02, SUBJ-03 | `AddSubjectForm.test.jsx`, `Header.test.jsx` | ✔ |
| SUBJ-04 | `SubjectGrid.test.jsx`, `SubjectCard.test.jsx` | ✔ |
| SUBJ-05 | `SubjectCard.test.jsx` | ✔ (NAV-05) |
| SUBJ-06 | `SubjectCard.test.jsx` | ✔ |
| SUBJ-07 | `Header.test.jsx` | ✔ |
| CARD-01 … CARD-16 | `CardList.test.jsx` | ✔ (CARD-01, 04, 09, 14, 15, 16) |
| QUIZ-01 | `Header.test.jsx` | ✔ |
| QUIZ-02 … QUIZ-09, QUIZ-11 | `QuizModal.test.jsx` | ✔ (QUIZ-02, 04, 07, 08, 09, 11) |
| QUIZ-10 | `Quiz.test.jsx`, `SubjectCard.test.jsx` | ✔ |
| IO-01 … IO-04 | `Header.test.jsx` | ✔ (export → import) |
| BUG-01, 02, 05, 06 | `it.fails` (ver [08](08-defectos-conocidos.md)) | BUG-02 |
