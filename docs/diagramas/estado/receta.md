# Ciclo de vida de la receta

La receta nace privada. La visibilidad y el reporte son atributos del documento,
y el borrado es físico: no hay borrado lógico ni cascada.

![Ciclo de vida de la receta](estado-receta.svg)

<details>
<summary>Código Mermaid (editable)</summary>

```mermaid
%%{init: {"htmlLabels": false}}%%
stateDiagram-v2
    [*] --> Privada: crear receta
    Privada --> Publica: cambiar visibilidad (publica = true)
    Publica --> Privada: ocultar (publica = false)
    Publica --> Reportada: reportar
    Privada --> Reportada: reportar
    Reportada --> Publica: sigue visible (no hay moderación)
    Reportada --> Privada: sigue visible como privada
    Privada --> Eliminada: eliminar (propietario)
    Publica --> Eliminada: eliminar (propietario)
    Eliminada --> [*]
```

</details>


## Notas

- `reportado` es un booleano independiente; una receta reportada no cambia de
  visibilidad ni deja de ser consultable.
- No existe estado de moderación ni cuenta administradora.
- Al eliminar, se borra la receta y su imagen GridFS, pero quedan huérfanos los
  comentarios, reseñas y actividades asociados.
