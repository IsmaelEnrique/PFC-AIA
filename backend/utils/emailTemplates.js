export const generarFacturaHTML = (pedido, detalles, nombreCliente) => {
  const filasItems = detalles.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">Producto #${item.id_producto}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.cantidad}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.precio}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
      <h2 style="color: #009EE3;">Factura de Compra - Pedido #${pedido.numero_pedido}</h2>
      <p>Hola <b>${nombreCliente}</b>, gracias por comprar en Emprendify.</p>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f8f8f8;">
            <th style="text-align: left; padding: 10px;">Descripción</th>
            <th style="text-align: center; padding: 10px;">Cant.</th>
            <th style="text-align: right; padding: 10px;">Precio</th>
          </tr>
        </thead>
        <tbody>${filasItems}</tbody>
      </table>
      <div style="margin-top: 20px; text-align: right; font-size: 18px;">
        <b>Total Pagado: $${pedido.total}</b>
      </div>
    </div>
  `;
};

export const plantillaVerificacion = (nombre, url) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
      <h2 style="color: #009EE3; text-align: center;">¡Bienvenido a Emprendify! 🚀</h2>
      <p>Hola <b>${nombre}</b>, gracias por registrarte.</p>
      <p>Para activar tu cuenta y poder empezar a operar, por favor hacé clic en el siguiente botón:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${url}" style="background-color: #009EE3; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
          Verificar mi cuenta
        </a>
      </div>
      <p style="font-size: 12px; color: #666; text-align: center;">
        Este enlace expirará en <b>24 horas</b>.<br>
        Si el botón no funciona, podés copiar y pegar este link: <br>
        ${url}
      </p>
    </div>
  `;
};

export const generarMailSeguimiento = (pedido, nuevoEstado, nombreCliente) => {
  const configuracionEstados = {
    'Cancelado': {
      titulo: 'Pedido Cancelado',
      color: '#e53e3e',
      mensaje: 'Lo sentimos, tu pedido ha sido cancelado por el comercio. Si tenés dudas, contactate con ellos.'
    },
    'Confirmado': {
      titulo: '¡Pedido Confirmado!',
      color: '#38a169',
      mensaje: '¡Buenas noticias! Tu pago fue verificado y el pedido ya está confirmado.'
    },
    'En espera': {
      titulo: 'Pago en Espera',
      color: '#d69e2e',
      mensaje: 'Estamos esperando la acreditación de tu pago para poder procesar el pedido.'
    },
    'Pendiente': {
      titulo: 'Pedido Recibido',
      color: '#4a5568',
      mensaje: 'Recibimos tu pedido. El comercio lo revisará a la brevedad.'
    },
    'En preparación': {
      titulo: 'Preparando tu pedido',
      color: '#805ad5',
      mensaje: 'El comercio ya está preparando tus productos. ¡Falta poco!'
    },
    'Enviado': {
      titulo: '🚚 Pedido en camino',
      color: '#3182ce',
      mensaje: '¡Tu pedido ya fue despachado! Pronto llegará a tu domicilio.'
    },
    'Retirado': {
      titulo: '✅ Pedido Entregado',
      color: '#38a169',
      mensaje: '¡Gracias por retirar tu pedido en nuestro local!'
    },
    'Entregado': {
      titulo: '✅ Pedido Recibido',
      color: '#38a169',
      mensaje: '¡Confirmamos que tu pedido ha sido entregado con éxito!'
    }
  };

  const info = configuracionEstados[nuevoEstado] || { 
    titulo: 'Actualización de Pedido', 
    color: '#4a5568', 
    mensaje: `Tu pedido ha cambiado al estado: ${nuevoEstado}` 
  };

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
      <div style="text-align: center; border-bottom: 2px solid ${info.color}; padding-bottom: 10px;">
        <h2 style="color: ${info.color};">${info.titulo}</h2>
      </div>
      <p style="font-size: 16px; color: #333; margin-top: 20px;">Hola <strong>${nombreCliente}</strong>,</p>
      <p style="font-size: 15px; color: #555; line-height: 1.5;">${info.mensaje}</p>
      
      <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Número de Pedido:</strong> #${pedido.numero_pedido}</p>
        <p style="margin: 5px 0;"><strong>Comercio:</strong> ${pedido.comercio.nombre_comercio}</p>
        <p style="margin: 5px 0;"><strong>Total:</strong> $${pedido.total}</p>
      </div>

      <p style="font-size: 13px; color: #999; text-align: center;">Podés seguir el estado desde tu perfil en nuestra web.</p>
    </div>
  `;
};