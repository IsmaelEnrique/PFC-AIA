import pool from "../db/db.js";
import bcrypt from "bcrypt";

// Obtener todos los usuarios
export const getUsuarios = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id_usuario, nombre_usuario, mail, verificado FROM usuario"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

// Obtener un usuario específico por ID
export const getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id_usuario, nombre_usuario, mail, cta_bancaria, dni, nombre_banco, nombre_titular, verificado 
       FROM usuario WHERE id_usuario = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({ error: "Error al obtener usuario" });
  }
};

// Crear un nuevo usuario
export const createUsuario = async (req, res) => {
  try {
    const { nombre, apellido, mail, contrasena } = req.body;

    if (!nombre || !apellido || !mail || !contrasena) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }
    
    const format = (texto) => texto
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());

    const nombre_usuario = `${format(apellido)} ${format(nombre)}`;
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const result = await pool.query(
      `INSERT INTO usuario (nombre_usuario, mail, contrasena, verificado)
       VALUES ($1, $2, $3, $4)
       RETURNING id_usuario, nombre_usuario, mail, verificado`,
      [nombre_usuario, mail, hashedPassword, false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ error: "Error al crear usuario" });
  }
};

export const loginUsuario = async (req, res) => {
  try {
    const { mail, contrasena } = req.body;

    if (!mail || !contrasena) {
      return res.status(400).json({ error: "Faltan credenciales" });
    }

    const result = await pool.query(
      "SELECT * FROM usuario WHERE mail = $1",
      [mail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const usuario = result.rows[0];

    const passwordOk = await bcrypt.compare(
      contrasena,
      usuario.contrasena
    );

    if (!passwordOk) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    res.json({
      id_usuario: usuario.id_usuario,
      nombre_usuario: usuario.nombre_usuario,
      mail: usuario.mail,
      verificado: usuario.verificado
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error en login" });
  }
};

// Actualizar perfil del usuario
export const updatePerfilUsuario = async (req, res) => {
  try {
    const { id_usuario, nombre, contrasena_anterior, contrasena_nueva, cta_bancaria, dni, nombre_banco, nombre_titular } = req.body;

    if (!id_usuario || !nombre) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // Obtener usuario actual para validar contraseña
    const usuarioResult = await pool.query(
      "SELECT contrasena FROM usuario WHERE id_usuario = $1",
      [id_usuario]
    );

    if (usuarioResult.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Si intenta cambiar contraseña, validar la anterior
    if (contrasena_nueva && contrasena_nueva.trim() !== "") {
      if (!contrasena_anterior || contrasena_anterior.trim() === "") {
        return res.status(400).json({ error: "Debés ingresar tu contraseña actual" });
      }

      const passwordOk = await bcrypt.compare(
        contrasena_anterior,
        usuarioResult.rows[0].contrasena
      );

      if (!passwordOk) {
        return res.status(401).json({ error: "La contraseña actual es incorrecta" });
      }
    }

    let query = `UPDATE usuario SET nombre_usuario = $1`;
    let values = [nombre];
    let paramCount = 2;

    // Actualizar contraseña si se proporciona
    if (contrasena_nueva && contrasena_nueva.trim() !== "") {
      const hashedPassword = await bcrypt.hash(contrasena_nueva, 10);
      query += `, contrasena = $${paramCount}`;
      values.push(hashedPassword);
      paramCount++;
    }

    // Actualizar campos opcionales (null o vacío = borrar)
    if (cta_bancaria !== undefined) {
      query += `, cta_bancaria = $${paramCount}`;
      values.push(cta_bancaria === null || cta_bancaria === "" ? null : cta_bancaria);
      paramCount++;
    }

    if (dni !== undefined) {
      query += `, dni = $${paramCount}`;
      values.push(dni === null || dni === "" ? null : dni);
      paramCount++;
    }

    if (nombre_banco !== undefined) {
      query += `, nombre_banco = $${paramCount}`;
      values.push(nombre_banco === null || nombre_banco === "" ? null : nombre_banco);
      paramCount++;
    }

    if (nombre_titular !== undefined) {
      query += `, nombre_titular = $${paramCount}`;
      values.push(nombre_titular === null || nombre_titular === "" ? null : nombre_titular);
      paramCount++;
    }

    query += ` WHERE id_usuario = $${paramCount} RETURNING id_usuario, nombre_usuario, mail, cta_bancaria, dni, nombre_banco, nombre_titular, verificado`;
    values.push(id_usuario);

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({ error: "Error al actualizar perfil" });
  }
};