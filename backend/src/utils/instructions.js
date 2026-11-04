const STEP_PREFIX = /^(?:paso\s*)?\d+[.)、:-]?\s*/i;

// Convierte cualquier formato admitido (texto del formato anterior, líneas o
// subdocumentos) en pasos ordenados. El servidor renumera: el cliente no manda
// contadores ni identificadores.
const normalizeInstructions = instructions => {
  const values = Array.isArray(instructions)
    ? instructions.map((step, index) => {
        if (typeof step === "string") return { texto: step, orden: index + 1 };
        const orden = Number(step?.orden);
        return {
          texto: step?.texto,
          orden: Number.isFinite(orden) ? orden : index + 1,
        };
      })
    : typeof instructions === "string"
      ? instructions.split(/\r?\n/).map((texto, index) => ({ texto, orden: index + 1 }))
      : [];

  return values
    .slice()
    .sort((a, b) => a.orden - b.orden)
    .filter(step => typeof step.texto === "string")
    .map(step => step.texto.trim())
    .filter(Boolean)
    .map((texto, index) => ({
      orden: index + 1,
      texto: texto.replace(STEP_PREFIX, "").trim(),
    }))
    .filter(step => step.texto);
};

module.exports = { normalizeInstructions };
