import pool from '../db/db.js';

async function run() {
  try {
    console.log('=== metodo_pago ===');
    const pagos = await pool.query('SELECT * FROM metodo_pago ORDER BY id_pago');
    console.table(pagos.rows);

    console.log('\n=== metodo_envio ===');
    const env = await pool.query('SELECT * FROM metodo_envio ORDER BY id_envio');
    console.table(env.rows);

    console.log('\n=== comercio_metodo_pago (sample) ===');
    const cmp = await pool.query('SELECT * FROM comercio_metodo_pago LIMIT 50');
    console.table(cmp.rows);

    console.log('\n=== comercio_metodo_envio (sample) ===');
    const cme = await pool.query('SELECT * FROM comercio_metodo_envio LIMIT 50');
    console.table(cme.rows);

    process.exit(0);
  } catch (err) {
    console.error('Error checking metodo tables:', err);
    process.exit(1);
  }
}

run();
