# Recetas y visibilidad

Rutas: `/dashboard`, `/recipe`, `/recipe/:id`  
Casos de uso: [Recetas y visibilidad](../casos-uso/recetas-y-visibilidad.md)

![Recetas y visibilidad](flujo-recetas-y-visibilidad.svg)

<details>
<summary>Código Mermaid (editable)</summary>

```mermaid
%%{init: {"htmlLabels": false}}%%
graph TD
    Dashboard([Abrir dashboard]) --> Tab{Pestaña}
    Tab -->|Mías| Propias[GET /api/recipes]
    Tab -->|Públicas| Publicas[GET /api/recipes?scope=public]
    Propias --> Filtros[Filtros locales por categoría, texto, guardado y orden]
    Publicas --> Filtros
    Filtros --> Modal{Abrir detalle?}
    Modal -->|No| Accion[Crear, editar, eliminar o cambiar visibilidad]
    Modal -->|Sí| Detalle[GET /api/recipes/:id]
    Detalle --> Visible{Propia o pública?}
    Visible -->|No| E404[404 Receta no encontrada]
    Visible -->|Sí| Accion
    Accion -->|Crear| Crear[POST /api/recipes]
    Accion -->|Editar| Editar[PUT /api/recipes/:id]
    Accion -->|Eliminar| Eliminar[DELETE /api/recipes/:id]
    Accion -->|Visibilidad| Visibilidad[PUT /api/recipes/:id con publica]
    Crear --> Límite[10 creaciones por minuto]
    Límite -->|Excedido| E429[429 Demasiadas publicaciones]
    Límite -->|Permitido| Campos{Solamente campos editables?}
    Campos -->|Vacío| E400[400 Sin campos editables]
    Campos -->|Válido| Dueno{Receta propia?}
    Dueno -->|No| E404D[404 No encontrada o sin permiso]
    Dueno -->|Sí| Guardar[Guardar en MongoDB]
    Eliminar --> Dueno
    Editar --> Dueno
    Visibilidad --> Dueno
    Guardar --> Refrescar[Actualizar tablero]
```

</details>


## Endpoints y validaciones

| Paso | Detalle real |
|---|---|
| Crear | Acepta 11 campos editables; el servidor asigna el propietario y descarta `_id`, `usuario`, contadores y métricas. |
| Listar | Sin paginación ni búsqueda en el servidor; los filtros actuales son del navegador. |
| Detalle | Permite la receta si pertenece al usuario o es pública. |
| Editar | Exige ser propietario y ejecuta validadores Mongoose; puede devolver `500` con identificadores inválidos. |
| Eliminar | Exige ser propietario; elimina la receta, su imagen GridFS y sus filas en `likes`, `saves` y `reports`; deja huérfanos comentarios, reseñas y actividad. |
| Visibilidad | Campo `publica`; las recetas nacen privadas. Muchas acciones sociales no comprueban actualmente la visibilidad. |
