import pool from "../db.js";

// Obtener todos los usuarios
export const getUsuarios = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM usuario");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

// Crear un nuevo usuario
export const createUsuario = async (req, res) => {
  try {
    const { nombre_usuario, mail, contrasena, verificado } = req.body;
    const result = await pool.query(
      "INSERT INTO usuario (nombre_usuario, mail, contrasena, verificado) VALUES ($1, $2, $3, $4) RETURNING *",
      [nombre_usuario, mail, contrasena, verificado]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ error: "Error al crear usuario" });
  }
};
