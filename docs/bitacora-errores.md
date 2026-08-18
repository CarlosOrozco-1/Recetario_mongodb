# Bitácora de Errores y Correcciones

## Formato
Cada entrada incluye: **Fecha**, **Componente/Archivo**, **Síntoma**, **Causa Raíz**, **Solución Aplicada**, **Verificación**.

---

## 2026-08-18 | recipe-form (Edición de receta no muestra datos)

### Síntoma
Al editar una receta existente, el formulario mostraba los valores por defecto (vacíos/"datos de ejemplo") en lugar de los datos de la receta. En consola el log `"Modelo de receta asignado en el formulario:"` mostraba el objeto correcto con todos los campos poblados desde el backend.

### Causa Raíz
Falta de detección de cambios (change detection) en Angular. El callback `subscribe()` de `HttpClient` asignaba correctamente `this.recipe = {...}`, pero el template no se actualizaba. Posibles razones:
- El componente o un ancestro usa estrategia `OnPush`
- `zone.js` no detectó la actualización dentro del callback
- Race condition en la navegación

### Solución Aplicada
1. Inyectar `ChangeDetectorRef` en el componente
2. Llamar a `this.cdr.detectChanges()` tras asignar `this.recipe` en el `next()` del `subscribe()`

**Archivo:** `frontend/src/app/components/recipe-form/recipe-form.ts`

```typescript
// Import
import { ChangeDetectorRef } from "@angular/core";

// Inyección
private readonly cdr = inject(ChangeDetectorRef);

// En loadRecipe()
next: (data) => {
  this.recipe = { /* ... asignación ... */ };
  this.cdr.detectChanges(); // Fuerza actualización del template
},
```

### Verificación
- `ng build` → compila sin errores
- Al editar una receta, el formulario ahora muestra los datos correctos (título, descripción, ingredientes, instrucciones, categoría, dificultad, tiempo, porciones, pública, favorito)

---

## 2026-08-18 | Language Server Angular (Zed) - Módulo no encontrado en raíz

### Síntoma
Error al iniciar Zed: `Cannot find module '/home/carloso/Projects/2026/MAIN/recetario/node_modules/@angular/language-server/index.js'`. El editor buscaba el language server en la raíz del workspace, pero estaba instalado solo en `frontend/node_modules`.

### Causa Raíz
El workspace root es `recetario/` pero el proyecto Angular vive en `frontend/`. VSCode/Zed resuelven `@angular/language-server` desde el workspace root.

### Solución Aplicada
1. Crear `package.json` en la raíz (`recetario/`) con `@angular/language-server`, `@angular/language-service` y `typescript` como devDependencies
2. `npm install` en la raíz → crea `recetario/node_modules/@angular/language-server/`
3. Corregir `.zed/settings.json`: mover configuración del binario a sección `"lsp"` y usar array de strings en `"language_servers"`
4. Desactivar Biome para HTML: `"formatter": "language_server"`, `"linter": "language_server"`

**Archivos:**
- `package.json` (raíz) - nuevo
- `.zed/settings.json` - corregido

### Verificación
- Language server arranca con `EXIT: 0`
- Error "Text expressions aren't supported" (Biome) → desaparece
- Error "Alternative text title element cannot be empty" → persiste (es warning real de a11y del Angular Language Service)

---

## 2026-08-18 | recipe-form - Pérdida de foco en inputs de ingredientes

### Síntoma
Al escribir en los campos de ingredientes (`*ngFor`), cada carácter hacía perder el foco del input.

### Causa Raíz
`*ngFor` sobre array de strings sin `trackBy`. Cada keystroke muta el string → Angular detecta "nuevo objeto" por referencia → destruye y recrea el DOM del input → se pierde el foco.

### Solución Aplicada
Agregar `trackBy: trackByIndex` al `*ngFor` y método `trackByIndex(index) { return index; }` en el componente.

**Archivos:**
- `frontend/src/app/components/recipe-form/recipe-form.html` (línea 98)
- `frontend/src/app/components/recipe-form/recipe-form.ts` (método `trackByIndex`)

### Verificación
- Al escribir en ingredientes, el foco se mantiene correctamente
- `ng build` → OK

---

## 2026-08-18 | Login/Register - "Text expressions aren't supported" + errores a11y

### Síntoma
En Zed: errores "Text expressions aren't supported" en plantillas Angular (`{{ }}`, `*ngIf`, etc.) y warnings de accesibilidad (`<a routerLink>` sin `href`, `<button>` sin `type`).

### Causa Raíz
1. Biome (linter por defecto de Zed para HTML) no parsea sintaxis Angular
2. Falta `type="button"` en botones sin submit
3. Falta `href` en `<a routerLink>` (regla a11y `linkHref`)

### Solución Aplicada
1. Configurar Zed para usar Angular Language Service como formatter/linter: `"formatter": "language_server"`, `"linter": "language_server"` en `.zed/settings.json`
2. Agregar `type="button"` a todos los botones que no son submit
3. Agregar `href` a enlaces con `routerLink`

