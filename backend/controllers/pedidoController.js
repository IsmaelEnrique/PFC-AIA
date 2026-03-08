import pool from "../db/db.js";
import { sendEmail } from '../controllers/mailer.controller.js';
//import { sendEmail } from '../utils/mailer.js';
import { generarMailSeguimiento } from '../utils/emailTemplates.js';

const ESTADOS_PEDIDO_VALIDOS = [
  'Pendiente',
  'En preparación',
  'Enviado',
  'Entregado',
  'Cancelado',
  'En espera',
  'Confirmado',
  'Retirado',
];

function generateOrderNumber() {
  // Keep numero_pedido short to fit VARCHAR(20) in DB (e.g. ORD-<8digits><3digits> = 15 chars)
  const nowSlice = Date.now().toString().slice(-8);
  const rand = Math.floor(Math.random() * 900).toString().padStart(3, '0');
  return `ORD-${nowSlice}${rand}`;
}

// --- FUNCIÓN DE APOYO PARA NOTIFICACIONES ---
/*const notificarSeguimientoCliente = async (id_pedido, nuevoEstado) => {
  try {
    const result = await pool.query(
      `SELECT p.numero_pedido, p.total, p.id_envio, 
              c.mail AS cliente_mail, c.nombre AS cliente_nombre,
              com.nombre_comercio
       FROM pedido p
       JOIN consumidor c ON p.id_consumidor = c.id_consumidor
       JOIN comercio com ON p.id_comercio = com.id_comercio
       WHERE p.id_pedido = $1`,
      [id_pedido]
    );

    const datos = result.rows[0];

    if (datos) {
      const html = generarMailSeguimiento(
        { 
          numero_pedido: datos.numero_pedido, 
          total: datos.total, 
          id_envio: datos.id_envio,
          comercio: { nombre_comercio: datos.nombre_comercio }
        }, 
        nuevoEstado, 
        datos.cliente_nombre
      );

      await sendEmail(
        datos.cliente_mail,
        `Actualización de tu pedido #${datos.numero_pedido}: ${nuevoEstado}`,
        html
      );
      console.log(`✅ Mail de seguimiento enviado a ${datos.cliente_mail}`);
    }
  } catch (error) {
    console.error("❌ Error en notificación de seguimiento:", error.message);
  }
};
*/
const notificarSeguimientoCliente = async (id_pedido, nuevoEstado) => {
  try {
    // 🔍 Buscamos los datos REALES del cliente para este pedido
    const result = await pool.query(
      `SELECT p.numero_pedido, p.total, p.id_envio, 
              c.mail AS cliente_mail, c.nombre AS cliente_nombre,
              com.nombre_comercio
       FROM pedido p
       JOIN consumidor c ON p.id_consumidor = c.id_consumidor
       JOIN comercio com ON p.id_comercio = com.id_comercio
       WHERE p.id_pedido = $1`,
      [id_pedido]
    );

    const datos = result.rows[0];

    if (datos && datos.cliente_mail) {
      const html = generarMailSeguimiento(
        { 
          numero_pedido: datos.numero_pedido, 
          total: datos.total, 
          id_envio: datos.id_envio,
          comercio: { nombre_comercio: datos.nombre_comercio }
        }, 
        nuevoEstado, 
        datos.cliente_nombre
      );

      // 🚀 ¡CLAVE! Aquí usamos 'datos.cliente_mail', NO 'process.env.EMAIL_USER'
      await sendEmail(
        datos.cliente_mail, 
        `Novedades de tu pedido #${datos.numero_pedido}: ${nuevoEstado}`,
        html
      );
      console.log(`📧 Mail enviado con éxito a: ${datos.cliente_mail}`);
    }
  } catch (error) {
    console.error("❌ Error enviando mail:", error.message);
  }
};

// ... mantener crearPedido y listarPedidosPorComercio igual que antes ...

