import test from 'node:test';
import assert from 'node:assert/strict';

import {
  generarFacturaHTML,
  plantillaVerificacion,
  generarMailSeguimiento,
} from '../utils/emailTemplates.js';

test('plantillaVerificacion incluye nombre y enlace de verificacion', () => {
  const nombre = 'Ana';
  const url = 'https://example.com/verificar/token123';

  const html = plantillaVerificacion(nombre, url);

  assert.match(html, /Bienvenido a Emprendify/i);
  assert.match(html, /Verificar mi cuenta/i);
  assert.ok(html.includes(`<b>${nombre}</b>`));
  assert.ok(html.includes(url));
  assert.match(html, /24 horas/i);
});

test('generarFacturaHTML renderiza numero de pedido, items y total', () => {
  const pedido = { numero_pedido: 456, total: 3200 };
  const detalles = [
    { id_producto: 10, cantidad: 2, precio: 1000 },
    { id_producto: 11, cantidad: 1, precio: 1200 },
  ];

  const html = generarFacturaHTML(pedido, detalles, 'Lucas');

  assert.ok(html.includes('Pedido #456'));
  assert.ok(html.includes('Producto #10'));
  assert.ok(html.includes('Producto #11'));
  assert.ok(html.includes('>2</td>'));
  assert.ok(html.includes('>1</td>'));
  assert.ok(html.includes('Total Pagado: $3200'));
});

test('generarMailSeguimiento usa plantilla especifica para estado Enviado', () => {
  const pedido = {
    numero_pedido: 99,
    total: 8500,
    comercio: { nombre_comercio: 'Kiosco Norte' },
  };

  const html = generarMailSeguimiento(pedido, 'Enviado', 'Marta');

  assert.match(html, /Pedido en camino/i);
  assert.ok(html.includes('Kiosco Norte'));
  assert.ok(html.includes('#99'));
  assert.ok(html.includes('$8500'));
});

test('generarMailSeguimiento fallback para estado no contemplado', () => {
  const pedido = {
    numero_pedido: 100,
    total: 1000,
    comercio: { nombre_comercio: 'Demo Shop' },
  };

  const html = generarMailSeguimiento(pedido, 'Demorado', 'Juan');

  assert.match(html, /Actualizacion de Pedido|Actualización de Pedido/i);
  assert.ok(html.includes('Demorado'));
  assert.ok(html.includes('Demo Shop'));
});

test('generarFacturaHTML soporta detalle vacio sin romper estructura', () => {
  const pedido = { numero_pedido: 1, total: 0 };

  const html = generarFacturaHTML(pedido, [], 'Cliente');

  assert.ok(html.includes('Pedido #1'));
  assert.ok(html.includes('<tbody></tbody>'));
  assert.ok(html.includes('Total Pagado: $0'));
});

test('generarMailSeguimiento incluye contenido de estado Cancelado', () => {
  const pedido = {
    numero_pedido: 222,
    total: 5000,
    comercio: { nombre_comercio: 'Mercado Centro' },
  };

  const html = generarMailSeguimiento(pedido, 'Cancelado', 'Luz');

  assert.match(html, /Pedido Cancelado/i);
  assert.match(html, /ha sido cancelado/i);
  assert.ok(html.includes('#222'));
});

test('generarMailSeguimiento incluye contenido de estado Confirmado', () => {
  const pedido = {
    numero_pedido: 333,
    total: 8900,
    comercio: { nombre_comercio: 'Tienda Sur' },
  };

  const html = generarMailSeguimiento(pedido, 'Confirmado', 'Pablo');

  assert.match(html, /Pedido Confirmado/i);
  assert.match(html, /pago fue verificado/i);
  assert.ok(html.includes('Tienda Sur'));
});

test('plantillaVerificacion mantiene boton de accion visible', () => {
  const html = plantillaVerificacion('Mila', 'https://example.com/ok');

  assert.match(html, /<a href="https:\/\/example.com\/ok"/i);
  assert.match(html, /Verificar mi cuenta/i);
});
