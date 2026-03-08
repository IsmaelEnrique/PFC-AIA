import express from "express";
import { 
  registrarUsuario,      // Para el vendedor (Panel Admin)
  //registrarConsumidor,   // 🚀 AGREGADO: Para el cliente (Tienda)
  verificarCuenta, 
  reenviarVerificacion,
  loginUsuario           // Función única que maneja ambos logins
} from "../controllers/auth.controller.js";

const router = express.Router();

// --- RUTAS DE REGISTRO ---
router.post("/registrar", registrarUsuario);
//router.post("/registrar-consumidor", registrarConsumidor); // 👈 Esta es la que faltaba

// --- RUTAS DE SESIÓN ---
router.post("/login", loginUsuario); 

// --- RUTAS DE VERIFICACIÓN ---
router.get("/verificar/:token", verificarCuenta);
router.post("/reenviar-verificacion", reenviarVerificacion);

export default router;