# Autenticación y sesión

Rutas: `/login`, `/register`  
Casos de uso: [Autenticación y sesión](../casos-uso/autenticacion-y-sesion.md)

![Autenticación y sesión](flujo-autenticacion-y-sesion.svg)

<details>
<summary>Código Mermaid (editable)</summary>

```mermaid
%%{init: {"htmlLabels": false}}%%
graph TD
    Inicio([Usuario abre login o registro]) --> Formulario[Completa nombre, correo y contraseña]
    Formulario --> Accion{Acción}
    Accion -->|Registrarse| Registro[POST /api/auth/register]
    Accion -->|Iniciar sesión| Login[POST /api/auth/login]
    Registro --> LimiteRegistro{Límite<br/>10 intentos / 15 min}
    Login --> LimiteLogin{Límite<br/>10 intentos / 15 min}
    LimiteRegistro -->|Excedido| E429[429 Demasiados intentos]
    LimiteLogin -->|Excedido| E429
    LimiteRegistro -->|Permitido| Existe{Correo registrado?}
    LimiteLogin -->|Permitido| Usuario{Usuario existe?}
    Existe -->|Sí| E400R[400 El usuario ya existe]
    Existe -->|No| Hash[bcrypt con 10 rondas]
    Usuario -->|No| E400U[400 Usuario no encontrado]
    Usuario -->|Sí| Clave{Contraseña válida?}
    Clave -->|No| E400C[400 Contraseña incorrecta]
    Clave -->|Sí| Token[JWT de 30 días]
    Hash --> Token
    Token --> Guardar[Guardar usuario y token en localStorage]
    Guardar --> Dashboard[Ir a /dashboard]
    Dashboard --> Cerrar[Cerrar sesión]
    Cerrar --> Borrar[Eliminar token local]
    Borrar --> LoginVista[Volver a /login]
```

</details>


## Endpoints y validaciones

| Paso | Detalle real |
|---|---|
| Registro | Sanea `name` y `email`; exige nombre, correo, contraseña mínima de 8 caracteres y correo único en minúsculas. |
| Inicio de sesión | Compara el hash con `bcrypt.compare`; no sanea explícitamente la contraseña. |
| Sesión | El token no se invalida en el servidor; cerrar sesión solamente elimina el token del navegador. |
| Rutas protegidas | `AuthGuard` exige la presencia del token, pero no comprueba su expiración antes de llamar al backend. |
