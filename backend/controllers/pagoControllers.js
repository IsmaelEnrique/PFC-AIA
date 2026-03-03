import { supabase } from '../config/supabase.js';
import { sendEmail } from '../utils/mailer.js';
import { generarFacturaHTML } from '../utils/emailTemplates.js';

// 1. Esta es la función de apoyo que ya tenías (mantenela igual o dentro del mismo archivo)
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

    if (error || !pedido) throw new Error("Pedido no encontrado en la base de datos");

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

    console.log("✅ Notificaciones enviadas correctamente");
  } catch (err) {
    console.error("❌ Error procesando notificaciones:", err.message);
  }
};

// 2. ESTE ES EL CONTROLADOR que maneja la ruta (el que recibe el req y res)
export const recibirConfirmacionPago = async (req, res) => {
  try {
    // Mercado Pago envía los datos por la URL (Query Params)
    const { status, external_reference } = req.query;

    if (status === 'approved') {
      const idPedido = external_reference; // Aquí viaja el UUID de tu tabla 'pedido'

      // Actualizamos el estado del pedido en Supabase a 'Pagado'
      await supabase
        .from('pedido')
        .update({ estado: 'Pagado' })
        .eq('id_pedido', idPedido);

      // LLAMAMOS A LA FUNCIÓN DE NOTIFICACIONES
      await procesarNotificaciones(idPedido);

      // Redirigimos al usuario a tu pantalla de éxito en el Frontend
      // Si estás en Render, esto debería ser tu URL de producción o localhost si probás local
      return res.redirect(`http://localhost:5173/perfil?status=success`);
    }

    res.redirect(`http://localhost:5173/perfil?status=error`);

  } catch (error) {
    console.error("Error en el controlador de pagos:", error);
    res.status(500).send("Error interno");
  }
};