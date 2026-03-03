import pool from '../db/db.js';

(async () => {
  try {
    console.log('Applying migration: set default 0.00 and allow NULL for precio_unitario');
    await pool.query("ALTER TABLE m_n_prod_carrito ALTER COLUMN precio_unitario DROP NOT NULL;");
    await pool.query("ALTER TABLE m_n_prod_carrito ALTER COLUMN precio_unitario SET DEFAULT 0.00;");
    console.log('Migration applied successfully');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await pool.end();
  }
})();
