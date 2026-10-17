# Ciclo de vida de la receta

La receta nace privada. La visibilidad es un atributo del documento y el borrado
es físico: no hay borrado lógico ni cascada.

![Ciclo de vida de la receta](estado-receta.svg)

<details>
<summary>Código Mermaid (editable)</summary>

```mermaid
%%{init: {"htmlLabels": false}}%%
stateDiagram-v2
    [*] --> Privada: crear receta
    Privada --> Publica: cambiar visibilidad (publica = true)
    Publica --> Privada: ocultar (publica = false)
    Privada --> Eliminada: eliminar (propietario)
    Publica --> Eliminada: eliminar (propietario)
    Eliminada --> [*]
```

</details>


## Notas

- Los reportes son documentos aparte en `reports`; no cambian la visibilidad ni
  el estado de la receta. Cada reporte tiene su propio ciclo de moderación
  (`pendiente`, `descartado`, `resuelto`).
- No existe estado de moderación de recetas ni cuenta administradora.
- Al eliminar, se borra la receta, su imagen GridFS y sus filas en `likes`,
  `saves` y `reports`; quedan huérfanos los comentarios, reseñas y actividades.
