# 07 · Importar / Exportar

**Módulo:** `src/components/Header.jsx`
**Tests:** `src/components/Header.test.jsx`, `src/test/integration/app.integration.test.jsx`

Disponible en el header solo en el inicio (NAV-03).

## Formato del archivo de backup

```json
{
  "subjects": [ /* Subject[] */ ],
  "cards":    [ /* Card[] */ ]
}
```

## Requisitos

### IO-01 · Exportar
**Exportar** descarga `estudio-cards-backup.json` (`application/json`, JSON indentado a 2 espacios) con las materias actuales y **todas** las tarjetas guardadas en `localStorage`. El enlace temporal y la URL del blob se liberan tras la descarga. Con almacenamiento vacío exporta `{ "subjects": [], "cards": [] }`.

### IO-02 · Importar
**Importar** abre un selector de archivos que acepta solo `.json`. Si el archivo es JSON y tiene las propiedades `subjects` y `cards` (aunque estén vacías), **reemplaza** por completo los datos de `localStorage` y recarga la página. Cerrar el selector sin elegir archivo no hace nada. Un backup exportado (IO-01) puede importarse y restaura exactamente los mismos datos.

### IO-03 · Formato incorrecto
Si el JSON no tiene `subjects` **y** `cards`, se muestra `alert('El archivo no tiene el formato correcto')` y los datos no cambian.

### IO-04 · Archivo ilegible
Si el contenido no es JSON válido, se muestra `alert('Error al leer el archivo')` y los datos no cambian.
