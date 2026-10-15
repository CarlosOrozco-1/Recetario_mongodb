# Flujo general del sistema

## Recorrido de una petición

![Recorrido de una petición](flujo-sistema-general.svg)

<details>
<summary>Código Mermaid (editable)</summary>

```mermaid
%%{init: {"htmlLabels": false}}%%
graph TD
    Visitante([Visitante]) --> Angular[Aplicación Angular]
    Registrado([Usuario registrado]) --> Angular
    Angular --> Ruta{Ruta protegida?}
    Ruta -->|No| Publica[/login o /register/]
    Ruta -->|Sí| Guardia[AuthGuard]
    Guardia -->|Sin token| Publica
    Guardia -->|Con token| API[Cliente HTTP con Bearer]
    API --> Entrada{Entorno}
    Entrada -->|Local| Proxy[proxy.conf.json<br/>/api a localhost:3000]
    Entrada -->|Producción| Caddy[Caddy central]
    Caddy -->|/api/*| Backend[Express]
    Caddy -->|Otras rutas| Estatico[nginx + bundle Angular]
    Proxy --> Backend
    Backend --> Global[apiLimiter<br/>100 solicitudes / 15 min]
    Global -->|Exceso| E429[429 Demasiadas solicitudes]
    Global -->|Permitida| AuthZ{Ruta pública?}
    AuthZ -->|GET image| Imagen[Servir imagen GridFS]
    AuthZ -->|Otra| Token{Token válido?}
    Token -->|No| E401[401 Token no válido]
    Token -->|Sí| Proceso{Proceso}
    Proceso -->|Auth| Auth[Registro o inicio de sesión]
    Proceso -->|Recetas| Recetas[CRUD y visibilidad]
    Proceso -->|Imagen autenticada| Subida[Subida de imagen]
    Proceso -->|Social| Social[Interacción, comentarios o seguimiento]
    Recetas --> Mongo[(MongoDB Atlas)]
    Subida --> GridFS[(GridFS uploads)]
    Subida --> Mongo
    Social --> Mongo
    Auth --> Mongo
    Mongo --> Respuesta[200, 201, 400, 404, 429 o 500]
    Imagen --> Respuesta
```

</details>


## Reglas transversales

- Todo `/api`, excepto salud e imagen servida, exige un token válido.
- Los límites pueden devolver `429`.
- Los identificadores inválidos pueden producir `500` por `CastError` donde no hay validación explícita de `ObjectId`.
- Compartir puede incrementar el contador y luego devolver `500` por el valor `compartio_receta`, ausente en la enumeración de actividad.
