import express from 'express';
import {
	actualizarEstadoPedido,
	crearPedido,
	listarPedidosPorComercio,
	testNotify,
} from '../controllers/pedidoController.js';

const router = express.Router();

router.post('/', crearPedido);
router.post('/:id_pedido/test-notify', testNotify);
router.get('/comercio/:id_comercio', listarPedidosPorComercio);
router.patch('/:id_pedido/estado', actualizarEstadoPedido);

export default router;
