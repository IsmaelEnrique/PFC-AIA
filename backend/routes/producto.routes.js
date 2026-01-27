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

// Rutas de variantes (primero para evitar conflictos)
router.get("/:id_producto/variantes", getVariantes);
router.post("/:id_producto/variantes", createVariante);
router.put("/variantes/:id", updateVariante);
router.delete("/variantes/:id", deleteVariante);

// Rutas de productos
router.get("/", getProductos);
router.get("/:id", getProductoById);
router.get("/:id/caracteristicas", getCaracteristicasProducto);
router.post("/", createProducto);
router.put("/:id", updateProducto);
router.delete("/:id", deleteProducto);
router.patch("/:id/estado", toggleEstadoProducto);

export default router;
