# 01 · Persistencia y modelo de datos

**Módulo:** `src/lib/localStorage.js`
**Tests:** `src/lib/localStorage.test.js`, `src/test/integration/app.integration.test.jsx`

La app no tiene backend: todos los datos viven en `localStorage` del navegador.

## Modelo de datos

| Clave de `localStorage`   | Contenido                    |
|---------------------------|------------------------------|
| `estudio-cards-subjects`  | `Subject[]` serializado JSON |
| `estudio-cards-cards`     | `Card[]` serializado JSON    |

```ts
type Subject = { id: string; name: string; color?: string }

type Card = {
  id: string
  subject_id: string          // id de la materia a la que pertenece
  question: string
  type: 'single' | 'multiple' // 'fill' tiene etiqueta pero no se puede crear desde la UI
  options: { title: string; isCorrect: boolean }[]
}
```

Los `id` se generan con `Date.now().toString()` (ver BUG-06).

## Requisitos

### STO-01 · Etiquetas de tipo de tarjeta
`getCardTypeLabel(type)` devuelve:
- `single` → "Respuesta única"
- `multiple` → "Respuesta múltiple"
- `fill` → "Completar palabras"
- cualquier otro valor → el mismo valor sin cambios.

### STO-02 · Leer materias
`getSubjects()` devuelve el array guardado en `estudio-cards-subjects`, o `[]` si la clave no existe.

### STO-03 · Crear materia
`addSubject({ name, color })`:
- genera `id = Date.now().toString()`;
- guarda solo `id`, `name` y `color` (descarta cualquier otro campo);
- agrega la materia **al final** de la lista existente y la persiste;
- devuelve la materia creada.

### STO-04 · Actualizar materia
`updateSubject(id, updates)` fusiona `updates` sobre la materia (`{...materia, ...updates}`), persiste y devuelve la materia actualizada. Si el `id` no existe devuelve `null` y **no escribe** en `localStorage`.

### STO-05 · Eliminar materia (en cascada)
`deleteSubject(id)` elimina la materia **y todas las tarjetas con `subject_id === id`**. Un `id` inexistente no altera los datos.

### STO-06 · Leer tarjetas
`getCards()` devuelve el array guardado en `estudio-cards-cards`, o `[]` si la clave no existe.

### STO-07 · Crear tarjeta
`addCard(card)` genera `id = Date.now().toString()`, conserva todos los campos recibidos, la agrega al final, persiste y devuelve la tarjeta creada.

### STO-08 · Actualizar tarjeta
`updateCard(id, updates)` fusiona, persiste y devuelve la tarjeta actualizada; `null` y sin escritura si no existe.

### STO-09 · Eliminar tarjeta
`deleteCard(id)` elimina solo la tarjeta indicada.

### STO-10 · Persistencia entre sesiones
Todo lo creado desde la UI (materias y tarjetas) sigue disponible al recargar la app.
