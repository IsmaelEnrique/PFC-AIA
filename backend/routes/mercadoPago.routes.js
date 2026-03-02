import express from "express";
import { vincularVendedor } from "../controllers/mercadoPagoController.js";

const router = express.Router();

// Esta ruta será: http://localhost:4000/api/pagos/callback
router.get("/callback", vincularVendedor);

export default router;