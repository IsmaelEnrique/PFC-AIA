import express from "express";
import { getUsuarios, createUsuario } from "../controllers/usuarioController.js";

const router = express.Router();

// ✅ Definición de rutas
router.get("/", getUsuarios);
router.post("/", createUsuario);

export default router;
