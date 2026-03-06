import express from 'express';
// Importamos los controladores que ya tenés
import { crearPreferencia, recibirConfirmacionPago } from '../controllers/pagoControllers.js';

const router = express.Router();

// 🚀 ESTA ES LA LÍNEA CLAVE: Debe ser .post y coincidir con el nombre
router.post("/crear-preferencia", crearPreferencia); 

// Esta es para cuando vuelve de Mercado Pago
router.get("/callback", recibirConfirmacionPago);

export default router;