import crypto from 'crypto';
import { supabase } from '../config/supabase.js';
import { sendEmail } from './mailer.controller.js';
import { plantillaVerificacion } from '../utils/emailTemplates.js';

// 1. REGISTRO
export const registrarUsuario = async (req, res) => {
  const { mail, password, nombre, tipo } = req.body;
  const tabla = tipo === 'consumidor' ? 'consumidor' : 'usuario';

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: mail,
      password: password,
    });

    if (authError) return res.status(400).json({ error: authError.message });

    const token = crypto.randomBytes(32).toString('hex');
    const expiracion = new Date();
    expiracion.setHours(expiracion.getHours() + 24);

    const { error: dbError } = await supabase.from(tabla).insert([{
      nombre,
      mail,
      id_auth: authData.user.id,
      verificado: false,
      token_verificacion: token,
      token_expiracion: expiracion
    }]);

    if (dbError) return res.status(500).json({ error: dbError.message });

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

  try {
    // 1. Intentar login en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: mail,
      password: contrasena,
    });

    if (authError) return res.status(401).json({ error: "Credenciales inválidas en Auth" });

    // 2. Buscar al usuario en TU tabla de la DB para ver si está verificado
    const { data: usuario, error: dbError } = await supabase
      .from('usuario')
      .select('*')
      .eq('id_auth', authData.user.id)
      .single();

    if (dbError || !usuario) return res.status(404).json({ error: "Perfil de usuario no encontrado" });

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