# 02 · Estado global (AppProvider / useApp)

**Módulos:** `src/context/AppContext.jsx`, `src/context/context.js`, `src/hooks/useApp.js`
**Tests:** `src/context/AppContext.test.jsx`

`AppProvider` mantiene en memoria las materias y tarjetas, y sincroniza cada cambio con la capa de persistencia ([01](01-persistencia.md)). Los componentes acceden con el hook `useApp()`.

## API expuesta por `useApp()`

| Campo | Descripción |
|---|---|
| `subjects` | `Subject[]` actual |
| `cards` | `Card[]` actual (todas las materias) |
| `addSubject(subject)` | crea materia, devuelve la creada |
| `updateSubject(id, updates)` | actualiza materia |
| `deleteSubject(id)` | elimina materia (y sus tarjetas en storage) |
| `addCard(card)` | crea tarjeta, devuelve la creada |
| `updateCard(id, updates)` | actualiza tarjeta |
| `deleteCard(id)` | elimina tarjeta |
| `getSubjectCards(subjectId)` | tarjetas de una materia |

## Requisitos

### CTX-01 · Uso fuera del provider
`useApp()` fuera de un `AppProvider` lanza `Error('useApp debe ser usado dentro de un AppProvider')`.

### CTX-02 · Carga inicial
Al montarse, `AppProvider` lee materias y tarjetas de `localStorage` y luego renderiza a sus hijos. Con almacenamiento vacío expone listas vacías. (Durante el primer render muestra "Cargando...", que en la práctica no llega a verse.)

### CTX-03 · Crear materia
`addSubject` persiste la materia, la agrega a `subjects` y la devuelve.

### CTX-04 · Actualizar materia
`updateSubject` actualiza la materia en estado y almacenamiento sin tocar las demás. *(No se usa desde la UI actualmente.)*

### CTX-05 · Eliminar materia
`deleteSubject` elimina la materia y sus tarjetas tanto del estado (`subjects` y `cards`) como del almacenamiento. Las tarjetas de las demás materias no cambian, y las de la materia eliminada no quedan en memoria (no reaparecen, por ejemplo, si luego se crea otra materia con el mismo id).

### CTX-06 · Crear tarjeta
`addCard` persiste la tarjeta, la agrega al final de `cards` y la devuelve.

### CTX-07 · Actualizar tarjeta
`updateCard` reemplaza la tarjeta en estado y almacenamiento conservando el orden.

### CTX-08 · Eliminar tarjeta
`deleteCard` la quita del estado y del almacenamiento.

### CTX-09 · Tarjetas por materia
`getSubjectCards(id)` devuelve, en orden de creación, solo las tarjetas con `subject_id === id` (o `[]`), incluyendo las agregadas después del montaje.
