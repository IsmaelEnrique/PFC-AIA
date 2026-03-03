import pool from "../db/db.js";

function generateOrderNumber() {
  const now = Date.now().toString();
  const rand = Math.floor(Math.random() * 900).toString().padStart(3, '0');
  return `ORD-${now}-${rand}`;
}

export const crearPedido = async (req, res) => {
  try {
    const { id_carrito, id_consumidor, id_comercio, total, id_pago, id_envio } = req.body;

    if (!id_carrito || !id_consumidor || !id_comercio || !id_pago || !id_envio) {
      return res.status(400).json({ error: 'Faltan datos requeridos para crear el pedido' });
    }

    const numero_pedido = generateOrderNumber();
    const fecha = new Date();
    const estado = 'Pendiente';

    const insert = await pool.query(
      `INSERT INTO pedido (numero_pedido, id_carrito, id_consumidor, id_comercio, fecha, total, id_pago, id_envio, estado)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [numero_pedido, id_carrito, id_consumidor, id_comercio, fecha, total, id_pago, id_envio, estado]
    );

    res.status(201).json({ pedido: insert.rows[0] });
  } catch (error) {
    console.error('Error crearPedido:', error);
    res.status(500).json({ error: 'Error al crear el pedido' });
  }
};
