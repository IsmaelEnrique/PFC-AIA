import express from 'express';
import * as carritoController from '../controllers/carritoController.js';

const router = express.Router();

// Obtener carrito de un consumidor para un comercio
router.get('/', carritoController.obtenerCarrito);

// Agregar producto al carrito
router.post('/agregar', carritoController.agregarProducto);

// Actualizar cantidad de un producto
router.put('/actualizar', carritoController.actualizarCantidad);

// Eliminar producto del carrito
router.delete('/eliminar/:id_prod_carrito', carritoController.eliminarProducto);

// Vaciar carrito
router.delete('/vaciar/:id_carrito', carritoController.vaciarCarrito);

export default router;
