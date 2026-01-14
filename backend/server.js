import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import usuarioRoutes from "./routes/usuario.routes.js";

dotenv.config(); //Lee el archivo .env y carga las variables en process.env.

const app = express();


app.use(cors({
  origin: "http://localhost:5173"
}));
app.use(express.json());



app.use("/api/usuarios", usuarioRoutes);

// 🔴 SERVER
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});
