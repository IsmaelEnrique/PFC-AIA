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
      ok: true,
      user: {
        id: usuario.id_usuario, // 👈 ACÁ
        nombre_usuario: usuario.nombre_usuario,
        mail: usuario.mail,
        verificado: usuario.verificado
      }
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error en login" });
  }
};

