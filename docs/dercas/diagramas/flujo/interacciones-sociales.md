# Interacciones sociales

Superficie: tarjetas y modal del tablero  
Casos de uso: [Interacciones sociales](../casos-uso/interacciones-sociales.md)

![Interacciones sociales](flujo-interacciones-sociales.svg)

<details>
<summary>Código Mermaid (editable)</summary>

```mermaid
%%{init: {"htmlLabels": false}}%%
graph TD
    Tarjeta([Elegir receta]) --> Accion{Acción}
    Accion -->|Me gusta| Like[POST /api/recipes/:id/like]
    Accion -->|Guardar| Save[POST /api/recipes/:id/save]
    Accion -->|Compartir| Share[POST /api/recipes/:id/share]
    Accion -->|Reportar| Report[POST /api/recipes/:id/report]
    Like --> Propia{Receta propia?}
    Propia -->|Sí| E400[400 No puedes dar like a tu propia receta]
    Propia -->|No| EstadoLike{Ya tenía me gusta?}
    EstadoLike -->|Sí| QuitarLike[Eliminar fila en likes y recalcular]
    EstadoLike -->|No| PonerLike[Crear fila en likes e incrementar]
    PonerLike --> FeedLike[Registrar actividad para el autor]
    QuitarLike --> Respuesta[200 con estado y contador]
    FeedLike --> Respuesta
    Save --> EstadoSave{Ya estaba guardada?}
    EstadoSave -->|Sí| QuitarSave[Eliminar fila en saves y recalcular]
    EstadoSave -->|No| PonerSave[Crear fila en saves e incrementar]
    QuitarSave --> Respuesta
    PonerSave --> Respuesta
    Share --> Incremento[Incrementar compartidos]
    Incremento --> FeedShare[Registrar actividad compartio_receta]
    FeedShare --> Respuesta
    Report --> Validar[Crear reporte con estado pendiente]
    Validar --> Respuesta
    Accion --> Limite{Límite social o de creación}
    Limite -->|Excedido| E429[429 Demasiadas acciones]
```

</details>


## Endpoints y validaciones

| Paso | Detalle real |
|---|---|
| Me gusta | Crea o elimina una fila en `likes`, recalcula `likesCount` con `countDocuments` y crea actividad `likio_receta` para el autor al dar like. Dar like a la receta propia responde `400`. |
| Guardar | Crea o elimina una fila en `saves` y recalcula `guardadosCount`. Es el único mecanismo de favorito personal. |
| Compartir | Incrementa `compartidosCount` y registra actividad `compartio_receta`, ya incluida en la enumeración. |
| Reportar | Crea un documento en `reports` con `estado: pendiente` y sanea el motivo; un segundo reporte del mismo usuario responde `400`. |
| Límites | Las interacciones usan 30 acciones por minuto y los reportes usan el límite de creación. |
