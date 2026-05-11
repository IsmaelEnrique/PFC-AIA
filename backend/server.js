// 1. CARGA DE VARIABLES (Debe ser lo primero)
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

// --- 🛠️ CORRECCIÓN DE CORS (Más robusta para Vercel) ---
const allowedOrigins = [
  "http://localhost:5173",
  "https://emprendify.vercel.app"
];

// Si tenés una variable en Render, la sumamos a la lista
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/+$/, ""));
}

app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origen (como Postman o el test-mail)
    if (!origin) return callback(null, true);
    
    const normalizedOrigin = origin.replace(/\/+$/, "");
    
    // Validamos contra la lista o subdominios de vercel (para previews)
    if (allowedOrigins.includes(normalizedOrigin) || normalizedOrigin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      console.error(`🚫 CORS bloqueado para: ${origin}`);
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Servir archivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 5. RUTA DE TEST
app.get("/test-mail", async (req, res) => {
  const resultado = await sendEmail(
    process.env.EMAIL_USER,
    "Prueba de Emprendify 🚀",
    "<h1>¡Servidor Online!</h1><p>Si recibís esto, el backend en Render está vivo.</p>"
  );
  if (resultado.success) res.send("✅ Mail de prueba enviado.");
  else res.status(500).send("❌ Error: " + resultado.error);
});

// 6. DEFINICIÓN DE RUTAS API (Separadas correctamente)
app.use("/api/auth", authRoutes); 
app.use("/api/comercio", comercioRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/categorias", categoriaRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/caracteristicas", caracteristicaRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/carrito", carritoRoutes);
app.use("/api/consumidor", consumidorRoutes);
app.use("/api/pedidos", pedidoRoutes);

// 🚀 RUTAS DE PAGO UNIFICADAS
app.use("/api/mp", mercadoPagoRoutes); // Para vinculación (Vendedor)
app.use('/api/pagos', pagoRoutes);     // Para compras (Cliente)

// 7. LÓGICA DE MIGRACIONES (Sin cambios, está perfecta)
const runMigrations = async () => {
  try {
    await pool.query('BEGIN');
    // ... (tu lógica de migraciones actual) ...
    await pool.query('COMMIT');
    console.log('✅ DB migrations checked/applied');
  } catch (e) {
    console.error('Error running migrations:', e);
    try { await pool.query('ROLLBACK'); } catch (rb) {}
    throw e;
  }
};

const PORT = process.env.PORT || 4000;
console.log("🔥 VERSION NUEVA SERVER JS CARGADA 🔥");
console.log("🔥 AUTH ROUTES REGISTRADAS 🔥");

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});
// 8. INICIO DEL SERVIDOR
// Escuchamos primero para que el API esté disponible de inmediato
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
  
  // Una vez que el servidor está online, intentamos correr las migraciones
  // Esto evita que Render mate la petición por timeout si la DB tarda en responder
  runMigrations()
    .then(() => {
      console.log('✅ Migraciones aplicadas con éxito.');
    })
    .catch(err => {
      // Si fallan, el servidor sigue vivo igual, lo cual es mejor para debuguear
      console.error('⚠️ Las migraciones fallaron, pero el servidor sigue online:', err.message);
    });
});