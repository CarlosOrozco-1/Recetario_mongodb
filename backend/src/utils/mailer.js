const nodemailer = require("nodemailer");

const isConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const createTransport = () => {
  if (!isConfigured()) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Envía el código de recuperación. Si no hay SMTP configurado, lo registra en consola
// para poder probar el flujo en desarrollo.
const sendResetCode = async (email, code) => {
  const from = process.env.MAIL_FROM || "Sazón <no-reply@sazon.app>";
  const subject = "Código de recuperación de contraseña";
  const text = `Tu código de recuperación es: ${code}\n\nExpira en 15 minutos. Si no solicitaste este cambio, ignora este mensaje.`;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0; padding:0; background-color:#f6f3eb; font-family:'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6f3eb; padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding:32px 40px; text-align:center;">
              <div style="width:56px; height:56px; margin:0 auto 12px; background:rgba(255,255,255,0.2); border-radius:16px; display:inline-flex; align-items:center; justify-content:center;">
                <span style="font-size:28px; line-height:1;">🍳</span>
              </div>
              <h1 style="margin:0; font-size:24px; font-weight:700; color:#ffffff; letter-spacing:-0.5px;">Sazón</h1>
              <p style="margin:8px 0 0; font-size:14px; color:rgba(255,255,255,0.85);">Tu red social de recetas</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 8px; font-size:20px; font-weight:600; color:#1a1a2e;">Recuperar contraseña</h2>
              <p style="margin:0 0 24px; font-size:15px; color:#6b7280; line-height:1.5;">
                Recibimos una solicitud para restablecer tu contraseña. Usa el siguiente código para continuar:
              </p>
              <div style="text-align:center; margin:0 0 24px;">
                <div style="display:inline-block; background:linear-gradient(135deg, #f6f3eb 0%, #fdf2e9 100%); border:2px dashed #7c3aed; border-radius:12px; padding:20px 40px;">
                  <span style="font-size:36px; font-weight:700; letter-spacing:8px; color:#7c3aed; font-family:'Courier New', monospace;">${code}</span>
                </div>
              </div>
              <p style="margin:0 0 8px; font-size:13px; color:#9ca3af; text-align:center;">
                Este código expira en <strong>15 minutos</strong>.
              </p>
              <p style="margin:0; font-size:13px; color:#9ca3af; text-align:center;">
                Si no solicitaste este cambio, puedes ignorar este mensaje. Tu contraseña no será modificada.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px; background-color:#faf7f2; border-top:1px solid #e6dfd5; text-align:center;">
              <p style="margin:0; font-size:12px; color:#9ca3af;">
                © 2026 Sazón · Tu red social de recetas
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const transport = createTransport();
  if (!transport) {
    console.log(`[MAILER] SMTP no configurado. Código para ${email}: ${code}`);
    return { sent: false, preview: code };
  }

  try {
    await transport.sendMail({ from, to: email, subject, text, html });
    return { sent: true };
  } catch (error) {
    console.error("[MAILER] Error al enviar correo:", error.message);
    console.log(`[MAILER] Código para ${email}: ${code}`);
    return { sent: false, preview: code };
  }
};

module.exports = { sendResetCode, isConfigured };
