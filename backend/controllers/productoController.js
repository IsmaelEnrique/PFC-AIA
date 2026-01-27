import pool from "../db/db.js";

// ============ PRODUCTOS ============

export const getProductos = async (req, res) => {
  try {
    const { id_comercio } = req.query;

    if (!id_comercio) {
      return res.status(400).json({ error: "id_comercio es requerido" });
    }

    const result = await pool.query(
      `SELECT id_producto, nombre, codigo, descripcion, foto, activo
       FROM producto
       WHERE id_comercio = $1
       ORDER BY nombre`,
      [id_comercio]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
};

export const getProductoById = async (req, res) => {
  try {
    const { id } = req.params;

    const productResult = await pool.query(
      `SELECT * FROM producto WHERE id_producto = $1`,
      [id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const producto = productResult.rows[0];

    // Obtener categorías del producto
    const categResult = await pool.query(
      `SELECT c.id_categoria, c.nombre_cat
       FROM categoria c
       JOIN m_n_cat_prod m ON c.id_categoria = m.id_categoria
       WHERE m.id_producto = $1`,
      [id]
    );

    // Obtener variantes del producto
    const variResult = await pool.query(
      `SELECT * FROM variante WHERE id_producto = $1`,
      [id]
    );

    res.json({
      ...producto,
      categorias: categResult.rows,
      variantes: variResult.rows,
    });
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({ error: "Error al obtener producto" });
  }
};

export const createProducto = async (req, res) => {
  try {
    const { id_comercio, nombre, codigo, descripcion, foto, activo, categorias } = req.body;

    if (!id_comercio || !nombre || !codigo) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const result = await pool.query(
      `INSERT INTO producto (id_comercio, nombre, codigo, descripcion, foto, activo)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id_comercio, nombre, codigo, descripcion || null, foto || null, activo ?? true]
    );

    const producto = result.rows[0];

    // Asignar categorías si existen
    if (categorias && Array.isArray(categorias) && categorias.length > 0) {
      for (const id_categoria of categorias) {
        await pool.query(
          `INSERT INTO m_n_cat_prod (id_producto, id_categoria)
           VALUES ($1, $2)`,
          [producto.id_producto, id_categoria]
        );
      }
    }

    res.status(201).json(producto);
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ error: "Error al crear producto" });
  }
};

export const updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, codigo, descripcion, foto, activo, categorias } = req.body;

    // Si foto viene en el body, usarla; si no, mantener la anterior
    const updateQuery = foto
      ? `UPDATE producto
         SET nombre = COALESCE($1, nombre),
             codigo = COALESCE($2, codigo),
             descripcion = COALESCE($3, descripcion),
             foto = $4,
             activo = COALESCE($5, activo)
         WHERE id_producto = $6
         RETURNING *`
      : `UPDATE producto
         SET nombre = COALESCE($1, nombre),
             codigo = COALESCE($2, codigo),
             descripcion = COALESCE($3, descripcion),
             activo = COALESCE($4, activo)
         WHERE id_producto = $5
         RETURNING *`;

    const params = foto 
      ? [nombre, codigo, descripcion, foto, activo, id]
      : [nombre, codigo, descripcion, activo, id];

    const result = await pool.query(updateQuery, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Actualizar categorías si se envían
    if (categorias && Array.isArray(categorias)) {
      // Eliminar categorías anteriores
      await pool.query(`DELETE FROM m_n_cat_prod WHERE id_producto = $1`, [id]);

      // Insertar nuevas categorías
      for (const id_categoria of categorias) {
        await pool.query(
          `INSERT INTO m_n_cat_prod (id_producto, id_categoria)
           VALUES ($1, $2)`,
          [id, id_categoria]
        );
      }
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ error: "Error al actualizar producto" });
  }
};

export const deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;

    // Eliminar relaciones primero
    await pool.query(`DELETE FROM m_n_cat_prod WHERE id_producto = $1`, [id]);
    await pool.query(`DELETE FROM m_n_prod_carrito WHERE id_producto = $1`, [id]);

    // Eliminar variantes
    const variantesResult = await pool.query(
      `SELECT id_variante FROM variante WHERE id_producto = $1`,
      [id]
    );

    for (const variante of variantesResult.rows) {
      await pool.query(
        `DELETE FROM variante_valor WHERE id_variante = $1`,
        [variante.id_variante]
      );
    }

    await pool.query(`DELETE FROM variante WHERE id_producto = $1`, [id]);

    // Eliminar producto
    const result = await pool.query(
      `DELETE FROM producto WHERE id_producto = $1 RETURNING id_producto`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
};

export const toggleEstadoProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    const result = await pool.query(
      `UPDATE producto SET activo = $1 WHERE id_producto = $2 RETURNING *`,
      [activo, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al cambiar estado:", error);
    res.status(500).json({ error: "Error al cambiar estado del producto" });
  }
};

// Obtener características del producto (para edición)
export const getCaracteristicasProducto = async (req, res) => {
  try {
    const { id_producto } = req.params;

    if (!id_producto) {
      return res.status(400).json({ error: "id_producto es requerido" });
    }

    // Obtener todas las variantes del producto con sus características
    const result = await pool.query(
      `SELECT DISTINCT 
              c.id_caracteristica,
              c.nombre_caracteristica,
              json_agg(json_build_object('id_valor', v.id_valor, 'nombre_valor', v.nombre_valor) ORDER BY v.nombre_valor) as valores
       FROM caracteristica c
       JOIN valor v ON c.id_caracteristica = v.id_caracteristica
       JOIN variante_valor vv ON v.id_valor = vv.id_valor
       JOIN variante var ON vv.id_variante = var.id_variante
       WHERE var.id_producto = $1
       GROUP BY c.id_caracteristica, c.nombre_caracteristica
       ORDER BY c.nombre_caracteristica`,
      [id_producto]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener características del producto:", error);
    res.status(500).json({ error: "Error al obtener características del producto" });
  }
};

// ============ VARIANTES ============

export const getVariantes = async (req, res) => {
  try {
    const { id_producto } = req.params;

    if (!id_producto) {
      return res.status(400).json({ error: "id_producto es requerido" });
    }

    const result = await pool.query(
      `SELECT v.id_variante, v.precio, v.stock,
              COALESCE(
                json_agg(
                  json_build_object('id_valor', vv.id_valor, 'id_caracteristica', val.id_caracteristica, 'nombre_valor', val.nombre_valor)
                ) FILTER (WHERE vv.id_valor IS NOT NULL),
                '[]'::json
              ) as valores
       FROM variante v
       LEFT JOIN variante_valor vv ON v.id_variante = vv.id_variante
       LEFT JOIN valor val ON vv.id_valor = val.id_valor
       WHERE v.id_producto = $1
       GROUP BY v.id_variante
       ORDER BY v.id_variante`,
      [id_producto]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener variantes:", error);
    res.status(500).json({ error: "Error al obtener variantes" });
  }
};

export const createVariante = async (req, res) => {
  try {
    const { id_producto, precio, stock, valores } = req.body;

    if (!id_producto || precio === undefined || stock === undefined) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const varResult = await pool.query(
      `INSERT INTO variante (id_producto, precio, stock)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id_producto, precio, stock]
    );

    const variante = varResult.rows[0];

    // Insertar valores de características
    if (valores && Array.isArray(valores) && valores.length > 0) {
      for (const id_valor of valores) {
        await pool.query(
          `INSERT INTO variante_valor (id_variante, id_valor)
           VALUES ($1, $2)`,
          [variante.id_variante, id_valor]
        );
      }
    }

    res.status(201).json(variante);
  } catch (error) {
    console.error("Error al crear variante:", error);
    res.status(500).json({ error: "Error al crear variante" });
  }
};

export const updateVariante = async (req, res) => {
  try {
    const { id } = req.params;
    const { precio, stock, valores } = req.body;

    const result = await pool.query(
      `UPDATE variante
       SET precio = COALESCE($1, precio),
           stock = COALESCE($2, stock)
       WHERE id_variante = $3
       RETURNING *`,
      [precio, stock, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Variante no encontrada" });
    }

    // Actualizar valores si se envían
    if (valores && Array.isArray(valores)) {
      await pool.query(`DELETE FROM variante_valor WHERE id_variante = $1`, [id]);

      for (const id_valor of valores) {
        await pool.query(
          `INSERT INTO variante_valor (id_variante, id_valor)
           VALUES ($1, $2)`,
          [id, id_valor]
        );
      }
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar variante:", error);
    res.status(500).json({ error: "Error al actualizar variante" });
  }
};

export const deleteVariante = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(`DELETE FROM variante_valor WHERE id_variante = $1`, [id]);

    const result = await pool.query(
      `DELETE FROM variante WHERE id_variante = $1 RETURNING id_variante`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Variante no encontrada" });
    }

    res.json({ message: "Variante eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar variante:", error);
    res.status(500).json({ error: "Error al eliminar variante" });
  }
};
