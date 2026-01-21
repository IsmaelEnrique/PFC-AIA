import pool from "../db/db.js";

export const activarComercio = async (req, res) => {
  try {
    const id_usuario = Number(req.body.id_usuario);
    const { nombre, rubro, descripcion, direccion, contacto, cuit, activo } = req.body;

    console.log("Datos recibidos:", { id_usuario, nombre, rubro, descripcion, direccion, contacto, cuit, activo });

    // Validaciones básicas
    if (!id_usuario || isNaN(id_usuario)) {
      return res.status(400).json({ error: "Usuario inválido" });
    }

    // 1. Verificar si ya existe un comercio para este usuario
    const existente = await pool.query(
      "SELECT * FROM comercio WHERE id_usuario = $1",
      [id_usuario]
    );

    console.log("Comercio existente:", existente.rows);

    if (existente.rows.length > 0) {
      // 2. Si existe, lo actualizamos (Update)
      const comercioActual = existente.rows[0];
      
      // Usar valores enviados o los existentes
      const nombreFinal = nombre && nombre.trim() ? nombre.trim() : comercioActual.nombre_comercio;
      const rubroFinal = rubro && rubro.trim() ? rubro.trim() : comercioActual.rubro;
      const descripcionFinal = descripcion || comercioActual.descripcion;
      const direccionFinal = direccion || comercioActual.direccion;
      const contactoFinal = contacto || comercioActual.contacto;
      const cuitFinal = cuit || comercioActual.cuit;
      const activoFinal = activo !== undefined ? activo : comercioActual.activo;

      console.log("Actualizando con:", { nombreFinal, rubroFinal, descripcionFinal, direccionFinal, contactoFinal, cuitFinal, activoFinal });

      const actualizado = await pool.query(
        `UPDATE comercio 
         SET nombre_comercio = $1, 
             rubro = $2, 
             descripcion = $3, 
             direccion = $4, 
             contacto = $5, 
             cuit = $6,
             activo = $7
         WHERE id_usuario = $8 
         RETURNING *`,
        [
          nombreFinal,
          rubroFinal,
          descripcionFinal,
          direccionFinal,
          contactoFinal,
          cuitFinal,
          activoFinal,
          id_usuario,
        ]
      );

      console.log("Update exitoso:", actualizado.rows[0]);
      return res.json(actualizado.rows[0]);
    } else {
      // 3. Si no existe, lo creamos (Insert)
      if (!nombre || !nombre.trim() || !rubro || !rubro.trim()) {
        return res.status(400).json({ error: "Nombre y Rubro son obligatorios para crear un comercio" });
      }

      console.log("Creando nuevo comercio");

      const nuevo = await pool.query(
        `INSERT INTO comercio 
         (id_usuario, nombre_comercio, rubro, descripcion, direccion, contacto, cuit, activo) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING *`,
        [
          id_usuario,
          nombre.trim(),
          rubro.trim(),
          descripcion || null,
          direccion || null,
          contacto || null,
          cuit || null,
          true,
        ]
      );

      console.log("Insert exitoso:", nuevo.rows[0]);
      return res.status(201).json(nuevo.rows[0]);
    }
  } catch (error) {
    console.error("Error completo en activarComercio:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).json({ error: "Error interno del servidor", details: error.message });
  }
};