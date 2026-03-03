import pool from '../db/db.js';

// Obtener o crear carrito para un consumidor en un comercio específico
export const obtenerCarrito = async (req, res) => {
  const { id_consumidor, id_comercio } = req.query;

  if (!id_consumidor || !id_comercio) {
    return res.status(400).json({ error: 'Se requiere id_consumidor e id_comercio' });
  }

  try {
    // Buscar carrito existente
    let carrito = await pool.query(
      'SELECT * FROM carrito WHERE id_consumidor = $1 AND id_comercio = $2',
      [id_consumidor, id_comercio]
    );

    // Si no existe, crear uno nuevo
    if (carrito.rows.length === 0) {
      const nuevoCarrito = await pool.query(
        'INSERT INTO carrito (id_consumidor, id_comercio, subtotal) VALUES ($1, $2, 0) RETURNING *',
        [id_consumidor, id_comercio]
      );
      carrito = nuevoCarrito;
    }

    const id_carrito = carrito.rows[0].id_carrito;

    // Obtener precio unitario correspondiente (variante o producto)
    let precioUnitario = null;
    if (id_variante) {
      // Intentar obtener precio de la variante asegurando que pertenezca al producto
      const pv = await pool.query('SELECT precio FROM variante WHERE id_variante = $1 AND id_producto = $2', [id_variante, id_producto]);
      precioUnitario = pv.rows[0]?.precio ?? null;
    }
    if (precioUnitario === null) {
      // Intentar obtener precio desde el producto (si la columna existe)
      try {
        const pp = await pool.query('SELECT precio FROM producto WHERE id_producto = $1', [id_producto]);
        precioUnitario = pp.rows[0]?.precio ?? null;
      } catch (e) {
        precioUnitario = null;
      }
    }

    // Asegurar valor no nulo para cumplir constraint
    if (precioUnitario === null || precioUnitario === undefined) {
      precioUnitario = 0.00;
    }

    // Si no se encontró precio, usar 0.00 para no violar NOT NULL
    if (precioUnitario === null || precioUnitario === undefined) {
      precioUnitario = 0.00;
    }
    // Obtener items del carrito con información completa
    const items = await pool.query(
      `SELECT 
        mpc.id_carrito,
        mpc.id_producto,
        mpc.id_variante,
        mpc.cantidad,
        p.nombre,
        p.foto,
        v.precio as precio_variante,
        v.stock,
        v.precio as precio_actual
      FROM m_n_prod_carrito mpc
      INNER JOIN producto p ON mpc.id_producto = p.id_producto
      LEFT JOIN variante v ON mpc.id_variante = v.id_variante
      WHERE mpc.id_carrito = $1`,
      [id_carrito]
    );

    res.json({
      carrito: carrito.rows[0],
      items: items.rows
    });
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    res.status(500).json({ error: 'Error al obtener el carrito' });
  }
};

