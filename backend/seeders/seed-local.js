const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

const LOCAL_DATABASE = "recetario_local";
const SEED_TAG = "seed-local-v1";
const SEED_PASSWORD = "PruebasLocal2026!";

const seedUsers = [
  {
    name: "Sofía Martínez",
    email: "sofia.seed@recetario.local",
    bio: "Me gusta compartir recetas caseras y sabores de temporada.",
    avatar: "",
    stats: { recetasCount: 0, seguidoresCount: 2, siguiendoCount: 1 },
  },
  {
    name: "Mateo Ríos",
    email: "mateo.seed@recetario.local",
    bio: "Cocinero de fin de semana. Fan de los platos sencillos.",
    avatar: "",
    stats: { recetasCount: 0, seguidoresCount: 1, siguiendoCount: 2 },
  },
];

const seedRecipes = [
  {
    titulo: "Tacos de setas al pastor",
    descripcion: "Setas doradas con adobo suave, piña y cilantro fresco.",
    ingredientes: ["400 g de setas", "2 cucharadas de adobo", "4 tortillas", "1/2 taza de piña", "Cilantro", "1 limón"],
    instrucciones: [
      "Paso 1. Corta las setas en tiras y mézclalas con el adobo.",
      "Paso 2. Déjalas reposar durante 10 minutos para que tomen sabor.",
      "Paso 3. Dóralas en una sartén caliente durante 6 a 8 minutos.",
      "Paso 4. Sirve en tortillas calientes con piña, cilantro y limón.",
    ].join("\n"),
    categoria: "Plato Principal",
    tiempoPreparacion: 25,
    dificultad: "Fácil",
    porciones: 2,
    publica: true,
    hashtags: ["tacos", "vegetariano", "cena"],
    ownerEmail: "sofia.seed@recetario.local",
  },
  {
    titulo: "Pasta cremosa de limón",
    descripcion: "Una pasta rápida, fresca y cremosa para cualquier día.",
    ingredientes: ["200 g de pasta", "1 limón", "100 ml de crema", "40 g de parmesano", "Pimienta negra", "Sal"],
    instrucciones: [
      "Paso 1. Cocina la pasta en agua con sal siguiendo el tiempo del paquete.",
      "Paso 2. Ralla la cáscara del limón y exprime su jugo.",
      "Paso 3. Calienta la crema con el limón y añade el parmesano.",
      "Paso 4. Incorpora la pasta y un poco de agua de cocción; mezcla hasta cubrirla.",
      "Paso 5. Termina con pimienta negra y sirve caliente.",
    ].join("\n"),
    categoria: "Plato Principal",
    tiempoPreparacion: 20,
    dificultad: "Fácil",
    porciones: 2,
    publica: true,
    hashtags: ["pasta", "rapido", "cena"],
    ownerEmail: "mateo.seed@recetario.local",
  },
  {
    titulo: "Pan francés con frutos rojos",
    descripcion: "Desayuno dorado por fuera, suave por dentro y con fruta fresca.",
    ingredientes: ["4 rebanadas de pan", "2 huevos", "100 ml de leche", "1 cucharadita de canela", "Frutos rojos", "Miel"],
    instrucciones: [
      "Paso 1. Bate los huevos con la leche y la canela en un recipiente amplio.",
      "Paso 2. Remoja cada rebanada de pan por ambos lados.",
      "Paso 3. Cocina en una sartén con mantequilla hasta dorar ambos lados.",
      "Paso 4. Sirve con frutos rojos y un poco de miel.",
    ].join("\n"),
    categoria: "Desayuno",
    tiempoPreparacion: 15,
    dificultad: "Fácil",
    porciones: 2,
    publica: true,
    hashtags: ["desayuno", "fruta", "dulce"],
    ownerEmail: "sofia.seed@recetario.local",
  },
  {
    titulo: "Ensalada tibia de garbanzos",
    descripcion: "Garbanzos especiados con vegetales y aderezo de yogur.",
    ingredientes: ["1 lata de garbanzos", "1 pepino", "1 tomate", "100 g de yogur natural", "1 cucharadita de comino", "Hojas de menta"],
    instrucciones: [
      "Paso 1. Enjuaga y escurre los garbanzos.",
      "Paso 2. Saltéalos con comino durante 5 minutos.",
      "Paso 3. Corta el pepino y el tomate en cubos pequeños.",
      "Paso 4. Mezcla el yogur con menta picada y sirve sobre los vegetales y garbanzos tibios.",
    ].join("\n"),
    categoria: "Entrada",
    tiempoPreparacion: 18,
    dificultad: "Fácil",
    porciones: 3,
    publica: true,
    hashtags: ["ensalada", "vegetariano", "garbanzos"],
    ownerEmail: "mateo.seed@recetario.local",
  },
  {
    titulo: "Fresco de Piña",
    descripcion: "Refrescante bebida de piña, ideal para compartir.",
    ingredientes: ["2 tazas de piña fresca", "3 tazas de agua fría", "Azúcar al gusto", "Hielo"],
    instrucciones: [
      "Paso 1. Pela la piña y córtala en cubos.",
      "Paso 2. Licúa la piña con el agua hasta obtener una mezcla uniforme.",
      "Paso 3. Cuela si prefieres una bebida más ligera y endulza al gusto.",
      "Paso 4. Sirve con hielo y disfruta bien fría.",
    ].join("\n"),
    categoria: "Bebida",
    tiempoPreparacion: 10,
    dificultad: "Fácil",
    porciones: 4,
    publica: true,
    hashtags: ["bebida", "piña", "refrescante"],
    ownerEmail: "sofia.seed@recetario.local",
  },
  {
    titulo: "Brownies de cacao",
    descripcion: "Brownies húmedos con una capa fina y crujiente por encima.",
    ingredientes: ["120 g de chocolate", "100 g de mantequilla", "2 huevos", "150 g de azúcar", "70 g de harina", "25 g de cacao"],
    instrucciones: [
      "Paso 1. Precalienta el horno a 175 °C y prepara un molde pequeño.",
      "Paso 2. Derrite el chocolate con la mantequilla y deja templar.",
      "Paso 3. Bate los huevos con el azúcar e incorpora el chocolate.",
      "Paso 4. Añade harina y cacao, mezcla solo hasta integrar.",
      "Paso 5. Hornea de 20 a 24 minutos, deja enfriar y corta en porciones.",
    ].join("\n"),
    categoria: "Postre",
    tiempoPreparacion: 40,
    dificultad: "Media",
    porciones: 8,
    publica: true,
    hashtags: ["postre", "chocolate", "horno"],
    ownerEmail: "mateo.seed@recetario.local",
  },
  {
    titulo: "Sopa de tomate rostizado",
    descripcion: "Sopa reconfortante de tomate asado con albahaca.",
    ingredientes: ["6 tomates", "1/2 cebolla", "2 dientes de ajo", "500 ml de caldo", "Albahaca fresca", "Aceite de oliva"],
    instrucciones: [
      "Paso 1. Corta los tomates y la cebolla; colócalos en una bandeja con el ajo.",
      "Paso 2. Rocía con aceite y rostiza a 210 °C durante 25 minutos.",
      "Paso 3. Licúa los vegetales con el caldo caliente hasta obtener una crema.",
      "Paso 4. Ajusta la sal y sirve con albahaca fresca.",
    ].join("\n"),
    categoria: "Plato Principal",
    tiempoPreparacion: 40,
    dificultad: "Media",
    porciones: 4,
    publica: true,
    hashtags: ["sopa", "tomate", "casero"],
    ownerEmail: "sofia.seed@recetario.local",
  },
  {
    titulo: "Avena nocturna con mango",
    descripcion: "Desayuno preparado con anticipación, cremoso y frutal.",
    ingredientes: ["1 taza de avena", "180 ml de leche", "1/2 taza de yogur", "1 mango", "1 cucharada de chía"],
    instrucciones: [
      "Paso 1. Mezcla la avena, la leche, el yogur y la chía en un frasco.",
      "Paso 2. Tapa y refrigera durante al menos 6 horas.",
      "Paso 3. Corta el mango en cubos y agrégalo antes de servir.",
    ].join("\n"),
    categoria: "Desayuno",
    tiempoPreparacion: 10,
    dificultad: "Fácil",
    porciones: 1,
    publica: false,
    hashtags: ["avena", "desayuno", "mango"],
    ownerEmail: "mateo.seed@recetario.local",
  },
];

