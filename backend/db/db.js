import pg from "pg";
import dotenv from "dotenv";
dotenv.config();
const { Pool } = pg;


const shouldUseSsl = !!(
  process.env.PGSSLMODE === "require" ||
  process.env.PGHOST?.includes("supabase.co") ||
  (process.env.DATABASE_URL && process.env.DATABASE_URL.includes("sslmode=require"))
);

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
});

export default pool;
