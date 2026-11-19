# 04 · Materias

**Módulos:** `src/components/AddSubjectForm.jsx`, `src/components/SubjectGrid.jsx`, `src/components/SubjectCard.jsx`, `src/components/Header.jsx`
**Tests:** `AddSubjectForm.test.jsx`, `SubjectGrid.test.jsx`, `SubjectCard.test.jsx`, `Header.test.jsx`, `src/test/integration/app.integration.test.jsx`

## Casos de uso

### SUBJ-01 · Crear materia
1. En el inicio, el usuario pulsa **Nueva Materia** en el header.
2. Se abre el modal **"Agregar nueva materia"** con el campo **"Nombre de la materia"** (placeholder "Ej: Matemáticas", con foco).
3. Escribe un nombre y pulsa **Agregar materia** (o Enter).
4. La materia se guarda (sin color), el modal se cierra y aparece al final de la grilla.

### SUBJ-02 · Nombre vacío
Si el nombre está vacío o solo tiene espacios, no se crea nada y el modal permanece abierto. *(El nombre válido se guarda tal cual, sin recortar espacios.)*

### SUBJ-03 · Cancelar
**Cancelar** (o la X) cierra el modal sin crear la materia.

### SUBJ-04 · Listar materias
En `/`:
- sin materias: "No hay materias agregadas aún." y "Haz clic en "Agregar nuevas materias" para comenzar.";
- con materias: una tarjeta por materia, en orden de creación, con el nombre (encabezado `h3`), botón **Quiz** y botón eliminar (`aria-label="eliminar materia"`).

### SUBJ-05 · Abrir materia
Clic en la tarjeta de una materia → navega a `/subject/:id`.

### SUBJ-06 · Eliminar materia desde la grilla
1. Clic en 🗑 de la tarjeta (no navega).
2. Diálogo **"Eliminar materia"**: `¿Estás seguro que deseas eliminar la materia "<nombre>"? Esta acción no se puede deshacer.`
3. **Cancelar** cierra sin cambios; **Eliminar** borra la materia y todas sus tarjetas.

### SUBJ-07 · Eliminar materia desde el header
Dentro de una materia, 🗑 del header abre el mismo diálogo de confirmación. **Eliminar** borra la materia y sus tarjetas y navega a `/`. **Cancelar** no cambia nada y permanece en la materia.
