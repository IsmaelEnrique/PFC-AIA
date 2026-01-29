// backend/controllers/categoriaController.js
import pool from "../db/db.js";

// Obtener todas las categorías de un comercio
export const getCategorias = async (req, res) => {
  try {
    const { id_comercio } = req.query;

    if (!id_comercio) {
      return res.status(400).json({ error: "id_comercio es requerido" });
    }

    const result = await pool.query(
      "SELECT id_categoria, nombre_cat FROM categoria WHERE id_comercio = $1 ORDER BY nombre_cat",
      [id_comercio]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    res.status(500).json({ error: "Error al obtener categorías" });
  }
};

// Obtener una categoría específica por ID
export const getCategoriaById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT id_categoria, nombre_cat, id_comercio FROM categoria WHERE id_categoria = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener categoría:", error);
    res.status(500).json({ error: "Error al obtener categoría" });
  }
};

// Crear una nueva categoría
export const createCategoria = async (req, res) => {
  try {
    const { id_comercio, nombre } = req.body;

    if (!id_comercio || !nombre) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const result = await pool.query(
      `INSERT INTO categoria (id_comercio, nombre_cat)
       VALUES ($1, $2)
       RETURNING id_categoria, nombre_cat, id_comercio`,
      [id_comercio, nombre]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear categoría:", error);
    res.status(500).json({ error: "Error al crear categoría" });
  }
};

// Actualizar una categoría
export const updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    const result = await pool.query(
      `UPDATE categoria 
       SET nombre_cat = $1
       WHERE id_categoria = $2
       RETURNING id_categoria, nombre_cat, id_comercio`,
      [nombre, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    res.status(500).json({ error: "Error al actualizar categoría" });
  }
};

// Eliminar una categoría
export const deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    // Primero eliminar la relación en la tabla m_n_cat_prod
    await pool.query(
      "DELETE FROM m_n_cat_prod WHERE id_categoria = $1",
      [id]
    );

    // Luego eliminar la categoría
    const result = await pool.query(
      "DELETE FROM categoria WHERE id_categoria = $1 RETURNING id_categoria",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    res.json({ mensaje: "Categoría eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    res.status(500).json({ error: "Error al eliminar categoría" });
  }
};