**Archivos corregidos:**
- `frontend/src/app/components/login/login.html`
- `frontend/src/app/components/register/register.html`
- `frontend/src/app/components/recipe-form/recipe-form.html`
- `frontend/src/app/components/dashboard/dashboard.html`

### Verificación
- Build Angular OK
- Errores Biome desaparecidos
- Warnings a11y resueltos

---

## 2026-08-17 | Postman Collection - JSON inválido

### Síntoma
La colección Postman tenía JSON malformado (faltaban llaves de cierre en los objetos de request).

### Causa Raíz
Edición manual incompleta al agregar endpoints de recetas.

### Solución Aplicada
Corregir estructura JSON: cerrar todos los objetos `request` y `response` correctamente, validar con `jq`.

**Archivo:** `postman/Recetario.postman_collection.json`

### Verificación
- `jq empty postman/Recetario.postman_collection.json` → sin errores
- Importación en Postman exitosa
- Tests de Health, Auth (register/login), Recipes CRUD → pasan

---

## 2026-08-17 | Backend - Health endpoint sin estado de MongoDB

### Síntoma
Endpoint `GET /api/health` no indicaba si MongoDB estaba conectado.

### Causa Raíz
Endpoint básico solo devolvía `{status: "ok"}`.

### Solución Aplicada
Mejorar `GET /api/health` para incluir estado de conexión Mongoose:
```javascript
{
  status: "ok",
  mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  database: mongoose.connection.name,
  host: mongoose.connection.host,
  port: mongoose.connection.port,
  timestamp: new Date().toISOString()
}
```

**Archivo:** `backend/src/server.js`

### Verificación
- `curl http://localhost:3000/api/health` muestra estado completo
- Docker healthcheck usa este endpoint

---

## 2026-08-17 | Backend - Recipe model `usuario` como String en vez de ObjectId

### Síntoma
Al crear recetas, el campo `usuario` se guardaba como string plano en vez de referencia ObjectId, rompiendo el `populate()`.

### Causa Raíz
Schema definía `usuario: { type: String }` en vez de `type: mongoose.Schema.Types.ObjectId, ref: "User"`.

### Solución Aplicada
Corregir Schema en `Recipe.js`:
```javascript
usuario: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true
}
```

**Archivo:** `backend/src/models/Recipe.js`

### Verificación
- `populate("usuario", "name")` funciona en `getAll` y `getById`
- Recetas muestran nombre del chef correctamente

---

## 2026-08-17 | Naming Conventions - Archivos controllers/routes

### Síntoma
Inconsistencia: `RecipeController.js` (PascalCase) vs `authController.js` (camelCase), `Recipes.js` vs `recipes.js`.

### Causa Raíz
Convenciones no documentadas al inicio del proyecto.

### Solución Aplicada
1. Documentar convenciones en `docs/convenciones.md`
2. Renombrar archivos a camelCase:
   - `RecipeController.js` → `recipeController.js`
   - `Recipes.js` → `recipes.js`
   - `AuthController.js` → `authController.js` (ya estaba)
3. Ajustar imports en `server.js` y rutas

**Archivos:**
- `docs/convenciones.md` - nuevo
- `backend/src/controllers/*.js` - renombrados
- `backend/src/routes/*.js` - renombrados
- `backend/src/server.js` - imports actualizados

### Verificación
- Todas las rutas funcionan
- Consistencia en todo el backend

---

## 2026-08-16 | Frontend - `.toPromise()` deprecado en RxJS 7.8+

### Síntoma
Error de compilación: `Property 'toPromise' does not exist on type 'Observable'`.

### Causa Raíz
RxJS 7.8+ eliminó `.toPromise()`. Se debe usar `firstValueFrom()` o `lastValueFrom()`.

### Solución Aplicada
Reemplazar `.toPromise()` por `firstValueFrom()` en:
- `login.component.ts`
- `register.component.ts`
- `recipe-form.component.ts`
- `dashboard.component.ts`

Importar: `import { firstValueFrom } from "rxjs";`

### Verificación
- `ng build` compila sin errores
- Login, registro, CRUD recetas funcionan

---

## 2026-08-16 | Frontend - `CommonModule` faltante en componentes standalone

### Síntoma
Error: `NG0302: The pipe 'async' could not be found` / directivas `*ngIf`, `*ngFor` no reconocidas.

### Causa Raíz
Componentes standalone no importaban `CommonModule`.

### Solución Aplicada
Agregar `CommonModule` a `imports[]` en todos los componentes standalone que usan `*ngIf`, `*ngFor`, `async`, `date` pipe, etc.

### Verificación
- Compilación OK
- Templates renderizan correctamente

---

## 2026-08-15 | Docker - Frontend nginx config para proxy API

### Síntoma
Frontend en Docker no llegaba al backend (`/api/*` → 404).

### Causa Raíz
Faltaba configuración de proxy en nginx del frontend.

### Solución Aplicada
Crear `frontend/nginx.conf` con:
```nginx
location /api/ {
  proxy_pass http://backend:3000/;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
}
```

Actualizar `Dockerfile.frontend` para copiarlo.

### Verificación
- `docker compose up` → frontend accede a `/api/*` via proxy
- Login, registro, recetas funcionan en contenedores

---

*Última actualización: 2026-08-18*