async function seedLocal() {
  const toSteps = instructions =>
    (instructions ?? "")
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .map((texto, index) => ({
        orden: index + 1,
        texto: texto.replace(/^Paso\s*\d+\.\s*/i, "").trim(),
      }));
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/recetario_local";
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });

  try {
    await client.connect();
    const connectedDatabase = new URL(uri).pathname.replace(/^\//, "");
    if (connectedDatabase && connectedDatabase !== LOCAL_DATABASE) {
      throw new Error(`El seeder local solo admite la base ${LOCAL_DATABASE}`);
    }
    const db = client.db(LOCAL_DATABASE);
    const users = db.collection("users");
    const recipes = db.collection("recipes");
    const password = await bcrypt.hash(SEED_PASSWORD, 10);
    const now = new Date();

    const userIds = new Map();
    for (const user of seedUsers) {
      const result = await users.findOneAndUpdate(
        { email: user.email },
        {
          $set: {
            ...user,
            password,
            seedTag: SEED_TAG,
            updatedAt: now,
          },
          $setOnInsert: { createdAt: now },
        },
        { upsert: true, returnDocument: "after" }
      );
      const savedUser = result.value ?? result;
      userIds.set(user.email, savedUser._id);
    }

    await recipes.deleteMany({ seedTag: SEED_TAG });
    const recipesToInsert = seedRecipes.map(({ ownerEmail, ...recipe }) => ({
      ...recipe,
      instrucciones: toSteps(recipe.instrucciones),
      usuario: userIds.get(ownerEmail),
      seedTag: SEED_TAG,
      imagen: "",
      likesCount: 0,
      guardadosCount: 0,
      comentariosCount: 0,
      ratingPromedio: 0,
      ratingCount: 0,
      compartidosCount: 0,
      createdAt: now,
      updatedAt: now,
    }));
    await recipes.insertMany(recipesToInsert);

    for (const user of seedUsers) {
      const count = recipesToInsert.filter(recipe => recipe.usuario.equals(userIds.get(user.email))).length;
      await users.updateOne({ _id: userIds.get(user.email) }, { $set: { "stats.recetasCount": count } });
    }

    const publicCount = recipesToInsert.filter(recipe => recipe.publica).length;
    console.log(`Seed local listo: ${seedUsers.length} usuarios, ${recipesToInsert.length} recetas (${publicCount} públicas y ${recipesToInsert.length - publicCount} privada).`);
    console.log(`Base: ${LOCAL_DATABASE}; contraseña de ambos usuarios: ${SEED_PASSWORD}`);
    console.log("Cuentas: sofia.seed@recetario.local, mateo.seed@recetario.local");
  } catch (error) {
    console.error("Error al cargar los datos locales de prueba:", error.message);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  seedLocal();
}
