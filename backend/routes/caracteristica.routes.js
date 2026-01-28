import express from "express";
import {
  getCaracteristicas,
  getCaracteristicaById,
  createCaracteristica,
  updateCaracteristica,
  deleteCaracteristica,
  getValores,
  createValor,
  deleteValor,
} from "../controllers/caracteristicaController.js";

const router = express.Router();

// IMPORTANTE: Rutas específicas ANTES de rutas con parámetros
// Rutas de valores (deben ir antes de /:id)
router.get("/valores", getValores);
router.post("/valores", createValor);
router.delete("/valores/:id", deleteValor);

// Rutas de características
router.get("/", getCaracteristicas);
router.get("/:id", getCaracteristicaById);
router.post("/", createCaracteristica);
router.put("/:id", updateCaracteristica);
router.delete("/:id", deleteCaracteristica);

export default router;
