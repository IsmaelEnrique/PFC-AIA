import express from "express";
import {
  getUsuarios,
  createUsuario,
  loginUsuario
} from "../controllers/usuarioController.js";

const router = express.Router();

router.get("/", getUsuarios);
router.post("/", createUsuario);

// 🔐 LOGIN
router.post("/login", loginUsuario);

export default router;
