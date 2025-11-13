import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import usuarioRoutes from "./routes/usuario.js";

// 🔹 Cargar variables de entorno (.env)
dotenv.config();

// 🔹 Inicializar Express
const app = express();

// 🔹 Middlewares globales
app.use(cors());
app.use(express.json());

// 🔹 Registrar rutas
app.use("/api/usuarios", usuarioRoutes);

// 🔹 Verificar que las rutas se hayan cargado correctamente
if (app._router && app._router.stack) {
  console.log("🛠 Rutas registradas:");
  app._router.stack.forEach((middleware) => {
    if (middleware.name === "router" && middleware.handle.stack) {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route && handler.route.path) {
          const methods = Object.keys(handler.route.methods).join(", ").toUpperCase();
          console.log(`➡️  ${methods} ${handler.route.path}`);
        }
      });
    }
  });
} else {
  console.log("⚠️ No se detectó app._router. Puede que Express no haya cargado correctamente las rutas.");
}

// 🔹 Puerto de escucha (seguro)
const PORT = (typeof process !== "undefined" && process.env && process.env.PORT)
  ? process.env.PORT
  : 4000;

// 🔹 Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});

export default app;
