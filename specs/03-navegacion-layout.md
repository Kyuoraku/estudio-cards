# 03 · Navegación, layout y despliegue

**Módulos:** `src/App.jsx`, `src/components/Header.jsx`, `src/components/Modal.jsx`, `vite.config.js`, `public/404.html`
**Tests:** `src/test/integration/app.integration.test.jsx`, `src/components/Header.test.jsx`, `src/components/Modal.test.jsx`, `src/test/deploy.test.js`

## Requisitos

### NAV-01 · Rutas
La app usa `HashRouter` (las URLs tienen la forma `…/estudio-cards/#/ruta`).

| Ruta | Vista |
|---|---|
| `/` | Grilla de materias ([04](04-materias.md)) |
| `/subject/:id` | Tarjetas de la materia ([05](05-tarjetas.md)) |
| `/quiz/:id` | Página de quiz ([06](06-quiz.md), QUIZ-10) |

### NAV-02 · Ruta desconocida
Cualquier otra ruta redirige (con `replace`) a `/`.

### NAV-03 · Header en el inicio
El header siempre muestra el título **"Estudio Cards"**, que al hacer clic navega a `/`.
Si la ruta actual no corresponde a una materia existente, muestra las acciones globales:
- **Nueva Materia** → abre el modal "Agregar nueva materia" (SUBJ-01);
- **Importar** (IO-02);
- **Exportar** (IO-01).

Un `id` de materia que no existe se trata igual que "sin materia".

### NAV-04 · Header dentro de una materia
En `/subject/:id` y `/quiz/:id` con una materia existente, el header muestra en lugar de las acciones globales:
- botón ▶ (`aria-label="iniciar quiz"`) + nombre de la materia (QUIZ-01);
- botón 🗑 (`aria-label="eliminar materia"`) (SUBJ-07).

### NAV-05 · Navegación entre vistas
Desde el inicio se entra a una materia haciendo clic en su tarjeta; se vuelve con "← Volver" o con el título del header.

### NAV-06 · Modal genérico
`Modal` es un diálogo con título, contenido y botón de cerrar (`aria-label="close"`). Cerrar con la X o con Escape invoca `onClose`. Cerrado no renderiza nada.

### NAV-07 · Despliegue en GitHub Pages
- `vite.config.js` publica bajo `base: '/estudio-cards/'` y compila en `dist/`.
- `public/404.html` se copia a `dist/` y redirige a `/estudio-cards/` (meta refresh + JS).
- El enrutamiento usa `HashRouter` (no `BrowserRouter`) para funcionar en hosting estático.
- El workflow `deploy.yml` corre los tests antes de compilar; si fallan, no se despliega.
