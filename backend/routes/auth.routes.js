import express from "express";
import { 
  registrarUsuario, 
  verificarCuenta, 
  reenviarVerificacion,
  loginUsuario
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/registrar", registrarUsuario);
router.get("/verificar/:token", verificarCuenta);
router.post("/reenviar-verificacion", reenviarVerificacion);
router.post("/login", loginUsuario); 

export default router;