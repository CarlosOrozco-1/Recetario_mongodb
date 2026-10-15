# 📐 Convenciones de Nomenclatura - Proyecto Recetario

## 🎯 Regla General

**Proyecto JavaScript/Node.js → camelCase por defecto**

---

## 📁 Archivos

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| **Modelos (Mongoose)** | PascalCase | `User.js`, `Recipe.js` |
| **Controladores** | camelCase + `Controller` | `authController.js`, `recipeController.js` |
| **Rutas** | camelCase | `auth.js`, `recipes.js` |
| **Middlewares** | camelCase | `auth.js`, `validate.js` |
| **Utilidades** | camelCase | `helpers.js`, `database.js` |
| **Configuración** | camelCase | `config.js`, `database.js` |

---

## 📦 Variables y Funciones

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| **Variables** | camelCase | `userName`, `recipeTitle` |
| **Funciones** | camelCase | `createUser()`, `getRecipe()` |
| **Funciones controller** | camelCase | `create`, `getAll`, `getById`, `update`, `remove` |
| **Constantes** | UPPER_SNAKE_CASE | `MONGO_URI`, `JWT_SECRET`, `PORT` |
| **Schema variables** | PascalCase | `UserSchema`, `RecipeSchema` |

---

## 🏗️ Clases y Modelos

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| **Modelos Mongoose** | PascalCase | `User`, `Recipe` |
| **Clases** | PascalCase | `DatabaseConnection` |
| **Interfaces (TS)** | PascalCase con `I` | `IUser`, `IRecipe` |

---

## 🔤 Strings y Mensajes

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| **Mensajes de error** | Español, sin punto | `"El nombre es obligatorio"` |
| **Mensajes de éxito** | Español, sin punto | `"Receta creada"` |
| **Keys de JSON** | camelCase | `createdAt`, `updatedAt` |

---

## 📂 Estructura de Carpetas

```
backend/src/
├── config/           → Configuración (camelCase)
├── controllers/      → Controladores (camelCase + Controller.js)
├── middleware/        → Middlewares (camelCase.js)
├── models/           → Modelos (PascalCase.js)
├── routes/           → Rutas (camelCase.js)
└── utils/            → Utilidades (camelCase.js)
```

---

## ✅ Ejemplo Correcto

```javascript
// models/Recipe.js
const RecipeSchema = new mongoose.Schema({...});
module.exports = mongoose.model("Recipe", RecipeSchema);

// controllers/recipeController.js
const create = async (req, res) => {...};
module.exports = { create, getAll, getById, update, remove };

// routes/recipes.js
router.post("/", create);
router.get("/", getAll);

// middleware/auth.js
const auth = async (req, res, next) => {...};
module.exports = auth;
```

---

## ❌ Ejemplo Incorrecto

```javascript
// ❌ Archivo: RecipeController.js (debe ser recipeController.js)
// ❌ Función: Create (debe ser create)
// ❌ Variable: User_Name (debe ser userName)
// ❌ Constante: mongoUri (debe ser MONGO_URI)
```

---

## 🔄 Resumen Rápido

| Dónde | Cómo |
|-------|------|
| Archivos de modelo | `PascalCase.js` |
| Archivos de controller | `camelCaseController.js` |
| Archivos de ruta/middleware | `camelCase.js` |
| Variables y funciones | `camelCase` |
| Constantes de entorno | `UPPER_SNAKE_CASE` |
| Schema variables | `PascalCaseSchema` |
