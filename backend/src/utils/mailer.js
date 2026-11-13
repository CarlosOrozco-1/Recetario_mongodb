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

  const transport = createTransport();
  if (!transport) {
    console.log(`[MAILER] SMTP no configurado. Código para ${email}: ${code}`);
    return { sent: false, preview: code };
  }

  try {
    await transport.sendMail({ from, to: email, subject, text });
    return { sent: true };
  } catch (error) {
    console.error("[MAILER] Error al enviar correo:", error.message);
    console.log(`[MAILER] Código para ${email}: ${code}`);
    return { sent: false, preview: code };
  }
};

module.exports = { sendResetCode, isConfigured };
