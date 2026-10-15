# Diagramas de la aplicación

## Índice

- [Diagrama entidad-relación](diagrama-er.md)
- [Diagramas de flujo](flujo/README.md)
- [Diagramas de casos de uso](casos-uso/README.md)
- [Diagramas de secuencia](secuencia/README.md)
- [Diagramas de estado](estado/README.md)

Los diagramas detallados por proceso sustituyen a los ejemplos básicos anteriores. Conservan las rutas, validaciones y defectos conocidos observados en el código.

## Cómo ver los diagramas

Cada Markdown incluye la imagen `.svg` ya renderizada y, debajo, el código Mermaid
en un bloque plegable. Para verlo en Zed, abre la **vista previa Markdown**
(`markdown: open preview`, `Ctrl+Shift+P`), no el editor de texto plano.

Para regenerar las imágenes tras editar un diagrama:

```bash
npx -y @mermaid-js/mermaid-cli@11 -i diagrama.mmd -o diagrama.svg -b white
```

## Arquitectura local

![Arquitectura local](readme-1.svg)

<details>
<summary>Código Mermaid (editable)</summary>

```mermaid
%%{init: {"htmlLabels": false}}%%
graph TD
    Navegador[Navegador] --> Angular[Angular en localhost:4200]
    Angular --> Proxy[proxy.conf.json]
    Proxy --> Backend[Express en localhost:3000]
    Backend --> Atlas[(MongoDB Atlas)]
    Backend --> GridFS[(GridFS uploads)]
```

</details>


## Arquitectura productiva

![Arquitectura productiva](readme-2.svg)

<details>
<summary>Código Mermaid (editable)</summary>

```mermaid
%%{init: {"htmlLabels": false}}%%
graph TD
    Internet[foodloopc.duckdns.org] --> Caddy[Caddy central]
    Caddy -->|/api/*| Backend[recetario-backend:3000]
    Caddy -->|Otras rutas| Frontend[recetario-frontend:80]
    Frontend --> Bundle[Bundle Angular en nginx]
    Backend --> Atlas[(MongoDB Atlas)]
    Backend --> GridFS[(GridFS uploads)]
```

</details>


## Estructura del proyecto

![Estructura del proyecto](readme-3.svg)

<details>
<summary>Código Mermaid (editable)</summary>

```mermaid
%%{init: {"htmlLabels": false}}%%
graph TD
    Root[recetario/]
    Root --> Backend[backend/]
    Root --> Frontend[frontend/]
    Root --> Docs[docs/]
    Root --> Compose[docker-compose.yml]
    Root --> Agents[AGENTS.md]

    Backend --> Modelos[models/]
    Backend --> Controladores[controllers/]
    Backend --> Rutas[routes/]
    Backend --> Middleware[middleware/]

    Frontend --> App[src/app/]
    App --> Componentes[components/]
    App --> Servicios[services/]
    App --> Guardias[guards/]

    Docs --> Desarrollo[desarrollo/]
    Docs --> Operacion[operacion/]
    Docs --> Bitacora[bitacora/]
    Docs --> Datos[modelo-datos/]
    Docs --> Referencia[referencia/]
    Docs --> DiagramasDoc[diagramas/]
    Docs --> Dercas[dercas/]
```

</details>

