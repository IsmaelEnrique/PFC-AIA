// 1. CARGA DE VARIABLES (Debe ser lo primero, antes que cualquier import local)
import dotenv from "dotenv";
dotenv.config(); 

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// 2. IMPORTS DE RUTAS
import authRoutes from "./routes/auth.routes.js"; 
import usuarioRoutes from "./routes/usuario.routes.js";
import comercioRoutes from "./routes/comercio.routes.js";
import categoriaRoutes from "./routes/categoria.routes.js";
import productoRoutes from "./routes/producto.routes.js";
import caracteristicaRoutes from "./routes/caracteristica.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import carritoRoutes from "./routes/carrito.routes.js";
import consumidorRoutes from "./routes/consumidor.routes.js";
import mercadoPagoRoutes from "./routes/mercadoPago.routes.js";
import pedidoRoutes from "./routes/pedido.routes.js";
import pagoRoutes from './routes/pago.routes.js';

// 3. IMPORTS DE UTILIDADES / CONFIG
import pool from './db/db.js'; 
import { sendEmail } from './controllers/mailer.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 4. CONFIGURACIÓN DE MIDDLEWARES
app.use(cors({
  origin: ["http://localhost:5173", "https://pfc-aia.onrender.com"],
  credentials: true // Recomendado si vas a usar cookies o sesiones luego
}));
app.use(express.json());

// Servir archivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 5. RUTA DE TEST (Mantenela para debug)
app.get("/test-mail", async (req, res) => {
  const resultado = await sendEmail(
    process.env.EMAIL_USER, // Se manda a vos mismo
    "Prueba de Emprendify 🚀",
    "<h1>¡Si lees esto, tu servidor ya manda mails!</h1><p>El motor de Gmail quedó 10 puntos.</p>"
  );
  
  if (resultado.success) {
    res.send("✅ Mail de prueba enviado. Revisá tu casilla.");
  } else {
    res.status(500).send("❌ Error al enviar: " + resultado.error);
  }
});

// 6. DEFINICIÓN DE RUTAS API
app.use("/api/auth", authRoutes); // 👈 Esta maneja /registrar, /verificar, etc.
app.use("/api/comercio", comercioRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/categorias", categoriaRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/caracteristicas", caracteristicaRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/carrito", carritoRoutes);
app.use("/api/consumidor", consumidorRoutes);
app.use("/api/pagos", mercadoPagoRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use('/api/pagos', pagoRoutes);

// 7. LÓGICA DE MIGRACIONES (Sin cambios, es excelente para la consistencia)
const runMigrations = async () => {
  try {
    await pool.query('BEGIN');
    const colRes = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='m_n_prod_carrito' AND column_name='id_prod_carrito'");
    if (colRes.rows.length === 0) {
      await pool.query("CREATE SEQUENCE IF NOT EXISTS seq_m_n_prod_carrito_id_prod_carrito");
      await pool.query("ALTER TABLE m_n_prod_carrito ADD COLUMN id_prod_carrito INT");
      await pool.query("UPDATE m_n_prod_carrito SET id_prod_carrito = nextval('seq_m_n_prod_carrito_id_prod_carrito') WHERE id_prod_carrito IS NULL");
      await pool.query("ALTER SEQUENCE seq_m_n_prod_carrito_id_prod_carrito OWNED BY m_n_prod_carrito.id_prod_carrito");
      await pool.query("ALTER TABLE m_n_prod_carrito ALTER COLUMN id_prod_carrito SET DEFAULT nextval('seq_m_n_prod_carrito_id_prod_carrito')");
      await pool.query("ALTER TABLE m_n_prod_carrito ALTER COLUMN id_prod_carrito SET NOT NULL");
    }

    const pkRes = await pool.query("SELECT conname FROM pg_constraint WHERE conrelid = 'm_n_prod_carrito'::regclass AND contype = 'p'");
    if (pkRes.rows.length > 0) {
      const existingPk = pkRes.rows[0].conname;
      await pool.query(`ALTER TABLE m_n_prod_carrito DROP CONSTRAINT ${existingPk}`);
    }

    await pool.query('ALTER TABLE m_n_prod_carrito ADD CONSTRAINT m_n_prod_carrito_pk PRIMARY KEY (id_prod_carrito)');

    const uniqRes = await pool.query("SELECT conname FROM pg_constraint WHERE conrelid = 'm_n_prod_carrito'::regclass AND contype = 'u' AND pg_get_constraintdef(oid) LIKE '%(id_carrito, id_producto, id_variante)%'");
    if (uniqRes.rows.length === 0) {
      await pool.query('ALTER TABLE m_n_prod_carrito ADD CONSTRAINT m_n_prod_carrito_unique UNIQUE (id_carrito, id_producto, id_variante)');
    }

    // Store the selected variant in order details so admin can audit what was sold.
    await pool.query('ALTER TABLE detalle_pedido ADD COLUMN IF NOT EXISTS id_variante INT');
    const fkVarRes = await pool.query("SELECT conname FROM pg_constraint WHERE conrelid = 'detalle_pedido'::regclass AND conname = 'detalle_pedido_fk_variante'");
    if (fkVarRes.rows.length === 0) {
      await pool.query('ALTER TABLE detalle_pedido ADD CONSTRAINT detalle_pedido_fk_variante FOREIGN KEY (id_variante) REFERENCES variante(id_variante)');
    }

    await pool.query('COMMIT');
    console.log('✅ DB migrations checked/applied');
  } catch (e) {
    console.error('Error running migrations:', e);
    try { await pool.query('ROLLBACK'); } catch (rb) { console.error('Rollback failed', rb); }
    throw e;
  }
};

const PORT = process.env.PORT || 4000;

// 8. INICIO DEL SERVIDOR
runMigrations()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to run migrations at startup:', err);
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor escuchando en puerto ${PORT} (migrations failed)`);
    });
  });