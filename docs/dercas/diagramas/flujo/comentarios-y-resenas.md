# Comentarios y reseñas

Superficie: modal de detalle en el tablero  
Casos de uso: [Comentarios y reseñas](../casos-uso/comentarios-y-resenas.md)

![Comentarios y reseñas](flujo-comentarios-y-resenas.svg)

<details>
<summary>Código Mermaid (editable)</summary>

```mermaid
%%{init: {"htmlLabels": false}}%%
graph TD
    Modal([Abrir detalle]) --> Cargar[Cargar comentarios y reseñas]
    Cargar --> Comentarios[GET /api/comments/receta/:recetaId]
    Cargar --> Resenas[GET /api/reviews/receta/:recetaId]
    Comentarios --> Nivel[Mostrar principales y respuestas directas]
    Resenas --> Promedio[Mostrar lista y promedio]
    Nivel --> Accion{Acción}
    Accion -->|Comentar| CrearC[POST /api/comments]
    Accion -->|Responder| CrearR[POST /api/comments con parentComment]
    Accion -->|Reseñar| CrearV[POST /api/reviews]
    CrearC --> Incrementar[Incrementar comentarios y registrar actividad]
    CrearR --> Incrementar
    CrearV --> Recalcular[Recalcular promedio y total]
    Incrementar --> Respuesta[201 y actualización del modal]
    Recalcular --> Respuesta
    CrearC --> Duplicada{Ya existe la reseña?}
    CrearV --> Duplicada
    Duplicada -->|Sí| E400[400 Ya reseñaste esta receta]
    Accion -->|Editar o borrar| Servicio{Método disponible}
    Servicio -->|Comentario propio| PUTComentario[PUT /api/comments/:id]
    Servicio -->|Reseña propia| PUTResena[PUT /api/reviews/:id]
    Servicio -->|Sin botón actual| Pendiente[Disponible en API, sin interfaz]
```

</details>


## Endpoints y validaciones

| Paso | Detalle real |
|---|---|
| Lectura de comentarios | Devuelve comentarios principales no eliminados y un nivel de respuestas. |
| Lectura de reseñas | Devuelve todas las reseñas ordenadas por fecha descendente. |
| Crear comentario o respuesta | Texto obligatorio hasta 1000 caracteres; crea actividad propia y, si aplica, para el autor. |
| Crear reseña | Puntuación obligatoria de 1 a 5 y texto opcional hasta 2000 caracteres; una reseña por usuario y receta. |
| Editar o borrar | Existe en la API con control de autor, pero actualmente no tiene botones en la interfaz. |
| Borrado de comentarios | Es lógico; puede dejar respuestas visibles si solamente se elimina el comentario padre. |
