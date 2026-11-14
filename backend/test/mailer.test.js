const test = require("node:test");
const assert = require("node:assert/strict");

const nodemailer = require("nodemailer");
const { sendResetCode, isConfigured } = require("../src/utils/mailer");

const SMTP_KEYS = ["SMTP_HOST", "SMTP_PORT", "SMTP_SECURE", "SMTP_USER", "SMTP_PASS"];

const setSmtp = enabled => {
  const original = Object.fromEntries(SMTP_KEYS.map(key => [key, process.env[key]]));
  if (enabled) {
    process.env.SMTP_HOST = "smtp.test.local";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_SECURE = "false";
    process.env.SMTP_USER = "test@test.local";
    process.env.SMTP_PASS = "test-pass";
  } else {
    for (const key of SMTP_KEYS) delete process.env[key];
  }
  return () => {
    for (const key of SMTP_KEYS) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
  };
};

const withTransport = sendMail => {
  const original = nodemailer.createTransport;
  nodemailer.createTransport = () => ({ sendMail });
  return () => {
    nodemailer.createTransport = original;
  };
};

test("isConfigured exige host, usuario y contraseña", () => {
  const restore = setSmtp(false);
  try {
    assert.equal(isConfigured(), false);
  } finally {
    restore();
  }
});

test("sendResetCode informa not-configured sin llamar a SMTP", async () => {
  const restoreSmtp = setSmtp(false);
  const restoreTransport = withTransport(async () => {
    throw new Error("no debería llamarse");
  });
  try {
    const result = await sendResetCode("user@test.local", "123456");
    assert.deepEqual(result, { sent: false, reason: "not-configured" });
  } finally {
    restoreTransport();
    restoreSmtp();
  }
});

test("sendResetCode informa send-error con el código del proveedor", async () => {
  const restoreSmtp = setSmtp(true);
  const restoreTransport = withTransport(async () => {
    throw Object.assign(new Error("auth failed"), { code: "EAUTH", responseCode: 535 });
  });
  try {
    const result = await sendResetCode("user@test.local", "123456");
    assert.equal(result.sent, false);
    assert.equal(result.reason, "send-error");
    assert.equal(result.errorCode, "EAUTH");
  } finally {
    restoreTransport();
    restoreSmtp();
  }
});

test("sendResetCode devuelve sent=true cuando SMTP acepta el mensaje", async () => {
  const restoreSmtp = setSmtp(true);
  let received = null;
  const restoreTransport = withTransport(async message => {
    received = message;
    return { messageId: "abc" };
  });
  try {
    const result = await sendResetCode("user@test.local", "123456");
    assert.equal(result.sent, true);
    assert.equal(received.to, "user@test.local");
    assert.match(received.text, /123456/);
  } finally {
    restoreTransport();
    restoreSmtp();
  }
});
