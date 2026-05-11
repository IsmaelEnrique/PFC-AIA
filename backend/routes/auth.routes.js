import express from "express";
/*import { 
  registrarUsuario,      // Para el vendedor (Panel Admin)
  //registrarConsumidor,   // 🚀 AGREGADO: Para el cliente (Tienda)
  verificarCuenta, 
  reenviarVerificacion,
  loginUsuario           // Función única que maneja ambos logins
} from "../controllers/auth.controller.js";
*/
import {
 registrarUsuario,
 loginUsuario,
 verificarCuenta,
 reenviarVerificacion,
 activarCuenta
} from "../controllers/auth.controller.js";
const router = express.Router();

// --- RUTAS DE REGISTRO ---
router.post("/registrar", registrarUsuario);
//router.post("/registrar-consumidor", registrarConsumidor); // 👈 Esta es la que faltaba

// --- RUTAS DE SESIÓN ---
router.post("/login", loginUsuario); 

// --- RUTAS DE VERIFICACIÓN ---
router.get("/verificar", verificarCuenta);
router.post("/reenviar-verificacion", reenviarVerificacion);

//Activar cuenta
router.post("/activar", activarCuenta);

export default router;

router.get("/", (req,res)=>{
 res.send("AUTH OK");
});