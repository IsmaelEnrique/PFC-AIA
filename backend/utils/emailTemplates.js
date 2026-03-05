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