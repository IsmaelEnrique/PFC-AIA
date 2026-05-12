
import crypto from 'crypto';
import { supabase } from '../config/supabase.js';
import { sendEmail } from './mailer.controller.js';
import { plantillaVerificacion } from '../utils/emailTemplates.js';
import pool from '../db/db.js';
import bcrypt from 'bcrypt';

// --- FUNCIONES DE APOYO (Mantenelas arriba) ---
const columnCache = new Map();
async function getTableColumns(tableName) {
  if (columnCache.has(tableName)) return columnCache.get(tableName);
  const result = await pool.query(
    "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1",
    [tableName]
  );
  const cols = new Set(result.rows.map((r) => r.column_name));
  columnCache.set(tableName, cols);
  return cols;
}

// --- 1. REGISTRO UNIFICADO ---
export const registrarUsuario = async (req, res) => {
  console.log("=== NUEVO REGISTRO ===");
  console.log("BODY:", req.body);

  const { mail, password, nombre, tipo, id_comercio } = req.body;

  try {
    console.log("ANTES SIGNUP SUPABASE");

    const { data: authData, error: authError } =
      await supabase.auth.signUp({
        email: mail,
        password: password,
      });

    console.log("RESPUESTA SIGNUP:");
    console.log(authData);
    console.log(authError);

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    let dbError;

    // 👉 Usuario / vendedor
    if (tipo === "usuario") {
      const { error } = await supabase
        .from("usuario")
        .insert([
          {
            nombre_usuario: nombre,
            mail,
            contrasena: password,
            verificado: false,
          },
        ]);

      dbError = error;
    }

    // 👉 Consumidor
    if (tipo === "consumidor") {
      const { error } = await supabase
        .from("consumidor")
        .insert([
          {
            nombre,
            mail,
            contrasena: password,
            id_comercio,
            verificado: false,
          },
        ]);

      dbError = error;
    }

    if (dbError) {
      return res.status(500).json({ error: dbError.message });
    }

    console.log("ANTES SENDMAIL");

   const urlVerificacion =
      `https://pfc-aia.onrender.com/api/auth/verificar?mail=${encodeURIComponent(mail)}&tipo=${tipo}`;

    await sendEmail(
      mail,
      "Activá tu cuenta en Emprendify 🚀",
      plantillaVerificacion(nombre, urlVerificacion)
    );

    console.log("MAIL ENVIADO");

    return res.status(201).json({
      message: "Registro exitoso. Revisá tu correo.",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Error en servidor",
    });
  }
};

// --- 2. LOGIN UNIFICADO (Soporta ambos tipos) ---
export const loginUsuario = async (req, res) => {
  const { mail, contrasena, tipo, id_comercio } = req.body;
  const mailNormalizado = (mail || '').trim().toLowerCase();

  try {
    // 1. Auth en Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: mailNormalizado,
      password: contrasena,
    });

    if (authError) return res.status(401).json({ error: "Credenciales incorrectas" });

    // 2. Buscar perfil
    const tabla = tipo === 'consumidor' ? 'consumidor' : 'usuario';
    let query = supabase.from(tabla).select('*').eq("mail", mailNormalizado);

    if (tipo === 'consumidor') {
      if (!id_comercio) return res.status(400).json({ error: "Falta ID de comercio" });
      query = query.eq('id_comercio', id_comercio);
    }

    const { data: perfil, error: dbError } = await query.single();

    if (dbError || !perfil) return res.status(401).json({ error: "Perfil no encontrado en esta tienda" });

    if (!perfil.verificado) {
      return res.status(403).json({ error: "Cuenta no verificada", unverified: true });
    }

    const { token_verificacion, ...usuarioSeguro } = perfil;
    res.json({ ...usuarioSeguro, role: tipo });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error interno" });
  }
};

// --- 3. VERIFICACIÓN Y REENVÍO ---
export const verificarCuenta = async (req, res) => {
  const { mail, tipo } = req.query;

  const tabla = tipo === "consumidor" ? "consumidor" : "usuario";

  try {
    console.log("MAIL:", mail);
    console.log("TABLA:", tabla);

    const { data, error } = await supabase
      .from(tabla)
      .update({ verificado: true })
      .eq("mail", mail)
      .select();

    console.log("UPDATE DATA:", data);
    console.log("UPDATE ERROR:", error);

    if (error || !data || data.length === 0) {
      return res.redirect(
        "https://emprendify.vercel.app/login?error=true"
      );
    }

    return res.redirect(
      "https://emprendify.vercel.app/login?verificado=true"
    );

  } catch (error) {
    console.log("CATCH:", error);

    return res.redirect(
      "https://emprendify.vercel.app/login?error=true"
    );
  }
};
export const reenviarVerificacion = async (req, res) => {
    const { mail, tipo } = req.body;
    const tabla = tipo === 'consumidor' ? 'consumidor' : 'usuario';

    try {
        const token = crypto.randomBytes(32).toString('hex');
        const exp = new Date();
        exp.setHours(exp.getHours() + 24);

        const { data: user, error } = await supabase.from(tabla)
            .update({ token_verificacion: token, token_expiracion: exp })
            .eq('mail', mail).select().single();

        if (error || !user) return res.status(404).json({ error: "Usuario no encontrado." });

        const url = `https://pfc-aia.onrender.com/api/auth/verificar/${token}?tipo=${tipo}`;
        await sendEmail(mail, "Nuevo enlace de verificación", plantillaVerificacion(user.nombre, url));
        
        return res.json({ message: "Correo reenviado." });
    } catch (error) {
        res.status(500).json({ error: "Error al reenviar" });
    }
};

export const activarCuenta = async (req, res) => {
  try {
    const { mail, tipo } = req.body;

    console.log("ACTIVAR CUENTA");
    console.log("MAIL:", mail);
    console.log("TIPO:", tipo);

    const tabla =
      tipo === "consumidor"
        ? "consumidor"
        : "usuario";

    const { data, error } = await supabase
      .from(tabla)
      .update({ verificado: true })
      .eq("mail", mail)
      .select();

    console.log("DATA:", data);
    console.log("ERROR:", error);

    if (error) {
      return res.status(500).json({ error });
    }

    res.json({ ok: true, data });

  } catch (error) {
    console.log("CATCH:", error);
    res.status(500).json({ error: "Error servidor" });
  }
};