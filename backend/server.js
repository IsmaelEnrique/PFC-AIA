import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import usuarioRoutes from "./routes/usuario.routes.js";
import comercioRoutes from "./routes/comercio.routes.js";
import categoriaRoutes from "./routes/categoria.routes.js";
import productoRoutes from "./routes/producto.routes.js";
import caracteristicaRoutes from "./routes/caracteristica.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import carritoRoutes from "./routes/carrito.routes.js";
import consumidorRoutes from "./routes/consumidor.routes.js";
import mercadoPagoRoutes from "./routes/mercadoPago.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config(); //Lee el archivo .env y carga las variables en process.env.

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "https://tu-frontend.onrender.com"]
}));
app.use(express.json());

// Servir carpeta de uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/comercio", comercioRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/categorias", categoriaRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/caracteristicas", caracteristicaRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/carrito", carritoRoutes);
app.use("/api/consumidor", consumidorRoutes);
app.use("/api/pagos", mercadoPagoRoutes);

// 🔴 SERVER
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
import pool from './db/db.js';

const runMigrations = async () => {
  try {
    await pool.query('BEGIN');

    // 1) Ensure id_prod_carrito column exists and is populated with a sequence-backed integer
    const colRes = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='m_n_prod_carrito' AND column_name='id_prod_carrito'");
    if (colRes.rows.length === 0) {
      await pool.query("CREATE SEQUENCE IF NOT EXISTS seq_m_n_prod_carrito_id_prod_carrito");
      await pool.query("ALTER TABLE m_n_prod_carrito ADD COLUMN id_prod_carrito INT");
      await pool.query("UPDATE m_n_prod_carrito SET id_prod_carrito = nextval('seq_m_n_prod_carrito_id_prod_carrito') WHERE id_prod_carrito IS NULL");
      await pool.query("ALTER SEQUENCE seq_m_n_prod_carrito_id_prod_carrito OWNED BY m_n_prod_carrito.id_prod_carrito");
      await pool.query("ALTER TABLE m_n_prod_carrito ALTER COLUMN id_prod_carrito SET DEFAULT nextval('seq_m_n_prod_carrito_id_prod_carrito')");
      await pool.query("ALTER TABLE m_n_prod_carrito ALTER COLUMN id_prod_carrito SET NOT NULL");
    }

    // 2) Drop existing primary key (if any)
    const pkRes = await pool.query("SELECT conname FROM pg_constraint WHERE conrelid = 'm_n_prod_carrito'::regclass AND contype = 'p'");
    if (pkRes.rows.length > 0) {
      const existingPk = pkRes.rows[0].conname;
      await pool.query(`ALTER TABLE m_n_prod_carrito DROP CONSTRAINT ${existingPk}`);
    }

    // 3) Add primary key on id_prod_carrito
    // If there's already a PK named m_n_prod_carrito_pk this will fail; previous drop ensures it isn't present.
    await pool.query('ALTER TABLE m_n_prod_carrito ADD CONSTRAINT m_n_prod_carrito_pk PRIMARY KEY (id_prod_carrito)');

    // 4) Add unique constraint on (id_carrito, id_producto, id_variante) if not exists
    const uniqRes = await pool.query("SELECT conname FROM pg_constraint WHERE conrelid = 'm_n_prod_carrito'::regclass AND contype = 'u' AND pg_get_constraintdef(oid) LIKE '%(id_carrito, id_producto, id_variante)%'");
    if (uniqRes.rows.length === 0) {
      await pool.query('ALTER TABLE m_n_prod_carrito ADD CONSTRAINT m_n_prod_carrito_unique UNIQUE (id_carrito, id_producto, id_variante)');
    }

    await pool.query('COMMIT');
    console.log('✅ DB migrations checked/applied');
  } catch (e) {
    console.error('Error running migrations:', e);
    try { await pool.query('ROLLBACK'); } catch (rb) { console.error('Rollback failed', rb); }
    throw e;
  }
};

runMigrations().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to run migrations at startup:', err);
  app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en puerto ${PORT} (migrations failed)`);
  });
});
