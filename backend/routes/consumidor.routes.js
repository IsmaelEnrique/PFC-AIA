import express from 'express';
import * as consumidorController from '../controllers/consumidorController.js';

const router = express.Router();

// Registrar consumidor
router.post('/registro', consumidorController.registrarConsumidor);

// Listar consumidores por comercio (debug)
router.get('/', consumidorController.listarConsumidores);

// Login de consumidor
router.post('/login', consumidorController.loginConsumidor);

// Migrar carrito de localStorage a BD
router.post('/migrar-carrito', consumidorController.migrarCarrito);

export default router;
