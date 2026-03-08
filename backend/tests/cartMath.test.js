import test from 'node:test';
import assert from 'node:assert/strict';

import { calcularSubtotal, calcularTotal } from '../../frontend/src/utils/cartMath.js';

test('calcularSubtotal y calcularTotal con producto simple (sin variante)', () => {
  const items = [
    {
      key: '10',
      id_producto: 10,
      id_variante: null,
      precio: 1500,
      cantidad: 2,
    },
  ];

  const subtotal = calcularSubtotal(items);
  const total = calcularTotal(items);

  assert.equal(subtotal, 3000);
  assert.equal(total, 3000);
});

test('calcularSubtotal y calcularTotal con productos mezclados (con y sin variante)', () => {
  const items = [
    {
      key: '10',
      id_producto: 10,
      id_variante: null,
      precio: 1200,
      cantidad: 1,
    },
    {
      key: '11-2',
      id_producto: 11,
      id_variante: 2,
      precio: 1800,
      cantidad: 3,
    },
  ];

  const subtotal = calcularSubtotal(items);
  const total = calcularTotal(items);

  assert.equal(subtotal, 6600);
  assert.equal(total, 6600);
});
