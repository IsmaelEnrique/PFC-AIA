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
    const { nombre, rubro, descripcion, direccion, contacto, cuit, activo, tipo_diseno } = req.body;
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
             activo = $8
         WHERE id_usuario = $9 
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
       (id_usuario, nombre_comercio, rubro, descripcion, direccion, contacto, cuit, "tipo_diseño", activo) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
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
