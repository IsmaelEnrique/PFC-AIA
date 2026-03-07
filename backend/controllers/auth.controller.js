import crypto from 'crypto';
import { supabase } from '../config/supabase.js';
import { sendEmail } from './mailer.controller.js';
import { plantillaVerificacion } from '../utils/emailTemplates.js';
import pool from '../db/db.js';
import bcrypt from 'bcrypt';

const columnCache = new Map();

async function getTableColumns(tableName) {
  if (columnCache.has(tableName)) return columnCache.get(tableName);

  const result = await pool.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1`,
    [tableName]
  );

  const cols = new Set(result.rows.map((r) => r.column_name));
  columnCache.set(tableName, cols);
  return cols;
}

async function insertUsuarioPerfilCompatible({ mail, nombre, password, idAuth, token, expiracion }) {
  const cols = await getTableColumns('usuario');
  const values = {};

  const nombreNormalizado = (nombre || '').trim();
  const nombreFinal = nombreNormalizado || (mail || '').split('@')[0] || 'Usuario';

  if (cols.has('mail')) values.mail = mail;
  if (cols.has('email')) values.email = mail;
  if (cols.has('nombre_usuario')) values.nombre_usuario = nombreFinal;
  if (cols.has('nombre')) values.nombre = nombreFinal;
  if (cols.has('id_auth')) values.id_auth = idAuth;

  // In schema legacy, password is required in `contrasena`.
  const hashedPassword = await bcrypt.hash(password, 10);
  if (cols.has('contrasena')) values.contrasena = hashedPassword;
  if (cols.has('password_hash')) values.password_hash = hashedPassword;

  const hasTokenColumns = cols.has('token_verificacion') && cols.has('token_expiracion');
  if (cols.has('token_verificacion')) values.token_verificacion = token;
  if (cols.has('token_expiracion')) values.token_expiracion = expiracion;
  if (cols.has('verificado')) values.verificado = hasTokenColumns ? false : true;

  const keys = Object.keys(values);
  if (keys.length === 0) {
    throw new Error('No hay columnas compatibles para insertar en usuario');
  }

  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const params = keys.map((k) => values[k]);

  const query = `INSERT INTO usuario (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
  const inserted = await pool.query(query, params);
  return { row: inserted.rows[0], hasTokenColumns };
}

async function getUsuarioPerfilCompatible({ authUserId, mail }) {
  const cols = await getTableColumns('usuario');

  if (authUserId && cols.has('id_auth')) {
    const byAuth = await pool.query(
      'SELECT * FROM usuario WHERE id_auth = $1 LIMIT 1',
      [authUserId]
    );
    if (byAuth.rows.length > 0) return byAuth.rows[0];
  }

  const byMail = await pool.query(
    'SELECT * FROM usuario WHERE LOWER(mail) = LOWER($1) LIMIT 1',
    [mail]
  );
  return byMail.rows[0] || null;
}

// 1. REGISTRO
export const registrarUsuario = async (req, res) => {
  const { mail, password, nombre, tipo } = req.body;
  const tabla = tipo === 'consumidor' ? 'consumidor' : 'usuario';

  try {
    let authUserId = null;
    let authRateLimited = false;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: mail,
      password: password,
    });

    if (authError) {
      const authMsg = String(authError.message || '').toLowerCase();
      const isRateLimit = authMsg.includes('rate limit') || authMsg.includes('email rate limit exceeded');

      // For vendor registration in local/legacy mode, allow graceful fallback when
      // Supabase throttles confirmation emails.
      if (!(tabla === 'usuario' && isRateLimit)) {
        return res.status(400).json({ error: authError.message });
      }

      authRateLimited = true;
    } else {
      authUserId = authData?.user?.id || null;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiracion = new Date();
    expiracion.setHours(expiracion.getHours() + 24);

    if (tabla === 'usuario') {
      const { hasTokenColumns } = await insertUsuarioPerfilCompatible({
        mail,
        nombre,
        password,
        idAuth: authUserId,
        token,
        expiracion,
      });

      if (!hasTokenColumns) {
        return res.status(201).json({
          message: authRateLimited
            ? 'Registro exitoso. Supabase limitó correos por ahora, pero tu cuenta quedó activa en modo compatibilidad.'
            : 'Registro exitoso. Tu cuenta quedó activa en modo compatibilidad.',
        });
      }

      if (authRateLimited) {
        return res.status(201).json({
          message: 'Registro exitoso. Tu cuenta fue creada, pero Supabase limitó el envío automático de verificación.',
        });
      }
    } else {
      const { error: dbError } = await supabase.from(tabla).insert([{
        nombre,
        mail,
        id_auth: authUserId,
        verificado: false,
        token_verificacion: token,
        token_expiracion: expiracion
      }]);

      if (dbError) return res.status(500).json({ error: dbError.message });
    }

    const urlVerificacion = `${process.env.BACKEND_URL}/api/auth/verificar/${token}?tipo=${tipo}`;
    await sendEmail(mail, "Activá tu cuenta en Emprendify 🚀", plantillaVerificacion(nombre, urlVerificacion));

    res.status(201).json({ message: "Registro exitoso. Revisá tu mail." });
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor" });
  }
};