// Agregar producto al carrito
export const agregarProducto = async (req, res) => {
  const { id_consumidor, id_comercio, id_producto, id_variante, cantidad } = req.body;

  console.log('📦 Agregar producto:', { id_consumidor, id_comercio, id_producto, id_variante, cantidad });

  if (!id_consumidor || !id_comercio || !id_producto || !cantidad) {
    console.log('❌ Faltan datos requeridos');
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  try {
    // Obtener o crear carrito
    let carrito = await pool.query(
      'SELECT * FROM carrito WHERE id_consumidor = $1 AND id_comercio = $2',
      [id_consumidor, id_comercio]
    );

    if (carrito.rows.length === 0) {
      const nuevoCarrito = await pool.query(
        'INSERT INTO carrito (id_consumidor, id_comercio, subtotal) VALUES ($1, $2, 0) RETURNING *',
        [id_consumidor, id_comercio]
      );
      carrito = nuevoCarrito;
    }

    const id_carrito = carrito.rows[0].id_carrito;

    // Verificar si el producto (con la variante específica) ya existe en el carrito
    const itemExistente = await pool.query(
      `SELECT * FROM m_n_prod_carrito 
       WHERE id_carrito = $1 AND id_producto = $2 AND 
       (($3::INT IS NULL AND id_variante IS NULL) OR id_variante = $3)`,
      [id_carrito, id_producto, id_variante || null]
    );

    if (itemExistente.rows.length > 0) {
      // Actualizar cantidad usando la clave compuesta
      await pool.query(
        `UPDATE m_n_prod_carrito SET cantidad = cantidad + $1 
         WHERE id_carrito = $2 AND id_producto = $3 AND 
         (($4::INT IS NULL AND id_variante IS NULL) OR id_variante = $4)`,
        [cantidad, id_carrito, id_producto, id_variante || null]
      );
    } else {
      // Agregar nuevo item
      await pool.query(
        'INSERT INTO m_n_prod_carrito (id_carrito, id_producto, id_variante, cantidad, precio_unitario) VALUES ($1, $2, $3, $4, $5)',
        [id_carrito, id_producto, id_variante || null, cantidad, precioUnitario]
      );
    }

    // Actualizar subtotal
    await actualizarSubtotal(id_carrito);

    res.json({ mensaje: 'Producto agregado al carrito' });
  } catch (error) {
    console.error('Error al agregar producto:', error);
    res.status(500).json({ error: 'Error al agregar producto al carrito' });
  }
};

// Actualizar cantidad de un producto
export const actualizarCantidad = async (req, res) => {
  const { id_carrito, id_producto, id_variante, cantidad } = req.body;

  if (!id_carrito || !id_producto || cantidad === undefined) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  try {
    if (cantidad <= 0) {
      // Eliminar el item por clave compuesta
      const item = await pool.query(
        `DELETE FROM m_n_prod_carrito 
         WHERE id_carrito = $1 AND id_producto = $2 AND 
         (($3::INT IS NULL AND id_variante IS NULL) OR id_variante = $3) 
         RETURNING id_carrito`,
        [id_carrito, id_producto, id_variante || null]
      );

      if (item.rows.length > 0) {
        await actualizarSubtotal(item.rows[0].id_carrito);
      }
    } else {
      // Actualizar cantidad por clave compuesta
      const item = await pool.query(
        `UPDATE m_n_prod_carrito SET cantidad = $1 
         WHERE id_carrito = $2 AND id_producto = $3 AND 
         (($4::INT IS NULL AND id_variante IS NULL) OR id_variante = $4) 
         RETURNING id_carrito`,
        [cantidad, id_carrito, id_producto, id_variante || null]
      );

      if (item.rows.length > 0) {
        await actualizarSubtotal(item.rows[0].id_carrito);
      }
    }

    res.json({ mensaje: 'Cantidad actualizada' });
  } catch (error) {
    console.error('Error al actualizar cantidad:', error);
    res.status(500).json({ error: 'Error al actualizar cantidad' });
  }
};

// Eliminar producto del carrito
export const eliminarProducto = async (req, res) => {
  // Espera id_carrito, id_producto y opcional id_variante en query string
  const { id_carrito, id_producto, id_variante } = req.query;

  if (!id_carrito || !id_producto) {
    return res.status(400).json({ error: 'Faltan datos requeridos para eliminar el item' });
  }

  try {
    const item = await pool.query(
      `DELETE FROM m_n_prod_carrito 
       WHERE id_carrito = $1 AND id_producto = $2 AND 
       (($3::INT IS NULL AND id_variante IS NULL) OR id_variante = $3) 
       RETURNING id_carrito`,
      [id_carrito, id_producto, id_variante || null]
    );

    if (item.rows.length > 0) {
      await actualizarSubtotal(item.rows[0].id_carrito);
      res.json({ mensaje: 'Producto eliminado del carrito' });
    } else {
      res.status(404).json({ error: 'Item no encontrado' });
    }
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};

// Vaciar carrito
export const vaciarCarrito = async (req, res) => {
  const { id_carrito } = req.params;

  try {
    await pool.query('DELETE FROM m_n_prod_carrito WHERE id_carrito = $1', [id_carrito]);
    await pool.query('UPDATE carrito SET subtotal = 0 WHERE id_carrito = $1', [id_carrito]);
    
    res.json({ mensaje: 'Carrito vaciado' });
  } catch (error) {
    console.error('Error al vaciar carrito:', error);
    res.status(500).json({ error: 'Error al vaciar el carrito' });
  }
};

// Función auxiliar para actualizar el subtotal
const actualizarSubtotal = async (id_carrito) => {
  const resultado = await pool.query(
    `SELECT COALESCE(SUM(
      mpc.cantidad * v.precio
    ), 0) as subtotal
    FROM m_n_prod_carrito mpc
    INNER JOIN producto p ON mpc.id_producto = p.id_producto
    LEFT JOIN variante v ON mpc.id_variante = v.id_variante
    WHERE mpc.id_carrito = $1`,
    [id_carrito]
  );

  const subtotal = resultado.rows[0].subtotal;

  await pool.query(
    'UPDATE carrito SET subtotal = $1 WHERE id_carrito = $2',
    [subtotal, id_carrito]
  );
};

// DEBUG: devolver carritos e items para un consumidor (temporal)
export const debugCarrito = async (req, res) => {
  const id_consumidor = Number(req.params.id_consumidor);
  if (!id_consumidor) return res.status(400).json({ error: 'id_consumidor inválido' });

  try {
    const carritos = await pool.query('SELECT * FROM carrito WHERE id_consumidor = $1', [id_consumidor]);
    const result = [];
    for (const c of carritos.rows) {
      const items = await pool.query('SELECT * FROM m_n_prod_carrito WHERE id_carrito = $1', [c.id_carrito]);
      result.push({ carrito: c, items: items.rows });
    }

    res.json({ carritos: carritos.rows, detalle: result });
  } catch (error) {
    console.error('Error debugCarrito:', error);
    res.status(500).json({ error: 'Error en debugCarrito' });
  }
};
