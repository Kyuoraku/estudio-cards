# 05 · Tarjetas (preguntas)

**Módulo:** `src/components/CardList.jsx` (incluye el formulario interno `AddCardForm`)
**Tests:** `src/components/CardList.test.jsx`, `src/test/integration/app.integration.test.jsx`

## Listado

### CARD-01 · Materia sin tarjetas
En `/subject/:id`, si la materia no tiene tarjetas propias (las de otras materias no cuentan): mensaje "No hay tarjetas en esta materia." y botón **Agregar tarjeta**. No se muestra tabla ni botón "← Volver".

### CARD-02 · Tabla de tarjetas
Con tarjetas, se muestra:
- botón **← Volver** y botón **Nueva tarjeta**;
- tabla (`aria-label="tabla de tarjetas"`) con columnas **Pregunta | Tipo | Opciones | Acciones**, una fila por tarjeta en orden de creación: pregunta, etiqueta del tipo (STO-01), cantidad de opciones, botones `edit` y `delete`.

### CARD-03 · Volver
**← Volver** navega a `/`.

## Crear tarjeta

### CARD-04 · Abrir formulario
**Nueva tarjeta** (o **Agregar tarjeta** en el estado vacío) abre el modal **"Agregar nueva tarjeta"** con: campo **Pregunta** vacío, selector **Tipo de pregunta** en "Respuesta única", sin opciones, y botones **Cancelar** / **Guardar**.

### CARD-05 · Gestionar opciones
- **Agregar opción** agrega un campo con placeholder `Opción N` (numerado según posición).
- El botón 🗑 de una opción la elimina; las restantes se renumeran conservando su texto.

### CARD-06 · Correcta en "Respuesta única"
El botón ✓ de una opción la marca como correcta y desmarca las demás (exclusivo). Volver a pulsarlo la mantiene marcada. El título del botón es "Opción marcada como correcta" / "Marcar como correcta".

### CARD-07 · Correctas en "Respuesta múltiple"
El botón ✓ alterna cada opción de forma independiente.

### CARD-08 · Cambio de tipo
Al pasar de "Respuesta múltiple" a "Respuesta única" con varias correctas, solo queda marcada la primera correcta.

### CARD-09 · Guardar
Al pulsar **Guardar** con datos válidos se guarda `{ subject_id, question, type, options }` con pregunta y opciones **recortadas** (`trim`), se cierra el modal y la tarjeta aparece en la tabla.

### CARD-10 · Múltiple sin correctas
Una tarjeta "Respuesta múltiple" puede guardarse sin ninguna opción correcta.

### CARD-11 · Validaciones
Si no se cumplen, se muestra un `Alert` de error y no se guarda (el modal sigue abierto). Se evalúan en este orden:

| Condición | Mensaje |
|---|---|
| Pregunta vacía/en blanco | La pregunta no puede estar vacía |
| Sin opciones | Debes agregar al menos una opción |
| Alguna opción vacía/en blanco | Todas las opciones deben tener texto |
| "Respuesta única" sin correcta | Debes seleccionar una opción correcta para preguntas de respuesta única |

Además, los campos Pregunta y Opción tienen `required`, por lo que el navegador bloquea el envío si están vacíos.

### CARD-12 · Limpiar error
El mensaje de error desaparece al escribir en un campo, marcar una correcta, borrar una opción o cambiar el tipo.

### CARD-13 · Cancelar
**Cancelar** o la X cierran el modal sin guardar.

## Editar tarjeta

### CARD-14 · Abrir edición
El botón `edit` **o** un clic en la fila abre el modal **"Editar tarjeta"** precargado (pregunta, tipo, opciones y correctas) con el botón **Guardar cambios**.

### CARD-15 · Guardar edición
**Guardar cambios** aplica las mismas validaciones (CARD-11) y actualiza la tarjeta conservando su `id`. Tras cerrar, **Nueva tarjeta** vuelve a abrir un formulario vacío.

## Eliminar tarjeta

### CARD-16 · Eliminar
El botón `delete` pide confirmación (`window.confirm('¿Estás seguro que deseas eliminar esta tarjeta?')`), no abre la edición, y si se acepta elimina la tarjeta. Al eliminar la última se vuelve al estado vacío (CARD-01).