// 2. VERIFICACIÓN (Clic en el mail)
export const verificarCuenta = async (req, res) => {
  const { token } = req.params;
  const { tipo } = req.query;
  const tabla = tipo === 'consumidor' ? 'consumidor' : 'usuario';
  const idCol = tipo === 'consumidor' ? 'id_consumidor' : 'id_usuario';

  try {
    const { data: user, error } = await supabase.from(tabla)
      .select('*').eq('token_verificacion', token).single();

    if (error || !user || new Date() > new Date(user.token_expiracion)) {
      return res.status(400).send("<h1>El enlace es inválido o ha expirado.</h1>");
    }

    await supabase.from(tabla)
      .update({ verificado: true, token_verificacion: null, token_expiracion: null })
      .eq(idCol, user[idCol]);

    res.redirect(`${process.env.FRONTEND_URL}/login?verificado=true`);
  } catch (error) {
    res.status(500).send("Error procesando la verificación");
  }
};

// 3. REENVÍO (¡El que te faltaba exportar!)
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

    const url = `${process.env.BACKEND_URL}/api/auth/verificar/${token}?tipo=${tipo}`;
    await sendEmail(mail, "Nuevo enlace de verificación", plantillaVerificacion(user.nombre, url));
    
    return res.json({ message: "Correo reenviado con éxito." });
  } catch (error) {
    res.status(500).json({ error: "Error al reenviar" });
  }
};

export const loginUsuario = async (req, res) => {
  const { mail, contrasena } = req.body;
  const mailNormalizado = (mail || '').trim().toLowerCase();
  const passwordIngresada = (contrasena || '').trim();

  if (!mailNormalizado || !passwordIngresada) {
    return res.status(400).json({ error: 'Faltan credenciales' });
  }

  try {
    // 1. Intentar login en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: mailNormalizado,
      password: passwordIngresada,
    });

    if (authError) {
      // Compatibilidad con cuentas legacy: usuarios creados en PostgreSQL sin id_auth.
      const legacyResult = await pool.query(
        'SELECT * FROM usuario WHERE LOWER(mail) = LOWER($1) LIMIT 1',
        [mailNormalizado]
      );

      if (legacyResult.rows.length === 0) {
        return res.status(401).json({ error: 'Credenciales inválidas en Auth' });
      }

      const legacyUser = legacyResult.rows[0];

      const legacyPassword = legacyUser.contrasena || legacyUser.password_hash;
      if (!legacyPassword) {
        return res.status(401).json({ error: 'Credenciales inválidas en Auth' });
      }

      // Acepta hashes bcrypt y, para datos importados antiguos, texto plano.
      const isBcryptHash = typeof legacyPassword === 'string' && legacyPassword.startsWith('$2');
      const passwordOk = isBcryptHash
        ? await bcrypt.compare(passwordIngresada, legacyPassword)
        : legacyPassword === passwordIngresada;

      if (!passwordOk) {
        return res.status(401).json({ error: 'Credenciales inválidas en Auth' });
      }

      if (legacyUser.verificado === false) {
        return res.status(403).json({
          error: 'Debés verificar tu cuenta. Revisá tu email.',
          unverified: true
        });
      }

      const {
        contrasena: _legacyContrasena,
        password_hash: _legacyPasswordHash,
        token_verificacion: _legacyToken,
        ...legacyUserSafe
      } = legacyUser;

      return res.json(legacyUserSafe);
    }

    // 2. Buscar al usuario en TU tabla de la DB para ver si está verificado
    let usuario = null;
    try {
      const { data, error: dbError } = await supabase
        .from('usuario')
        .select('*')
        .eq('id_auth', authData.user.id)
        .single();

      if (!dbError && data) usuario = data;
    } catch (_) {
      // If schema differs from Supabase cache, fallback to direct Postgres query.
    }

    if (!usuario) {
      usuario = await getUsuarioPerfilCompatible({
        authUserId: authData.user.id,
        mail: mailNormalizado,
      });
    }

    if (!usuario) return res.status(404).json({ error: "Perfil de usuario no encontrado" });

    // 3. Bloquear si no está verificado
    if (!usuario.verificado) {
      return res.status(403).json({ 
        error: "Debés verificar tu cuenta. Revisá tu email.",
        unverified: true 
      });
    }

    // 4. Todo OK: Devolvemos el usuario (sin datos sensibles)
    const { password_hash, token_verificacion, ...usuarioSeguro } = usuario;
    res.json(usuarioSeguro);

  } catch (error) {
    res.status(500).json({ error: "Error interno en el login" });
  }
};

