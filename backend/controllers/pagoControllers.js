import { MercadoPagoConfig, Preference } from 'mercadopago';
import { supabase } from '../config/supabase.js';
import { sendEmail } from '../utils/mailer.js';
import { generarFacturaHTML } from '../utils/emailTemplates.js';
/*
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
*/
const FRONTEND_URL = "https://emprendify.vercel.app";
const BACKEND_URL = "https://pfc-aia.onrender.com";
// 1. Notificaciones (Mantenemos tu lógica pero corregimos la consulta)
export const procesarNotificaciones = async (idPedido) => {
  try {
    const { data: pedido, error } = await supabase
      .from('pedido')
      .select(`
        *,
        detalle_pedido (*),
        consumidor:id_consumidor (mail, nombre),
        comercio:id_comercio (mail, nombre_comercio)
      `)
      .eq('id_pedido', idPedido)
      .single();

    if (error || !pedido) throw new Error("Pedido no encontrado");

    // Mail al Cliente
    await sendEmail(
      pedido.consumidor.mail,
      `Confirmación de Pedido #${pedido.numero_pedido}`,
      generarFacturaHTML(pedido, pedido.detalle_pedido, pedido.consumidor.nombre)
    );

    // Mail al Vendedor
    await sendEmail(
      pedido.comercio.mail,
      `¡Nueva Venta! Pedido #${pedido.numero_pedido}`,
      `<h3>Venta realizada con éxito</h3><p>Total a cobrar: $${pedido.total}</p>`
    );
  } catch (err) {
    console.error("❌ Error notificaciones:", err.message);
  }
};

// 2. 🚀 NUEVO: Función para generar el link de pago
export const crearPreferencia = async (req, res) => {
  const { id_pedido, items, id_comercio } = req.body;

  try {
    // Buscamos el token del dueño de ESTA tienda
    const { data: vendedor, error: errV } = await supabase
      .from('usuario')
      .select('mp_access_token')
      .eq('id_comercio', id_comercio) // Relación directa o vía tabla comercio
      .single();

    if (!vendedor?.mp_access_token) {
      return res.status(400).json({ error: "El comercio no tiene MP vinculado" });
    }

    const client = new MercadoPagoConfig({ accessToken: vendedor.mp_access_token });
    const preference = new Preference(client);

    const result = await preference.create({
      body:{
        items: items.map(i => ({
          title: i.nombre || i.producto_nombre || "Producto de Emprendify",
          unit_price: Number(i.precio),
          quantity: Number(i.cantidad),
          currency_id: 'ARS'
        })),
        // 🔑 CLAVE: El external_reference para que recibirConfirmacionPago funcione
        external_reference: id_pedido, 
       back_urls: {
          // El cliente vuelve a través de tu backend para que proceses la lógica
          success: `${BACKEND_URL}/api/pagos/callback`,
          failure: `${FRONTEND_URL}/tienda/${comercioData.slug}/confirmacion?status=error`,
          pending: `${FRONTEND_URL}/tienda/${comercioData.slug}/confirmacion?status=pending`,
        },
        auto_return: "approved",
      }
    });

    res.json({ id: result.id, init_point: result.init_point });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Tu controlador de Callback (Con una pequeña corrección)
export const recibirConfirmacionPago = async (req, res) => {
  try {
    const { status, external_reference } = req.query;

    if (status === 'approved') {
      const idPedido = external_reference; 

      // Actualizamos a 'Pagado'
      await supabase
        .from('pedido')
        .update({ estado: 'Pagado' })
        .eq('id_pedido', idPedido);

      await procesarNotificaciones(idPedido);

      // Redirigimos a la tienda (Ajustá esta URL a la de tu tienda frontend)
      return res.redirect(`${FRONTEND_URL}/pedido-exitoso?id=${idPedido}`);
    }

    res.redirect(`${FRONTEND_URL}/pago-error`);
  } catch (error) {
    res.status(500).send("Error interno");
  }
};