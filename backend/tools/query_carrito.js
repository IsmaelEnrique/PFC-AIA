import pool from '../db/db.js';

(async () => {
  try {
    console.log('--- Carritos para id_consumidor=3 ---');
    const carritos = await pool.query('SELECT * FROM carrito WHERE id_consumidor = $1', [3]);
    console.log(JSON.stringify(carritos.rows, null, 2));

    for (const c of carritos.rows) {
      console.log(`--- Items en id_carrito=${c.id_carrito} ---`);
      const items = await pool.query('SELECT * FROM m_n_prod_carrito WHERE id_carrito = $1', [c.id_carrito]);
      console.log(JSON.stringify(items.rows, null, 2));
    }

    // También listar filas de m_n_prod_carrito por comercio 1 (por si hay carritos en otro consumidor)
    console.log('--- Todos items en comercio 1 ---');
    const allItems = await pool.query(
      `SELECT mpc.*, c.id_consumidor FROM m_n_prod_carrito mpc
       INNER JOIN carrito c ON mpc.id_carrito = c.id_carrito
       WHERE c.id_comercio = $1`,
      [1]
    );
    console.log(JSON.stringify(allItems.rows, null, 2));

  } catch (err) {
    console.error('Error querying DB:', err);
  } finally {
    await pool.end();
  }
})();