//registro de consumidor con la tienda 
export const registrarConsumidor = async (req, res) => {
  // Recibimos id_comercio desde la tienda específica
  const { mail, password, nombre, apellido, id_comercio } = req.body; 

  try {
    // 1. Crear en Supabase Auth (Global para Emprendify)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: mail,
      password: password,
    });

    if (authError) return res.status(400).json({ error: authError.message });

    // 2. Insertar en tabla CONSUMIDOR vinculando al COMERCIO
    const token = crypto.randomBytes(32).toString('hex');
    const expiracion = new Date();
    expiracion.setHours(expiracion.getHours() + 24);

    const { error: dbError } = await supabase.from('consumidor').insert([{
      nombre,
      apellido, // Veo que tenés apellido en tu tabla
      mail,
      id_auth: authData.user.id,
      id_comercio: id_comercio, // 👈 El vínculo con la tienda
      verificado: false,
      token_verificacion: token,
      token_expiracion: expiracion
    }]);

    if (dbError) return res.status(500).json({ error: dbError.message });

    // 3. Envío de Mail Personalizado
    // Podrías buscar el nombre del comercio antes para ponerlo en el asunto
    const urlVerificacion = `${process.env.BACKEND_URL}/api/auth/verificar/${token}?tipo=consumidor`;
    
    await sendEmail(
      mail, 
      "Confirmá tu cuenta en la tienda 🛍️", 
      plantillaVerificacion(nombre, urlVerificacion)
    );

    res.status(201).json({ message: "Registro exitoso en la tienda." });

  } catch (error) {
    res.status(500).json({ error: "Error interno" });
  }
};

export const login = async (req, res) => {
  const { mail, contrasena, tipo, id_comercio } = req.body; 
  // tipo: 'usuario' o 'consumidor'

  try {
    // 1. Intentar login en Supabase Auth (Valida que el mail y clave existan)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: mail,
      password: contrasena,
    });

    if (authError) return res.status(401).json({ error: "Credenciales incorrectas." });

    // 2. Definir en qué tabla buscar según el tipo
    const tabla = tipo === 'consumidor' ? 'consumidor' : 'usuario';
    
    // 3. Buscar el perfil en nuestra base de datos
    let query = supabase
      .from(tabla)
      .select('*')
      .eq('id_auth', authData.user.id);

    // 🕵️ FILTRO CRÍTICO: Si es consumidor, DEBE coincidir con el comercio de la tienda
    if (tipo === 'consumidor') {
      if (!id_comercio) return res.status(400).json({ error: "Falta identificar el comercio." });
      query = query.eq('id_comercio', id_comercio);
    }

    const { data: perfil, error: dbError } = await query.single();

    // 4. Validar si el perfil existe para este contexto
    if (dbError || !perfil) {
      const msj = tipo === 'consumidor' 
        ? "No tenés una cuenta registrada en esta tienda." 
        : "No se encontró tu perfil de vendedor.";
      return res.status(401).json({ error: msj });
    }

    // 5. Validar si está verificado (el mailer que hicimos)
    if (!perfil.verificado) {
      return res.status(403).json({ 
        error: "Tu cuenta no ha sido activada aún. Revisá tu email.",
        unverified: true 
      });
    }

    // 6. Todo OK: Devolvemos la info (sin datos sensibles)
    // Agregamos un 'role' para que el front sepa qué mostrar
    const usuarioFinal = {
      ...perfil,
      role: tipo 
    };

    res.json(usuarioFinal);

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error interno en el servidor." });
  }
};