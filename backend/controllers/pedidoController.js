import pool from "../db/db.js";

function generateOrderNumber() {
  // Keep numero_pedido short to fit VARCHAR(20) in DB (e.g. ORD-<8digits><3digits> = 15 chars)
  const nowSlice = Date.now().toString().slice(-8);
  const rand = Math.floor(Math.random() * 900).toString().padStart(3, '0');
  return `ORD-${nowSlice}${rand}`;
}

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

    // Use a transaction: insert pedido, insert detalle_pedido rows, update variant stock, clear carrito
    await pool.query('BEGIN');

    const insert = await pool.query(
      `INSERT INTO pedido (numero_pedido, id_carrito, id_consumidor, id_comercio, fecha, total, id_pago, id_envio, estado, calle, numero, piso, localidad, provincia, codigo_postal)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [numero_pedido, id_carrito, id_consumidor, id_comercio, fecha, finalTotal, id_pago, id_envio, estado, calle || null, numero || null, piso || null, localidad || null, provincia || null, codigo_postal || null]
    );

    const pedidoRow = insert.rows[0];

    // Obtener items del carrito para crear detalle_pedido
    const itemsRes = await pool.query(
      `SELECT mpc.id_producto, mpc.id_variante, mpc.cantidad,
        COALESCE(NULLIF(mpc.precio_unitario, 0), v.precio, 0) as precio_unitario
       FROM m_n_prod_carrito mpc
       LEFT JOIN variante v ON mpc.id_variante = v.id_variante
       WHERE mpc.id_carrito = $1`,
      [id_carrito]
    );

    for (const item of itemsRes.rows) {
      // Insert detalle
      await pool.query(
        `INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio) VALUES ($1,$2,$3,$4)`,
        [pedidoRow.id_pedido, item.id_producto, item.cantidad, item.precio_unitario]
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
      `SELECT dp.id_detallepedido, dp.id_producto, p.nombre AS producto_nombre, dp.cantidad, dp.precio
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