export const crearPedido = async (req, res) => {
  try {
    const { id_carrito, id_consumidor, id_comercio, total, id_pago, id_envio,
      calle, numero, piso, localidad, provincia, codigo_postal } = req.body;

    if (!id_carrito || !id_consumidor || !id_comercio || !id_pago || !id_envio) {
      return res.status(400).json({ error: 'Faltan datos requeridos para crear el pedido' });
    }

    // Obtener precio de envío del comercio y sumarlo al total si corresponde
    let finalTotal = parseFloat(total) || 0;
    try {
      const comercioRes = await pool.query("SELECT shipping_price FROM comercio WHERE id_comercio = $1", [id_comercio]);
      if (comercioRes.rows.length) {
        const sp = comercioRes.rows[0].shipping_price;
        // Asumimos id_envio === 2 corresponde a 'envío por correo'
        if (Number(id_envio) === 2 && sp !== null && sp !== undefined) {
          finalTotal = Number((finalTotal + parseFloat(sp)).toFixed(2));
        }
      }
    } catch (err) {
      console.warn('No se pudo recuperar shipping_price para calcular total:', err.message);
    }

    const numero_pedido = generateOrderNumber();
    const fecha = new Date();
    const estado = 'En espera';

    // Use a transaction: lock cart items, insert pedido, insert detalle_pedido rows, update variant stock, clear carrito.
    await pool.query('BEGIN');

    // Lock rows to avoid duplicate order creation on double-submit/race conditions.
    const itemsRes = await pool.query(
      `SELECT mpc.id_producto, mpc.id_variante, mpc.cantidad,
        COALESCE(NULLIF(mpc.precio_unitario, 0), v.precio, 0) as precio_unitario
       FROM m_n_prod_carrito mpc
       LEFT JOIN variante v ON mpc.id_variante = v.id_variante
       WHERE mpc.id_carrito = $1
       FOR UPDATE`,
      [id_carrito]
    );

    if (!itemsRes.rows.length) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: 'El carrito está vacío o ya fue procesado.' });
    }

    const insert = await pool.query(
      `INSERT INTO pedido (numero_pedido, id_carrito, id_consumidor, id_comercio, fecha, total, id_pago, id_envio, estado, calle, numero, piso, localidad, provincia, codigo_postal)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [numero_pedido, id_carrito, id_consumidor, id_comercio, fecha, finalTotal, id_pago, id_envio, estado, calle || null, numero || null, piso || null, localidad || null, provincia || null, codigo_postal || null]
    );

    const pedidoRow = insert.rows[0];

    for (const item of itemsRes.rows) {
      // Insert detalle
      await pool.query(
        `INSERT INTO detalle_pedido (id_pedido, id_producto, id_variante, cantidad, precio) VALUES ($1,$2,$3,$4,$5)`,
        [pedidoRow.id_pedido, item.id_producto, item.id_variante || null, item.cantidad, item.precio_unitario]
      );

      // Decrementar stock por variante si aplica
      if (item.id_variante) {
        // Verificar stock actual
        const varRes = await pool.query('SELECT stock FROM variante WHERE id_variante = $1', [item.id_variante]);
        const currentStock = varRes.rows[0] ? Number(varRes.rows[0].stock) : null;
        if (currentStock === null) {
          await pool.query('ROLLBACK');
          return res.status(400).json({ error: 'Variante no encontrada' });
        }
        if (currentStock < Number(item.cantidad)) {
          await pool.query('ROLLBACK');
          return res.status(400).json({ error: 'Stock insuficiente para la variante solicitada' });
        }
        await pool.query('UPDATE variante SET stock = stock - $1 WHERE id_variante = $2', [item.cantidad, item.id_variante]);
      }
    }

    // Vaciar el carrito
    await pool.query('DELETE FROM m_n_prod_carrito WHERE id_carrito = $1', [id_carrito]);
    await pool.query('UPDATE carrito SET subtotal = 0 WHERE id_carrito = $1', [id_carrito]);

    await pool.query('COMMIT');

    // Traer detalles del pedido para la respuesta
    const detallesRes = await pool.query(
      `SELECT dp.id_detallepedido, dp.id_producto, dp.id_variante, p.nombre AS producto_nombre, dp.cantidad, dp.precio
       FROM detalle_pedido dp
       LEFT JOIN producto p ON dp.id_producto = p.id_producto
       WHERE dp.id_pedido = $1`,
      [pedidoRow.id_pedido]
    );

    // Traer datos de contacto del comercio y mail del usuario propietario
    const comercioRes = await pool.query('SELECT contacto, id_usuario FROM comercio WHERE id_comercio = $1', [id_comercio]);
    const comercioInfo = comercioRes.rows[0] || null;
    let vendedorMail = null;
    if (comercioInfo && comercioInfo.id_usuario) {
      const userRes = await pool.query('SELECT mail FROM usuario WHERE id_usuario = $1', [comercioInfo.id_usuario]);
      vendedorMail = userRes.rows[0]?.mail || null;
    }

    res.status(201).json({ pedido: pedidoRow, detalles: detallesRes.rows, comercio: { contacto: comercioInfo?.contacto || null, mail: vendedorMail } });
  } catch (error) {
    try { await pool.query('ROLLBACK'); } catch (e) {}
    console.error('Error crearPedido:', error);
    res.status(500).json({ error: 'Error al crear el pedido' });
  }
};

export const listarPedidosPorComercio = async (req, res) => {
  try {
    const { id_comercio } = req.params;

    if (!id_comercio) {
      return res.status(400).json({ error: 'id_comercio es requerido' });
    }

    const result = await pool.query(
      `SELECT p.id_pedido, p.numero_pedido, p.fecha, p.total, p.id_pago, p.id_envio, p.estado,
              TRIM(COALESCE(c.nombre, '') || ' ' || COALESCE(c.apellido, '')) AS nombre,
              c.mail AS email,
              COALESCE(
                mp.nombre_pago,
                CASE p.id_pago
                  WHEN 1 THEN 'Efectivo'
                  WHEN 2 THEN 'Mercado Pago'
                  WHEN 3 THEN 'Transferencia'
                  ELSE NULL
                END
              ) AS nombre_pago,
              COALESCE(
                me.nombre_envio,
                CASE p.id_envio
                  WHEN 1 THEN 'Retiro en el local'
                  WHEN 2 THEN 'Envío por correo'
                  ELSE NULL
                END
              ) AS nombre_envio,
              COALESCE(SUM(dp.cantidad), 0) AS total_unidades,
              COUNT(dp.id_detallepedido) AS total_lineas
       FROM pedido p
       LEFT JOIN consumidor c ON p.id_consumidor = c.id_consumidor
       LEFT JOIN metodo_pago mp ON p.id_pago = mp.id_pago
       LEFT JOIN metodo_envio me ON p.id_envio = me.id_envio
       LEFT JOIN detalle_pedido dp ON p.id_pedido = dp.id_pedido
       WHERE p.id_comercio = $1
       GROUP BY p.id_pedido, c.id_consumidor, c.nombre, c.apellido, c.mail, mp.nombre_pago, me.nombre_envio
       ORDER BY p.fecha DESC, p.id_pedido DESC`,
      [id_comercio]
    );

    const pedidos = result.rows;
    if (pedidos.length === 0) {
      return res.json([]);
    }

    const pedidoIds = pedidos.map((p) => p.id_pedido);
    const detallesResult = await pool.query(
      `SELECT dp.id_pedido,
              dp.id_detallepedido,
              dp.id_producto,
              p.nombre AS producto_nombre,
              dp.cantidad,
              dp.precio,
              (dp.cantidad * dp.precio)::numeric(10,2) AS subtotal,
              dp.id_variante,
              COALESCE(
                NULLIF(
                  STRING_AGG(
                    DISTINCT (car.nombre_caracteristica || ': ' || val.nombre_valor),
                    ' | '
                  ),
                  ''
                ),
                CASE
                  WHEN COALESCE(vcount.total_variantes, 0) <= 1 THEN 'Producto único'
                  WHEN dp.id_variante IS NOT NULL THEN 'Variante #' || dp.id_variante::text
                  WHEN vsel.id_variante IS NOT NULL THEN 'Variante #' || vsel.id_variante::text
                  ELSE 'Sin variante'
                END
              ) AS variante_descripcion
       FROM detalle_pedido dp
       LEFT JOIN producto p ON dp.id_producto = p.id_producto
       LEFT JOIN LATERAL (
         SELECT COUNT(*)::INT AS total_variantes
         FROM variante vx
         WHERE vx.id_producto = dp.id_producto
       ) vcount ON TRUE
       LEFT JOIN LATERAL (
         SELECT v2.id_variante
         FROM variante v2
         WHERE v2.id_producto = dp.id_producto
           AND (
             (dp.id_variante IS NOT NULL AND v2.id_variante = dp.id_variante)
             OR (dp.id_variante IS NULL AND v2.precio = dp.precio)
           )
         ORDER BY v2.id_variante
         LIMIT 1
       ) vsel ON TRUE
       LEFT JOIN variante v ON v.id_variante = vsel.id_variante
       LEFT JOIN variante_valor vv ON v.id_variante = vv.id_variante
       LEFT JOIN valor val ON vv.id_valor = val.id_valor
       LEFT JOIN caracteristica car ON val.id_caracteristica = car.id_caracteristica
       WHERE dp.id_pedido = ANY($1::INT[])
      GROUP BY dp.id_pedido, dp.id_detallepedido, dp.id_producto, p.nombre, dp.cantidad, dp.precio, dp.id_variante, vsel.id_variante, vcount.total_variantes
       ORDER BY dp.id_pedido DESC, dp.id_detallepedido ASC`,
      [pedidoIds]
    );

    const detallesMap = new Map();
    for (const detalle of detallesResult.rows) {
      const arr = detallesMap.get(detalle.id_pedido) || [];
      arr.push(detalle);
      detallesMap.set(detalle.id_pedido, arr);
    }

    const pedidosConDetalle = pedidos.map((pedido) => ({
      ...pedido,
      detalles: detallesMap.get(pedido.id_pedido) || [],
    }));

    res.json(pedidosConDetalle);
  } catch (error) {
    console.error('Error listarPedidosPorComercio:', error);
    res.status(500).json({ error: 'Error al listar pedidos del comercio' });
  }
};


/*export const actualizarEstadoPedido = async (req, res) => {
  try {
    const { id_pedido } = req.params;
    const { estado, id_comercio } = req.body;

    if (!id_pedido || !id_comercio) {
      return res.status(400).json({ error: 'id_pedido e id_comercio son requeridos' });
    }

    if (!estado || !ESTADOS_PEDIDO_VALIDOS.includes(estado)) {
      return res.status(400).json({ error: 'Estado de pedido inválido' });
    }

    const result = await pool.query(
      `UPDATE pedido
       SET estado = $1
       WHERE id_pedido = $2 AND id_comercio = $3
       RETURNING id_pedido, numero_pedido, estado, fecha, total`,
      [estado, id_pedido, id_comercio]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado para este comercio' });
    }

    // 🚀 DISPARAMOS EL MAIL (Sin esperar con await para que el Front responda rápido)
    notificarSeguimientoCliente(id_pedido, estado);

    res.json({ mensaje: 'Estado actualizado correctamente', pedido: result.rows[0] });
  } catch (error) {
    console.error('Error actualizarEstadoPedido:', error);
    res.status(500).json({ error: 'Error al actualizar estado del pedido' });
  }
};*/
export const actualizarEstadoPedido = async (req, res) => {
  const { id_pedido } = req.params;
  const { estado, id_comercio } = req.body;

  try {
    // 1. Update en la DB
    const result = await pool.query(
      `UPDATE pedido SET estado = $1 WHERE id_pedido = $2 AND id_comercio = $3 RETURNING *`,
      [estado, id_pedido, id_comercio]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Pedido no encontrado' });

    // 2. Disparar notificación (aquí se usa la función de arriba)
    notificarSeguimientoCliente(id_pedido, estado);

    res.json({ mensaje: 'Estado actualizado', pedido: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};