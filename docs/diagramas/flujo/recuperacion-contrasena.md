# Recuperación de contraseña

Rutas: `/forgot-password`  
Casos de uso: [Autenticación y sesión](../casos-uso/autenticacion-y-sesion.md)

![Recuperación de contraseña](flujo-recuperacion-contrasena.svg)

<details>
<summary>Código Mermaid (editable)</summary>

```mermaid
%%{init: {"htmlLabels": false}}%%
graph TD
    Inicio([Usuario abre /forgot-password]) --> Paso1[Paso 1: ingresa su correo]
    Paso1 --> Solicitar[POST /api/auth/forgot-password]
    Solicitar --> Limite{Límite<br/>10 intentos / 15 min}
    Limite -->|Excedido| E429[429 Demasiados intentos]
    Limite -->|Permitido| Config{SMTP configurado?}
    Config -->|No| E503[503 Envío de correos no disponible]
    Config -->|Sí| Existe{Usuario existe?}
    Existe -->|No| Generico[200 Si el correo existe, recibirás un código]
    Existe -->|Sí| Generar[Generar código de 6 dígitos]
    Generar --> Hash[Hashear código con bcrypt]
    Hash --> Guardar[Guardar en PasswordReset con TTL 15 min]
    Guardar --> Enviar[Enviar correo por SMTP]
    Enviar --> EnvioOk{Proveedor acepta?}
    EnvioOk -->|No| Descartar[Invalidar código creado]
    Descartar --> E502[502 No se pudo enviar]
    EnvioOk -->|Sí| Generico
    Generico --> Paso2[Paso 2: ingresa el código]
    Paso2 --> Verificar[POST /api/auth/verify-reset-code]
    Verificar --> Valido{Código válido<br/>y no expirado?}
    Valido -->|No| E400[400 Código inválido o expirado]
    Valido -->|Sí| Token[JWT temporal de 15 min con purpose reset]
    Token --> Paso3[Paso 3: nueva contraseña]
    Paso3 --> Reset[POST /api/auth/reset-password]
    Reset --> TokenValido{Token válido<br/>y no usado?}
    TokenValido -->|No| E401[401 Token inválido o expirado]
    TokenValido -->|Sí| Actualizar[Actualizar contraseña del usuario]
    Actualizar --> Marcar[Marcar código como usado]
    Marcar --> Exito[200 Contraseña actualizada]
    Exito --> Login[Volver a /login]
```

</details>


## Endpoints y validaciones

| Paso | Endpoint | Detalle |
|---|---|---|
| 1. Solicitar | `POST /api/auth/forgot-password` | Sanea `email`. Si falta la configuración global de SMTP responde `503` antes de consultar la cuenta. Si el usuario no existe responde `200` genérico para no revelar su existencia. Si existe, invalida códigos anteriores, genera un código de 6 dígitos, lo hashea con bcrypt y lo guarda con TTL de 15 min. Envía el correo por SMTP; si el proveedor lo rechaza, invalida el código y responde `502`. Cualquier cuenta con email puede recuperarla, incluidas las creadas con Google. |
| 2. Verificar | `POST /api/auth/verify-reset-code` | Valida `email` y `code`. Compara con bcrypt. Devuelve un JWT temporal con `purpose: "reset"` y expiración de 15 min. |
| 3. Restablecer | `POST /api/auth/reset-password` | Valida el token (firma, expiración, purpose). Verifica que el código no haya sido usado ni expirado. Actualiza la contraseña y marca el código como usado. |

## Configuración necesaria

- Definir en `backend/.env`: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` y `MAIL_FROM`. Gmail exige una contraseña de aplicación.
- Al arrancar, el backend registra si SMTP está configurado; si faltan variables, responde `503` en el paso 1.
- Implementar invalidación de sesiones existentes tras el cambio (opcional).
- Mejorar el envío con un proveedor transaccional y cola de reintentos (opcional).