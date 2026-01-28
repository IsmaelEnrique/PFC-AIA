import pool from "../db/db.js";

// ============ CARACTERÍSTICAS ============

export const getCaracteristicas = async (req, res) => {
  try {
    const { id_comercio } = req.query;

    if (!id_comercio) {
      return res.status(400).json({ error: "id_comercio es requerido" });
    }

    const result = await pool.query(
      `SELECT id_caracteristica, nombre_caracteristica
       FROM caracteristica
       WHERE id_comercio = $1
       ORDER BY nombre_caracteristica`,
      [id_comercio]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener características:", error);
    res.status(500).json({ error: "Error al obtener características" });
  }
};

export const getCaracteristicaById = async (req, res) => {
  try {
    const { id } = req.params;

    const caracResult = await pool.query(
      `SELECT id_caracteristica, nombre_caracteristica, id_comercio
       FROM caracteristica
       WHERE id_caracteristica = $1`,
      [id]
    );

    if (caracResult.rows.length === 0) {
      return res.status(404).json({ error: "Característica no encontrada" });
    }

    const caracteristica = caracResult.rows[0];

    // Obtener todos los valores de esta característica
    const valoresResult = await pool.query(
      `SELECT id_valor, nombre_valor
       FROM valor
       WHERE id_caracteristica = $1
       ORDER BY nombre_valor`,
      [id]
    );

    res.json({
      ...caracteristica,
      valores: valoresResult.rows,
    });
  } catch (error) {
    console.error("Error al obtener característica:", error);
    res.status(500).json({ error: "Error al obtener característica" });
  }
};

export const createCaracteristica = async (req, res) => {
  try {
    const { id_comercio, nombre_caracteristica } = req.body;

    if (!id_comercio || !nombre_caracteristica) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const result = await pool.query(
      `INSERT INTO caracteristica (id_comercio, nombre_caracteristica)
       VALUES ($1, $2)
       RETURNING *`,
      [id_comercio, nombre_caracteristica]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear característica:", error);
    res.status(500).json({ error: "Error al crear característica" });
  }
};

export const updateCaracteristica = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_caracteristica } = req.body;

    const result = await pool.query(
      `UPDATE caracteristica
       SET nombre_caracteristica = COALESCE($1, nombre_caracteristica)
       WHERE id_caracteristica = $2
       RETURNING *`,
      [nombre_caracteristica, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Característica no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar característica:", error);
    res.status(500).json({ error: "Error al actualizar característica" });
  }
};

export const deleteCaracteristica = async (req, res) => {
  try {
    const { id } = req.params;

    // Primero eliminar los valores
    await pool.query(`DELETE FROM valor WHERE id_caracteristica = $1`, [id]);

    const result = await pool.query(
      `DELETE FROM caracteristica WHERE id_caracteristica = $1 RETURNING id_caracteristica`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Característica no encontrada" });
    }

    res.json({ message: "Característica eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar característica:", error);
    res.status(500).json({ error: "Error al eliminar característica" });
  }
};

// ============ VALORES DE CARACTERÍSTICAS ============

export const getValores = async (req, res) => {
  try {
    const { id_caracteristica } = req.query;

    if (!id_caracteristica) {
      return res.status(400).json({ error: "id_caracteristica es requerido" });
    }

    const result = await pool.query(
      `SELECT id_valor, nombre_valor
       FROM valor
       WHERE id_caracteristica = $1
       ORDER BY nombre_valor`,
      [id_caracteristica]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener valores:", error);
    res.status(500).json({ error: "Error al obtener valores" });
  }
};

export const createValor = async (req, res) => {
  try {
    const { id_caracteristica, nombre_valor } = req.body;

    if (!id_caracteristica || !nombre_valor) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const result = await pool.query(
      `INSERT INTO valor (id_caracteristica, nombre_valor)
       VALUES ($1, $2)
       RETURNING *`,
      [id_caracteristica, nombre_valor]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear valor:", error);
    res.status(500).json({ error: "Error al crear valor" });
  }
};

export const deleteValor = async (req, res) => {
  try {
    const { id } = req.params;

    // Eliminar relaciones con variantes
    await pool.query(`DELETE FROM variante_valor WHERE id_valor = $1`, [id]);

    const result = await pool.query(
      `DELETE FROM valor WHERE id_valor = $1 RETURNING id_valor`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Valor no encontrado" });
    }

    res.json({ message: "Valor eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar valor:", error);
    res.status(500).json({ error: "Error al eliminar valor" });
  }
};
