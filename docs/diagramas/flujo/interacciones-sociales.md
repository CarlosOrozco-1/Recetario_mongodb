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
    Like --> EstadoLike{Ya tenía me gusta?}
    EstadoLike -->|Sí| QuitarLike[Quitar usuario y decrementar]
    EstadoLike -->|No| PonerLike[Agregar usuario e incrementar]
    PonerLike --> FeedLike[Registrar actividad para el autor]
    QuitarLike --> Respuesta[200 con estado y contador]
    FeedLike --> Respuesta
    Save --> EstadoSave{Ya estaba guardada?}
    EstadoSave -->|Sí| QuitarSave[Quitar usuario y decrementar]
    EstadoSave -->|No| PonerSave[Agregar usuario e incrementar]
    QuitarSave --> Respuesta
    PonerSave --> Respuesta
    Share --> Incremento[Incrementar compartidos]
    Incremento --> FeedShare{Tipo compartio_receta válido?}
    FeedShare -->|No| E500[500 por enumeración; el contador ya aumentó]
    FeedShare -->|Sí| Respuesta
    Report --> Validar[Guardar motivo y marcar reportado]
    Validar --> Respuesta
    Accion --> Limite{Límite social o de creación}
    Limite -->|Excedido| E429[429 Demasiadas acciones]
```

</details>


## Endpoints y validaciones

| Paso | Detalle real |
|---|---|
| Me gusta | Alterna el estado, mantiene usuario y receta sincronizados y crea actividad para el autor. La interfaz evita el “me gusta” propio, pero el backend no lo impide. |
| Guardar | Alterna el estado solamente en la receta; no usa el mismo arreglo de favoritos del usuario. |
| Compartir | Incrementa el contador; actualmente falla después por un valor fuera de la enumeración permitida. |
| Reportar | Agrega el reporte, marca la receta y sanea el motivo; permite reportes repetidos. |
| Límites | Las interacciones usan 30 acciones por minuto y los reportes usan el límite de creación. |
