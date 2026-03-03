import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../db/db.js';

async function run() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const migrationsDir = path.join(__dirname, '..', 'db', 'migrations');
    const filePath = path.join(migrationsDir, '002_create_comercio_metodos.sql');
    const sql = fs.readFileSync(filePath, 'utf8');

    console.log('Applying migration 002_create_comercio_metodos.sql...');
    await pool.query(sql);
    console.log('Migration applied.');

    console.log('Seeding metodo_pago and metodo_envio rows...');
    // pagos: 1=Efectivo,2=Mercado Pago,3=Transferencia
    await pool.query(`INSERT INTO metodo_pago (id_pago, nombre_pago) VALUES
      (1, 'Efectivo')
    ON CONFLICT (id_pago) DO UPDATE SET nombre_pago = EXCLUDED.nombre_pago;`);

    await pool.query(`INSERT INTO metodo_pago (id_pago, nombre_pago) VALUES
      (2, 'Mercado Pago')
    ON CONFLICT (id_pago) DO UPDATE SET nombre_pago = EXCLUDED.nombre_pago;`);

    await pool.query(`INSERT INTO metodo_pago (id_pago, nombre_pago) VALUES
      (3, 'Transferencia')
    ON CONFLICT (id_pago) DO UPDATE SET nombre_pago = EXCLUDED.nombre_pago;`);

    // envios: 1=Retiro en el local,2=Envío por correo
    await pool.query(`INSERT INTO metodo_envio (id_envio, nombre_envio) VALUES
      (1, 'Retiro en el local')
    ON CONFLICT (id_envio) DO UPDATE SET nombre_envio = EXCLUDED.nombre_envio;`);

    await pool.query(`INSERT INTO metodo_envio (id_envio, nombre_envio) VALUES
      (2, 'Envío por correo')
    ON CONFLICT (id_envio) DO UPDATE SET nombre_envio = EXCLUDED.nombre_envio;`);

    console.log('Seed complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error applying migrations or seeding:', err);
    process.exit(1);
  }
}

run();
