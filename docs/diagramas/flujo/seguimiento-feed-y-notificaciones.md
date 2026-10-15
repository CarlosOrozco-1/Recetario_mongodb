# Seguimiento, feed y notificaciones

Rutas: `/feed`, `/profile/:username`, campana en el tablero  
Casos de uso: [Seguimiento, feed y notificaciones](../casos-uso/seguimiento-feed-y-notificaciones.md)

![Seguimiento, feed y notificaciones](flujo-seguimiento-feed-y-notificaciones.svg)

<details>
<summary>Código Mermaid (editable)</summary>

```mermaid
%%{init: {"htmlLabels": false}}%%
graph TD
    Feed([Abrir feed]) --> Pagina[GET /api/activity/feed?page=&limit=]
    Pagina --> Lista[Mostrar actividades y paginar]
    Perfil([Abrir perfil]) --> Actividad[GET /api/activity/user/:userId]
    Actividad --> Problema{Identificador compatible?}
    Problema -->|Nombre en vez de ID| EPerfil[El perfil no resuelve usuario ni seguimiento]
    Problema -->|ID válido| Datos[Mostrar actividad]
    Seguir([Seguir o dejar de seguir]) --> Toggle[POST /api/follows]
    Toggle --> Propio{Seguirse a sí mismo?}
    Propio -->|Sí| E400[400 No permitido]
    Propio -->|No| Estado{Ya lo seguía?}
    Estado -->|Sí| Dejar[Eliminar seguimiento y decrementar]
    Estado -->|No| SeguirAccion[Crear seguimiento e incrementar]
    SeguirAccion --> FeedFollow[Registrar actividad para el seguido]
    Dejar --> Respuesta[200 con isFollowing]
    FeedFollow --> Respuesta
    Campana([Abrir campana]) --> Reutilizar[GET /api/activity/feed]
    Reutilizar --> Filtrar[Descartar actividades propias]
    Filtrar --> Contar[Contar todas como no leídas]
    Contar --> Marcar[Marcar como leída solo en memoria]
    Marcar --> Recarga[Al recargar vuelven a aparecer]
```

</details>


## Endpoints y validaciones

| Paso | Detalle real |
|---|---|
| Feed | Usa seguidos más el propio usuario, con paginación de 20 por defecto. |
| Perfil | La ruta usa `username`, pero el backend espera un identificador de usuario; por eso el perfil no resuelve correctamente usuario ni seguimiento. |
| Seguimiento | Impide seguirse a sí mismo, alterna el estado y actualiza contadores. |
| Campana | Reutiliza el feed, no persiste lectura y el contador no representa no leídas reales. |
| Formato temporal | La campana calcula mal los minutos, horas y días porque usa la fecha absoluta en lugar de la diferencia con ahora. |
