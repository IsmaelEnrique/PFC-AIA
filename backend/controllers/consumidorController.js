import pool from '../db/db.js';
import bcrypt from 'bcrypt';

// Registrar nuevo consumidor
export const registrarConsumidor = async (req, res) => {
  const { nombre, apellido, mail, contrasena, id_comercio } = req.body;

  console.log('📝 Registrando consumidor:', { nombre, apellido, mail, id_comercio });

  if (!nombre || !apellido || !mail || !contrasena || !id_comercio) {
    console.log('❌ Faltan datos');
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    console.log('1️⃣ Verificando si el email ya existe en este comercio...');
    // Verificar si el email ya existe en este comercio
    const emailExiste = await pool.query(
      'SELECT * FROM consumidor WHERE mail = $1 AND id_comercio = $2',
      [mail, id_comercio]
    );

    if (emailExiste.rows.length > 0) {
      console.log('❌ Email ya existe en este comercio');
      return res.status(400).json({ error: 'El email ya está registrado en este comercio' });
    }

    console.log('2️⃣ Hasheando contraseña...');
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    console.log('3️⃣ Creando consumidor...');
    // Crear consumidor directamente (no tiene relación con usuario)
    const consumidor = await pool.query(
      `INSERT INTO consumidor (id_comercio, nombre, apellido, mail, contrasena)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id_consumidor, id_comercio, nombre, apellido, mail`,
      [id_comercio, nombre, apellido, mail, hashedPassword]
    );

    const nuevoConsumidor = consumidor.rows[0];
    console.log('✅ Consumidor creado exitosamente, ID:', nuevoConsumidor.id_consumidor);

    res.status(201).json({
      id_consumidor: nuevoConsumidor.id_consumidor,
      id_comercio: nuevoConsumidor.id_comercio,
      nombre: nuevoConsumidor.nombre,
      apellido: nuevoConsumidor.apellido,
      mail: nuevoConsumidor.mail
    });
  } catch (error) {
    console.error('❌ Error al registrar consumidor:', error);
    console.error('Código de error:', error.code);
    console.error('Detalles del error:', error.message);
    console.error('Constraint:', error.constraint);
    res.status(500).json({ 
      error: 'Error al registrar consumidor',
      detalle: error.message 
    });
  }
};

// Login de consumidor
export const loginConsumidor = async (req, res) => {
  const { mail, contrasena, id_comercio } = req.body;

  console.log('🔐 Intentando login:', { mail, id_comercio });

  if (!mail || !contrasena || !id_comercio) {
    return res.status(400).json({ error: 'Faltan credenciales' });
  }

  try {
    // Buscar consumidor en este comercio
    const consumidor = await pool.query(
      'SELECT * FROM consumidor WHERE mail = $1 AND id_comercio = $2',
      [mail, id_comercio]
    );

    if (consumidor.rows.length === 0) {
      console.log('❌ Consumidor no encontrado');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const consumer = consumidor.rows[0];

    // Verificar contraseña
    const passwordOk = await bcrypt.compare(contrasena, consumer.contrasena);

    if (!passwordOk) {
      console.log('❌ Contraseña incorrecta');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    console.log('✅ Login exitoso');

    res.json({
      id_consumidor: consumer.id_consumidor,
      id_comercio: consumer.id_comercio,
      nombre: consumer.nombre,
      apellido: consumer.apellido,
      mail: consumer.mail
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ error: 'Error en el login' });
  }
};

// Migrar carrito de localStorage a BD
export const migrarCarrito = async (req, res) => {
  const { id_consumidor, id_comercio, items } = req.body;

  if (!id_consumidor || !id_comercio || !items) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  try {
    // Obtener o crear carrito
    let carrito = await pool.query(
      'SELECT * FROM carrito WHERE id_consumidor = $1 AND id_comercio = $2',
      [id_consumidor, id_comercio]
    );

    let id_carrito;
    if (carrito.rows.length === 0) {
      const nuevoCarrito = await pool.query(
        'INSERT INTO carrito (id_consumidor, id_comercio, subtotal) VALUES ($1, $2, 0) RETURNING *',
        [id_consumidor, id_comercio]
      );
      id_carrito = nuevoCarrito.rows[0].id_carrito;
    } else {
      id_carrito = carrito.rows[0].id_carrito;
    }

    // Agregar items al carrito
    for (const item of items) {
      const { id_producto, id_variante, cantidad } = item;

      // Verificar si el item ya existe
      const existente = await pool.query(
        `SELECT * FROM m_n_prod_carrito 
         WHERE id_carrito = $1 AND id_producto = $2 AND 
         (($3::INT IS NULL AND id_variante IS NULL) OR id_variante = $3)`,
        [id_carrito, id_producto, id_variante || null]
      );

      if (existente.rows.length > 0) {
        // Actualizar cantidad sumando las cantidades
        await pool.query(
          'UPDATE m_n_prod_carrito SET cantidad = cantidad + $1 WHERE id_prod_carrito = $2',
          [cantidad, existente.rows[0].id_prod_carrito]
        );
      } else {
        // Agregar nuevo item
        await pool.query(
          'INSERT INTO m_n_prod_carrito (id_carrito, id_producto, id_variante, cantidad) VALUES ($1, $2, $3, $4)',
          [id_carrito, id_producto, id_variante || null, cantidad]
        );
      }
    }

    // Actualizar subtotal
    const resultado = await pool.query(
      `SELECT COALESCE(SUM(mpc.cantidad * v.precio), 0) as subtotal
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

    res.json({ 
      mensaje: 'Carrito migrado exitosamente',
      id_carrito,
      items_migrados: items.length
    });
  } catch (error) {
    console.error('Error al migrar carrito:', error);
    res.status(500).json({ error: 'Error al migrar el carrito' });
  }
};
