# Ciclo de vida de la imagen

Solo se conserva una imagen vigente por receta. El archivo anterior se elimina
de GridFS al reemplazar, quitar o borrar la receta.

![Ciclo de vida de la imagen](estado-imagen.svg)

<details>
<summary>Código Mermaid (editable)</summary>

```mermaid
%%{init: {"htmlLabels": false}}%%
stateDiagram-v2
    [*] --> SinImagen: crear receta
    SinImagen --> ConImagen: POST /api/recipes/:id/image
    ConImagen --> ConImagen: reemplazar (borra la anterior)
    ConImagen --> SinImagen: quitar imagen (PUT con imagen vacía)
    ConImagen --> Eliminada: eliminar receta
    SinImagen --> Eliminada: eliminar receta
    Eliminada --> [*]
```

</details>


## Notas

- La lectura `GET /api/recipes/image/:fileId` es pública y usa caché inmutable.
- La validación real de bytes (magic bytes) está pendiente; solo se comprueba el
  tipo MIME declarado y un máximo de 5 MB en el servidor.
