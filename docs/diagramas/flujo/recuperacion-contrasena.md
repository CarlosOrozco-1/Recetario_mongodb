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
    Limite -->|Permitido| Existe{Usuario existe?}
    Existe -->|No| Generico[200 Si el correo existe, recibirás un código]
    Existe -->|Sí, con contraseña| Generar[Generar código de 6 dígitos]
    Generar --> Hash[Hashear código con bcrypt]
    Hash --> Guardar[Guardar en PasswordReset con TTL 15 min]
    Guardar --> Enviar[Enviar correo o registrar en consola]
    Enviar --> Generico
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
| 1. Solicitar | `POST /api/auth/forgot-password` | Sanea `email`. Respuesta genérica para no revelar si la cuenta existe. Invalida códigos anteriores. Genera código de 6 dígitos, lo hashea con bcrypt y lo guarda con TTL de 15 min. Envía correo (o registra en consola si no hay SMTP). |
| 2. Verificar | `POST /api/auth/verify-reset-code` | Valida `email` y `code`. Compara con bcrypt. Devuelve un JWT temporal con `purpose: "reset"` y expiración de 15 min. |
| 3. Restablecer | `POST /api/auth/reset-password` | Valida el token (firma, expiración, purpose). Verifica que el código no haya sido usado ni expirado. Actualiza la contraseña y marca el código como usado. |

## Requisitos pendientes

- Configurar servicio de correo (SMTP o proveedor) en `.env`.
- Añadir variables: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`.
- Implementar invalidación de sesiones existentes tras el cambio (opcional).
- Añadir pruebas unitarias para los 3 endpoints.