import test from 'node:test';
import assert from 'node:assert/strict';

import pool from '../db/db.js';
import { toggleEstadoProducto, createVariante } from '../controllers/productoController.js';
import { crearPedido } from '../controllers/pedidoController.js';
import { getTiendaPublica } from '../controllers/comercioController.js';
import { agregarProducto } from '../controllers/carritoController.js';

function createMockRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test('toggleEstadoProducto devuelve 404 cuando el producto no existe', async () => {
  const originalQuery = pool.query;
  pool.query = async () => ({ rows: [] });

  const req = { params: { id: 9999 }, body: { activo: false } };
  const res = createMockRes();

  await toggleEstadoProducto(req, res);

  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.body, { error: 'Producto no encontrado' });

  pool.query = originalQuery;
});

test('toggleEstadoProducto actualiza activo/inactivo correctamente', async () => {
  const originalQuery = pool.query;
  let capturedParams = null;

  pool.query = async (_sql, params) => {
    capturedParams = params;
    return { rows: [{ id_producto: 10, activo: false }] };
  };

  const req = { params: { id: 10 }, body: { activo: false } };
  const res = createMockRes();

  await toggleEstadoProducto(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { id_producto: 10, activo: false });
  assert.deepEqual(capturedParams, [false, 10]);

  pool.query = originalQuery;
});

test('createVariante valida datos obligatorios y devuelve 400', async () => {
  const originalQuery = pool.query;
  let queryCalled = false;

  pool.query = async () => {
    queryCalled = true;
    return { rows: [] };
  };

  const req = { body: { id_producto: 1, precio: 1200 } };
  const res = createMockRes();

  await createVariante(req, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { error: 'Faltan datos obligatorios' });
  assert.equal(queryCalled, false);

  pool.query = originalQuery;
});

test('crearPedido devuelve 400 cuando el carrito esta vacio', async () => {
  const originalQuery = pool.query;

  pool.query = async (sql) => {
    if (sql.includes('SELECT shipping_price FROM comercio')) return { rows: [{ shipping_price: 0 }] };
    if (sql === 'BEGIN') return { rows: [] };
    if (sql.includes('FROM m_n_prod_carrito')) return { rows: [] };
    if (sql === 'ROLLBACK') return { rows: [] };
    return { rows: [] };
  };

  const req = {
    body: {
      id_carrito: 77,
      id_consumidor: 5,
      id_comercio: 3,
      total: 1000,
      id_pago: 2,
      id_envio: 1,
    },
  };
  const res = createMockRes();

  await crearPedido(req, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { error: 'El carrito está vacío o ya fue procesado.' });

  pool.query = originalQuery;
});

test('crearPedido devuelve 400 cuando hay stock insuficiente en variante', async () => {
  const originalQuery = pool.query;

  pool.query = async (sql) => {
    if (sql.includes('SELECT shipping_price FROM comercio')) return { rows: [{ shipping_price: 0 }] };
    if (sql === 'BEGIN') return { rows: [] };
    if (sql.includes('FROM m_n_prod_carrito')) {
      return {
        rows: [{ id_producto: 1, id_variante: 9, cantidad: 3, precio_unitario: 1500 }],
      };
    }
    if (sql.includes('INSERT INTO pedido')) return { rows: [{ id_pedido: 123 }] };
    if (sql.includes('INSERT INTO detalle_pedido')) return { rows: [] };
    if (sql.includes('SELECT stock FROM variante')) return { rows: [{ stock: 1 }] };
    if (sql === 'ROLLBACK') return { rows: [] };
    return { rows: [] };
  };

  const req = {
    body: {
      id_carrito: 77,
      id_consumidor: 5,
      id_comercio: 3,
      total: 1000,
      id_pago: 2,
      id_envio: 1,
    },
  };
  const res = createMockRes();

  await crearPedido(req, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { error: 'Stock insuficiente para la variante solicitada' });

  pool.query = originalQuery;
});

test('getTiendaPublica consulta solo productos activos para no mostrar inactivos', async () => {
  const originalQuery = pool.query;
  let validatedActiveFilter = false;
  let productQueryCount = 0;

  pool.query = async (sql) => {
    if (sql.includes('FROM comercio WHERE slug = $1 AND activo = true')) {
      return { rows: [{ id_comercio: 1, nombre_comercio: 'Demo', activo: true }] };
    }
    if (sql.includes('FROM categoria WHERE id_comercio = $1')) {
      return { rows: [] };
    }
    if (sql.includes('FROM producto WHERE id_comercio = $1')) {
      productQueryCount += 1;
      if (sql.includes('activo = true')) validatedActiveFilter = true;
      return {
        rows: [
          { id_producto: 1, nombre: 'Producto visible', activo: true },
        ],
      };
    }
    if (sql.includes('SELECT * FROM variante WHERE id_producto = $1')) {
      return { rows: [] };
    }
    if (sql.includes('FROM categoria c') && sql.includes('m_n_cat_prod')) {
      return { rows: [] };
    }
    return { rows: [] };
  };

  const req = { params: { slug: 'mi-tienda' } };
  const res = createMockRes();

  await getTiendaPublica(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(productQueryCount, 1);
  assert.equal(validatedActiveFilter, true);
  assert.equal(Array.isArray(res.body.productos), true);
  assert.equal(res.body.productos.length, 1);
  assert.equal(res.body.productos[0].activo, true);

  pool.query = originalQuery;
});

test('agregarProducto bloquea sumar al carrito cuando la variante no tiene stock', async () => {
  const originalQuery = pool.query;

  pool.query = async (sql) => {
    if (sql.includes('FROM producto') && sql.includes('id_comercio = $2')) {
      return { rows: [{ id_producto: 1, activo: true }] };
    }
    if (sql.includes('FROM variante') && sql.includes('id_variante = $1')) {
      return { rows: [{ stock: 0 }] };
    }
    return { rows: [] };
  };

  const req = {
    body: {
      id_consumidor: 3,
      id_comercio: 1,
      id_producto: 1,
      id_variante: 55,
      cantidad: 1,
    },
  };
  const res = createMockRes();

  await agregarProducto(req, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    error: 'Producto sin stock temporal. Podés verlo, pero no sumarlo al carrito.',
  });

  pool.query = originalQuery;
});
