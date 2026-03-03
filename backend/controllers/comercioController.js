import pool from "../db/db.js";

// Obtener comercio del usuario
export const getComercioByUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.query;

    if (!id_usuario) {
      return res.status(400).json({ error: "id_usuario es requerido" });
    }

    const result = await pool.query(
      "SELECT * FROM comercio WHERE id_usuario = $1",
      [id_usuario]
    );

    if (result.rows.length === 0) {
      return res.json(null);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener comercio:", error);
    res.status(500).json({ error: "Error al obtener comercio" });
  }
};

export const activarComercio = async (req, res) => {
  try {
    const id_usuario = Number(req.body.id_usuario);
    const { nombre, rubro, descripcion, direccion, contacto, cuit, activo, tipo_diseno, slug } = req.body;
    const tipoDiseno =
      tipo_diseno === undefined || tipo_diseno === null ? null : Number(tipo_diseno);

    // Validaciones básicas
    if (!id_usuario || Number.isNaN(id_usuario)) {
      return res.status(400).json({ error: "Usuario inválido" });
    }

    if (tipoDiseno !== null && ![1, 2, 3].includes(tipoDiseno)) {
      return res.status(400).json({ error: "tipo_diseno inválido" });
    }

    // 1. Verificar si ya existe un comercio para este usuario
    const existente = await pool.query(
      "SELECT * FROM comercio WHERE id_usuario = $1",
      [id_usuario]
    );

    if (existente.rows.length > 0) {
      // 2. Si existe, lo actualizamos (Update)
      const comercioActual = existente.rows[0];

      // Usar valores enviados, nombre es obligatorio, resto puede ser null
      const nombreFinal = nombre && nombre.trim() ? nombre.trim() : comercioActual.nombre_comercio;
      const rubroFinal = rubro || null;
      const descripcionFinal = descripcion || null;
      const direccionFinal = direccion || null;
      const contactoFinal = contacto || null;
      const cuitFinal = cuit || null;
      const slugFinal = slug || null;
      const activoFinal = activo !== undefined ? activo : comercioActual.activo;
      const tipoDisenoFinal =
        tipoDiseno !== null ? tipoDiseno : comercioActual["tipo_diseño"] || null;

      const actualizado = await pool.query(
        `UPDATE comercio 
         SET nombre_comercio = $1, 
             rubro = $2, 
             descripcion = $3, 
             direccion = $4, 
             contacto = $5, 
             cuit = $6,
             "tipo_diseño" = $7,
             activo = $8,
             slug = $9
         WHERE id_usuario = $10 
         RETURNING *`,
        [
          nombreFinal,
          rubroFinal,
          descripcionFinal,
          direccionFinal,
          contactoFinal,
          cuitFinal,
          tipoDisenoFinal,
          activoFinal,
          slugFinal,
          id_usuario,
        ]
      );

      return res.json(actualizado.rows[0]);
    }

    // 3. Si no existe, lo creamos (Insert)
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio para crear un comercio" });
    }

    const nuevo = await pool.query(
      `INSERT INTO comercio 
       (id_usuario, nombre_comercio, rubro, descripcion, direccion, contacto, cuit, "tipo_diseño", activo, slug) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [
        id_usuario,
        nombre.trim(),
        rubro || null,
        descripcion || null,
        direccion || null,
        contacto || null,
        cuit || null,
        tipoDiseno || null,
        true,
        slug || null,
      ]
    );

    return res.status(201).json(nuevo.rows[0]);
  } catch (error) {
    console.error("Error completo en activarComercio:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).json({ error: "Error interno del servidor", details: error.message });
  }
};

export const actualizarLogo = async (req, res) => {
  try {
    const id_usuario = Number(req.body.id_usuario);
    const { logo } = req.body;

    if (!id_usuario || Number.isNaN(id_usuario)) {
      return res.status(400).json({ error: "Usuario inválido" });
    }

    if (!logo || typeof logo !== "string") {
      return res.status(400).json({ error: "Logo inválido" });
    }

    const existente = await pool.query(
      "SELECT id_comercio FROM comercio WHERE id_usuario = $1",
      [id_usuario]
    );

    if (existente.rows.length === 0) {
      return res.status(404).json({ error: "No se encontró el comercio para este usuario" });
    }

    const actualizado = await pool.query(
      "UPDATE comercio SET logo = $1 WHERE id_usuario = $2 RETURNING *",
      [logo, id_usuario]
    );

    return res.json(actualizado.rows[0]);
  } catch (error) {
    console.error("Error al actualizar logo:", error);
    return res.status(500).json({ error: "Error al guardar el logo" });
  }
};

export const actualizarDiseno = async (req, res) => {
  try {
    const id_usuario = Number(req.body.id_usuario);
    const tipoDiseno = Number(req.body.tipo_diseno);

    if (!id_usuario || Number.isNaN(id_usuario)) {
      return res.status(400).json({ error: "Usuario inválido" });
    }

    if (![1, 2, 3].includes(tipoDiseno)) {
      return res.status(400).json({ error: "tipo_diseno inválido" });
    }

    const existente = await pool.query(
      "SELECT id_comercio FROM comercio WHERE id_usuario = $1",
      [id_usuario]
    );

    if (existente.rows.length === 0) {
      return res.status(404).json({ error: "No se encontró el comercio para este usuario" });
    }

    const actualizado = await pool.query(
      'UPDATE comercio SET "tipo_diseño" = $1 WHERE id_usuario = $2 RETURNING *',
      [tipoDiseno, id_usuario]
    );

    return res.json(actualizado.rows[0]);
  } catch (error) {
    console.error("Error al actualizar tipo_diseño:", error);
    return res.status(500).json({ error: "Error al guardar el diseño" });
  }
};

// Endpoint optimizado para tienda pública
export const getTiendaPublica = async (req, res) => {
  try {
    const { slug } = req.params;
    console.log("🔍 Buscando tienda con slug:", slug);

    // 1️⃣ Obtener comercio por slug (debe estar activo)
    const comercioResult = await pool.query(
      "SELECT * FROM comercio WHERE slug = $1 AND activo = true",
      [slug]
    );

    if (comercioResult.rows.length === 0) {
      console.log("❌ Comercio no encontrado");
      return res.status(404).json({ error: "Tienda no encontrada" });
    }

    const comercio = comercioResult.rows[0];
    console.log("✅ Comercio encontrado:", comercio.nombre_comercio);

    // 2️⃣ Obtener categorías del comercio
    const categoriasResult = await pool.query(
      "SELECT * FROM categoria WHERE id_comercio = $1",
      [comercio.id_comercio]
    );

    const categorias = categoriasResult.rows;
    console.log("📁 Categorías encontradas:", categorias.length);

    // 3️⃣ Obtener productos activos
    const productosResult = await pool.query(
      "SELECT * FROM producto WHERE id_comercio = $1 AND activo = true ORDER BY nombre",
      [comercio.id_comercio]
    );

    const productos = productosResult.rows;
    console.log("📦 Productos encontrados:", productos.length);

    // 4️⃣ Obtener variantes para cada producto
    for (const producto of productos) {
      try {
        const variantesResult = await pool.query(
          `SELECT * FROM variante WHERE id_producto = $1`,
          [producto.id_producto]
        );

        const variantes = variantesResult.rows;
        console.log(`📊 Producto ${producto.nombre}: ${variantes.length} variantes`);
        
        for (const variante of variantes) {
          const caracteristicasResult = await pool.query(
            `SELECT c.id_caracteristica, c.nombre_caracteristica, v.id_valor, v.nombre_valor
             FROM valor v
             INNER JOIN variante_valor vv ON v.id_valor = vv.id_valor
             INNER JOIN caracteristica c ON v.id_caracteristica = c.id_caracteristica
             WHERE vv.id_variante = $1`,
            [variante.id_variante]
          );
          variante.caracteristicas = caracteristicasResult.rows;
          console.log(`  ↳ Variante ${variante.id_variante}: precio=${variante.precio}, caracteristicas=${variante.caracteristicas.length}`);
        }

        producto.variantes = variantes;
      } catch (varianteError) {
        console.log("⚠️ Error obteniendo variantes:", varianteError.message);
        producto.variantes = [];
      }

      // 5️⃣ Obtener categorías de cada producto
      try {
        const categoriasProductoResult = await pool.query(
          `SELECT c.id_categoria, c.nombre_cat
           FROM categoria c
           INNER JOIN m_n_cat_prod mcp ON c.id_categoria = mcp.id_categoria
           WHERE mcp.id_producto = $1`,
          [producto.id_producto]
        );
        producto.categorias = categoriasProductoResult.rows;
      } catch (catError) {
        console.log("⚠️ Error al obtener categorías del producto");
        producto.categorias = [];
      }
    }

    console.log("✅ Datos completos listos para enviar");

    // Respuesta unificada
    res.json({
      comercio,
      categorias,
      productos
    });

  } catch (error) {
    console.error("❌ Error en getTiendaPublica:", error);
    res.status(500).json({ error: "Error al cargar la tienda" });
  }
};

// Obtener métodos (ids) activos para un comercio dado el id_usuario
export const getMetodosComercio = async (req, res) => {
  try {
    const { id_usuario } = req.query;
    if (!id_usuario) return res.status(400).json({ error: "id_usuario es requerido" });

    const comercioRes = await pool.query("SELECT id_comercio FROM comercio WHERE id_usuario = $1", [Number(id_usuario)]);
    if (comercioRes.rows.length === 0) return res.status(404).json({ error: "No se encontró comercio" });
    const id_comercio = comercioRes.rows[0].id_comercio;

    const pagosRes = await pool.query(
      `SELECT id_pago FROM comercio_metodo_pago WHERE id_comercio = $1`,
      [id_comercio]
    );

    const enviosRes = await pool.query(
      `SELECT id_envio FROM comercio_metodo_envio WHERE id_comercio = $1`,
      [id_comercio]
    );

    res.json({ payments: pagosRes.rows.map(r => r.id_pago), shipping: enviosRes.rows.map(r => r.id_envio) });
  } catch (error) {
    console.error("Error getMetodosComercio:", error);
    res.status(500).json({ error: "Error al leer métodos del comercio" });
  }
};

// Actualizar los métodos seleccionados para un comercio (recibe id_usuario y arrays de ids)
export const setMetodosComercio = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id_usuario, payments = [], shipping = [] } = req.body;
    console.log('setMetodosComercio called with:', { id_usuario, payments, shipping });
    if (!id_usuario) return res.status(400).json({ error: "id_usuario es requerido" });

    await client.query('BEGIN');

    const comercioRes = await client.query("SELECT id_comercio FROM comercio WHERE id_usuario = $1", [Number(id_usuario)]);
    if (comercioRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "No se encontró comercio para el usuario" });
    }
    const id_comercio = comercioRes.rows[0].id_comercio;
    console.log('Found id_comercio=', id_comercio);

    // Borrar antiguos y agregar nuevos
    await client.query("DELETE FROM comercio_metodo_pago WHERE id_comercio = $1", [id_comercio]);
    let insertedPayments = 0;
    for (const id_pago of payments) {
      const r = await client.query("INSERT INTO comercio_metodo_pago (id_comercio, id_pago) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *", [id_comercio, id_pago]);
      if (r.rowCount) insertedPayments += r.rowCount;
    }

    console.log(`Inserted ${insertedPayments} payment rows for comercio ${id_comercio}`);

    let insertedShipping = 0;
    await client.query("DELETE FROM comercio_metodo_envio WHERE id_comercio = $1", [id_comercio]);
    for (const id_envio of shipping) {
      const r = await client.query("INSERT INTO comercio_metodo_envio (id_comercio, id_envio) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *", [id_comercio, id_envio]);
      if (r.rowCount) insertedShipping += r.rowCount;
    }

    console.log(`Inserted ${insertedShipping} shipping rows for comercio ${id_comercio}`);

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error setMetodosComercio:", error);
    res.status(500).json({ error: "Error al guardar métodos del comercio" });
  } finally {
    client.release();
  }
};
