import express from "express";
import {
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
  toggleEstadoProducto,
  getCaracteristicasProducto,
  getVariantes,
  createVariante,
  updateVariante,
  deleteVariante,
} from "../controllers/productoController.js";

const router = express.Router();

// Rutas de productos con subrutas (deben ir ANTES de /:id)
router.get("/:id_producto/variantes", getVariantes);
router.post("/:id_producto/variantes", createVariante);
router.get("/:id_producto/caracteristicas", getCaracteristicasProducto);

// Rutas de variantes
router.put("/variantes/:id", updateVariante);
router.delete("/variantes/:id", deleteVariante);

// Rutas de productos
router.get("/", getProductos);
router.post("/", createProducto);
router.patch("/:id/estado", toggleEstadoProducto);
router.get("/:id", getProductoById);  // Esta debe ir AL FINAL
router.put("/:id", updateProducto);
router.delete("/:id", deleteProducto);

export default router;
