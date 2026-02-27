import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import usuarioRoutes from "./routes/usuario.routes.js";
import comercioRoutes from "./routes/comercio.routes.js";
import categoriaRoutes from "./routes/categoria.routes.js";
import productoRoutes from "./routes/producto.routes.js";
import caracteristicaRoutes from "./routes/caracteristica.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import carritoRoutes from "./routes/carrito.routes.js";
import consumidorRoutes from "./routes/consumidor.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config(); //Lee el archivo .env y carga las variables en process.env.

const app = express();

app.use(cors({
  origin: "http://localhost:5173"
}));
app.use(express.json());

// Servir carpeta de uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/comercio", comercioRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/categorias", categoriaRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/caracteristicas", caracteristicaRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/carrito", carritoRoutes);
app.use("/api/consumidor", consumidorRoutes);

// 🔴 SERVER
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});