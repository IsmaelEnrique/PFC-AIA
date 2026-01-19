import pool from "../db/db.js";

export const activarComercio = async (req, res) => {
  const {
    id_usuario,
    nombre,
    rubro,
    descripcion,
    direccion,
    contacto,
  } = req.body;

  // 🔒 Validación básica
  if (!id_usuario || !nombre || !rubro) {
    return res.status(400).json({
      error: "Faltan datos obligatorios",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO comercio
       (id_usuario, nombre_comercio, rubro, descripcion, direccion, contacto, activo)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING *`,
      [
        id_usuario,
        nombre,
        rubro,
        descripcion,
        direccion,
        contacto,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al activar comercio:", error);
    res.status(500).json({
      error: "Error al crear el comercio",
    });
  }
};
