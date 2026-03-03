import express from 'express';
import * as carritoController from '../controllers/carritoController.js';

const router = express.Router();

// Obtener carrito de un consumidor para un comercio
router.get('/', carritoController.obtenerCarrito);

// DEBUG route to inspect carritos/items for a consumidor
router.get('/debug/consumer/:id_consumidor', carritoController.debugCarrito);

// Agregar producto al carrito
router.post('/agregar', carritoController.agregarProducto);

// Actualizar cantidad de un producto
router.put('/actualizar', carritoController.actualizarCantidad);

// Eliminar producto del carrito (usa query: id_carrito, id_producto, optional id_variante)
router.delete('/eliminar', carritoController.eliminarProducto);

// Vaciar carrito
router.delete('/vaciar/:id_carrito', carritoController.vaciarCarrito);

export default router;
