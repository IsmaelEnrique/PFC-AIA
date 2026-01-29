import express from "express";
import {
  getUsuarios,
  createUsuario,
  loginUsuario,
  getUsuarioById,
  updatePerfilUsuario
} from "../controllers/usuarioController.js";

const router = express.Router();

router.get("/", getUsuarios);
router.get("/:id", getUsuarioById);
router.post("/", createUsuario);
router.post("/login", loginUsuario);
router.put("/perfil", updatePerfilUsuario);

export default router;