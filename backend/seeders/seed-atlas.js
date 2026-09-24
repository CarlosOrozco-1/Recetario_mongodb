const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI no definido en .env");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✅ Conectado a Atlas (driver nativo)");

    const db = client.db("recetario");
    const users = db.collection("users");
    const recipes = db.collection("recipes");

    await users.deleteMany({});
    await recipes.deleteMany({});
    console.log("🗑️ Datos previos limpiados");

    const password = await bcrypt.hash("12345678", 10);
    const userResult = await users.insertOne({
      name: "Carlos Demo",
      email: "demo@test.com",
      password,
      bio: "Chef aficionado probando la app",
      avatar: "",
      stats: {
        recetasCount: 0,
        seguidoresCount: 0,
        siguiendoCount: 0,
        favoritosCount: 0,
      },
      favoritos: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const userId = userResult.insertedId;
    console.log("👤 Usuario creado:", "demo@test.com", "(password: 12345678)");

    const recipesData = [
      {
        titulo: "Tacos al Pastor",
        descripcion: "Tacos mexicanos tradicionales con piña",
        ingredientes: ["Tortillas de maíz", "Carne de cerdo", "Piña", "Cilantro", "Cebolla", "Salsa"],
        instrucciones: "1. Marinar carne con achiote y chiles\n2. Cocinar en trompo o sartén\n3. Servir en tortillas con piña, cilantro y cebolla\n4. Acompañar con salsa verde",
        categoria: "Plato Principal",
        tiempoPreparacion: 45,
        dificultad: "Media",
        porciones: 4,
        publica: true,
        usuario: userId,
        hashtags: ["mexicano", "tacos", "almuerzo"],
        imagen: "",
        favorito: false,
        likes: [],
        likesCount: 0,
        guardados: [],
        guardadosCount: 0,
        comentariosCount: 0,
        ratingPromedio: 0,
        ratingCount: 0,
        compartidosCount: 0,
        reportado: false,
        reportes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        titulo: "Guacamole Casero",
        descripcion: "El acompañamiento perfecto para totopos",
        ingredientes: ["3 aguacates maduros", "1 tomate", "1/4 cebolla", "Cilantro", "1 limón", "Sal al gusto"],
        instrucciones: "1. Machacar aguacates en molcajete\n2. Picar tomate, cebolla y cilantro finamente\n3. Mezclar todo con jugo de limón y sal\n4. Servir inmediatamente con totopos",
        categoria: "Entrada",
        tiempoPreparacion: 10,
        dificultad: "Fácil",
        porciones: 6,
        publica: true,
        usuario: userId,
        hashtags: ["mexicano", "dip", "vegano"],
        imagen: "",
        favorito: false,
        likes: [],
        likesCount: 0,
        guardados: [],
        guardadosCount: 0,
        comentariosCount: 0,
        ratingPromedio: 0,
        ratingCount: 0,
        compartidosCount: 0,
        reportado: false,
        reportes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        titulo: "Chilaquiles Verdes",
        descripcion: "Desayuno mexicano clásico",
        ingredientes: ["Tortillas de maíz", "Salsa verde", "Crema", "Queso fresco", "Cebolla", "Pollo deshebrado (opcional)"],
        instrucciones: "1. Cortar tortillas en triángulos y freír\n2. Bañar en salsa verde caliente\n3. Servir con crema, queso, cebolla y pollo\n4. Acompañar con frijoles",
        categoria: "Desayuno",
        tiempoPreparacion: 25,
        dificultad: "Fácil",
        porciones: 3,
        publica: true,
        usuario: userId,
        hashtags: ["mexicano", "desayuno", "picante"],
        imagen: "",
        favorito: false,
        likes: [],
        likesCount: 0,
        guardados: [],
        guardadosCount: 0,
        comentariosCount: 0,
        ratingPromedio: 0,
        ratingCount: 0,
        compartidosCount: 0,
        reportado: false,
        reportes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        titulo: "Flan de Leche Condensada",
        descripcion: "Postre clásico cremoso y dulce",
        ingredientes: ["1 lata leche condensada", "1 lata leche evaporada", "4 huevos", "1 cda vainilla", "1 taza azúcar (para caramelo)"],
        instrucciones: "1. Hacer caramelo con azúcar y cubrir molde\n2. Licuar leches, huevos y vainilla\n4. Verter en molde y hornear a baño maría 45 min\n5. Enfriar y desmoldar",
        categoria: "Postre",
        tiempoPreparacion: 60,
        dificultad: "Media",
        porciones: 8,
        publica: true,
        usuario: userId,
        hashtags: ["postre", "flan", "dulce"],
        imagen: "",
        favorito: false,
        likes: [],
        likesCount: 0,
        guardados: [],
        guardadosCount: 0,
        comentariosCount: 0,
        ratingPromedio: 0,
        ratingCount: 0,
        compartidosCount: 0,
        reportado: false,
        reportes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        titulo: "Agua de Jamaica",
        descripcion: "Bebida refrescante tradicional",
        ingredientes: ["1 taza flores de jamaica", "8 tazas agua", "1/2 taza azúcar", "Hielo"],
        instrucciones: "1. Hervir flores de jamaica en 4 tazas agua 10 min\n2. Colar y agregar azúcar y resto del agua\n3. Enfriar y servir con hielo",
        categoria: "Bebida",
        tiempoPreparacion: 15,
        dificultad: "Fácil",
        porciones: 8,
        publica: true,
        usuario: userId,
        hashtags: ["bebida", "refrescante", "tradicional"],
        imagen: "",
        favorito: false,
        likes: [],
        likesCount: 0,
        guardados: [],
        guardadosCount: 0,
        comentariosCount: 0,
        ratingPromedio: 0,
        ratingCount: 0,
        compartidosCount: 0,
        reportado: false,
        reportes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await recipes.insertMany(recipesData);
    console.log(`🍽️ ${recipesData.length} recetas creadas`);

    // Actualizar contador de recetas del usuario
    await users.updateOne({ _id: userId }, { $set: { "stats.recetasCount": recipesData.length } });

    console.log("✅ Seed completado exitosamente");
  } catch (error) {
    console.error("❌ Error en seed:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("🔌 Desconectado de Atlas");
  }
}

seed();