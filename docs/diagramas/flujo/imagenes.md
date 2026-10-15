# Imágenes

Ruta: `/recipe/:id` en modo edición  
Casos de uso: [Imágenes](../casos-uso/imagenes.md)

![Imágenes](flujo-imagenes.svg)

<details>
<summary>Código Mermaid (editable)</summary>

```mermaid
%%{init: {"htmlLabels": false}}%%
graph TD
    Editar([Editar receta existente]) --> Elegir[Elegir archivo]
    Elegir --> Tipo{Archivo de imagen?}
    Tipo -->|No| ETipo[Error: selecciona una imagen]
    Tipo -->|Sí| Tamano{Mayor de 25 MB?}
    Tamano -->|Sí| ETamano[Error: supera 25 MB]
    Tamano -->|No| Vista[Mostrar vista previa local]
    Vista --> Accion{Acción}
    Accion -->|Quitar| Quitar[Vaciar imagen y revocar vista previa]
    Quitar --> GuardarFormulario[Guardar receta con imagen vacía]
    GuardarFormulario --> Limpieza[PUT elimina imagen anterior en GridFS]
    Accion -->|Subir o reemplazar| Optimizar[Redimensionar a 1600 px y JPEG 0.8]
    Optimizar -->|Navegador no puede| Original[Usar archivo original]
    Optimizar -->|Optimizada| Subir[POST /api/recipes/:id/image]
    Original --> Subir
    Subir --> Servidor{Propietario y archivo válido?}
    Servidor -->|No| E400[400 o 404 y borrado de la subida]
    Servidor -->|Sí| GuardarID[Guardar nuevo ID y borrar imagen anterior]
    GuardarID --> Ver[Mostrar imagen con /api/recipes/image/:fileId]
    Ver --> Publica{Imagen pública?}
    Publica -->|Sí| E200[200 con Content-Type y caché inmutable]
    Publica -->|ID inválido| E400I[400 Identificador inválido]
    Publica -->|No existe| E404I[404 Imagen no encontrada]
```

</details>


## Endpoints y validaciones

| Paso | Detalle real |
|---|---|
| Selección | Acepta cualquier tipo cuyo MIME comience con `image/` y archivos hasta 25 MB. |
| Optimización | Convierte y reduce al lado mayor de 1600 px en JPEG calidad `0.8`; usa el original si falla. |
| Subida | Usa `multipart/form-data` con el campo `imagen`; no necesita cabecera manual `Content-Type`. |
| Servidor | Acepta JPEG, PNG, WebP y GIF según el tipo declarado y archivos hasta 5 MB; no verifica los bytes reales. |
| Limpieza | Al reemplazar, quitar mediante formulario o borrar receta, elimina el archivo anterior o asociado de GridFS. |
| Visualización | La lectura es pública para permitir `<img src>`; devuelve tipo de contenido y caché de un año. |
