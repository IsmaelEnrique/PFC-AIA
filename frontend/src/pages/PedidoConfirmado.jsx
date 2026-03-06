import { useParams, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from 'react';
import TiendaLoading from '../components/TiendaLoading';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'; // 👈 Importamos el SDK

// Inicializamos con tu llave pública
initMercadoPago('APP_USR-ba81a412-c9a4-4d0c-9c9a-d2cce8db9847'); 

export default function PedidoConfirmado() {
  const { slug } = useParams();
  const location = useLocation();
  const pedido = location.state?.pedido;
  const detalles = location.state?.detalles || [];
  const comercio = location.state?.comercio || {};
  const usuario = location.state?.usuario || {};

  const [tiendaData, setTiendaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preferenceId, setPreferenceId] = useState(null); // 👈 Estado para el ID de pago
  const [loadingPay, setLoadingPay] = useState(false);

<<<<<<< HEAD
  // 1. Cargar datos de la tienda (lo que ya tenías)
=======
  const paymentLabel = (id) => ({ 1: 'Efectivo', 2: 'Mercado Pago', 3: 'Transferencia' }[id] || 'Metodo');

>>>>>>> pri-seguimiento
  useEffect(() => {
    if (!slug) return;
    const fetchTienda = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:4000/api/comercio/tienda/${slug}`);
        if (!res.ok) return setTiendaData(null);
        const d = await res.json();
        setTiendaData(d);
      } catch {
        setTiendaData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTienda();
  }, [slug]);

  // 2. 🚀 Lógica para generar el pago de Mercado Pago
  useEffect(() => {
    // Si el pedido existe y el método de pago es 2 (Mercado Pago)
    if (pedido && Number(pedido.id_pago) === 2 && !preferenceId) {
      const generarPreferencia = async () => {
        try {
          setLoadingPay(true);
          // Dentro de generarPreferencia, cambia la línea del fetch por esta:
          /*const response = await fetch("https://pfc-aia.onrender.com/api/pagos/crear-preferencia", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id_pedido: pedido.id_pedido, // Enviamos el UUID del pedido recién creado
              id_comercio: pedido.id_comercio, // Para buscar el token del vendedor
              items: detalles.map(d => ({
                nombre: d.producto_nombre || "Producto",
                precio: d.precio,
                cantidad: d.cantidad
              }))
            })
          });
          */
         // ... dentro de generarPreferencia ...

          // 🔄 CAMBIO: Apuntamos al backend local para testear ahora mismo
          const response = await fetch("http://localhost:4000/api/pagos/crear-preferencia", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id_pedido: pedido.id_pedido,
              id_comercio: pedido.id_comercio,
              items: detalles.map(d => ({
                nombre: d.producto_nombre || "Producto",
                precio: d.precio,
                cantidad: d.cantidad
              }))
            })
          });

          const data = await response.json();
          if (data.id) setPreferenceId(data.id);
        } catch (error) {
          console.error("Error al crear preferencia:", error);
        } finally {
          setLoadingPay(false);
        }
      };
      generarPreferencia();
    }
  }, [pedido, detalles, preferenceId]);

  if (loading || !tiendaData) return <TiendaLoading />;

  const tipoDiseño = tiendaData?.comercio ? Number(tiendaData.comercio.tipo_diseño) : 1;
  const themeClass = tipoDiseño === 1 ? 'minimal' : (tipoDiseño === 2 ? 'colorful' : 'modern');

  return (
<<<<<<< HEAD
    <section style={{ padding: 24, maxWidth: '600px', margin: '0 auto' }}>
      <h1>¡Pedido # {pedido?.numero_pedido} recibido! 🛍️</h1>
      <p>Gracias por tu compra en <strong>{tiendaData.nombre_comercio}</strong>.</p>
      
      <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', margin: '20px 0' }}>
        <h3>Estado del pago:</h3>
        
        {/* Lógica condicional según el método de pago */}
        {pedido && (
          <div>
            <p>Método: <strong>{{1:'Efectivo', 2:'Mercado Pago', 3:'Transferencia'}[pedido.id_pago]}</strong></p>
            
            {/* OPCIÓN 1: EFECTIVO */}
            {Number(pedido.id_pago) === 1 && (
              <p>Coordinaremos el pago al momento de la entrega. ¡Estate atento a nuestros mensajes!</p>
            )}

            {/* OPCIÓN 2: MERCADO PAGO 💳 */}
            {Number(pedido.id_pago) === 2 && (
              <div style={{ marginTop: '15px' }}>
                {preferenceId ? (
                  <>
                    <p>Hacé clic abajo para completar tu pago de forma segura:</p>
                    <Wallet initialization={{ preferenceId }} customization={{ texts: { valueProp: 'smart_option' } }} />
                  </>
                ) : (
                  <p>{loadingPay ? "Generando botón de pago..." : "Hubo un problema al generar el pago. Contactate con la tienda."}</p>
                )}
              </div>
            )}

            {/* OPCIÓN 3: TRANSFERENCIA */}
            {Number(pedido.id_pago) === 3 && (
              <div style={{ borderLeft: '4px solid #009EE3', paddingLeft: '10px' }}>
                <p>Por favor, realizá la transferencia y enviá el comprobante:</p>
                <ul>
                  <li>📱 WhatsApp: {comercio.contacto || 'No disponible'}</li>
                  <li>📧 Email: {usuario.mail || comercio.mail}</li>
                </ul>
              </div>
            )}
=======
    <section className={`pedido-confirmado-page ${themeClass}`}>
      <div className="pedido-confirmado-container">
        <h1>Pedido confirmado</h1>
        <p className="pedido-confirmado-intro">Gracias por tu compra. Tu pedido fue creado correctamente en espera hasta que recibamos tu pago. Recibiras por mail las actualizaciones de tu pedido.</p>
        {pedido?.numero_pedido && <p className="pedido-confirmado-number"><strong>Numero de pedido:</strong> {pedido.numero_pedido}</p>}

        {detalles.length > 0 && (
          <div className="pedido-confirmado-block">
            <h3>Detalle de la compra</h3>
            <ul className="pedido-confirmado-list">
              {detalles.map(d => (
                <li key={d.id_detallepedido} className="pedido-confirmado-item">
                  <span>{d.producto_nombre || `Producto ${d.id_producto}`}</span>
                  <span>x{d.cantidad}</span>
                  <span>${Number(d.precio).toFixed(2)}</span>
                </li>
              ))}
            </ul>
>>>>>>> pri-seguimiento
          </div>
        )}

        <div className="pedido-confirmado-block">
          <h3>Metodo de pago</h3>
          {pedido && (
            <div>
              <p><strong>{paymentLabel(pedido.id_pago)}</strong></p>
              {Number(pedido.id_pago) === 1 && <p>Coordinaremos el pago al momento de la entrega. Espera nuestro mensaje.</p>}
              {Number(pedido.id_pago) === 3 && (
                <p>Esperamos tu comprobante al numero {comercio.contacto || '---'} o por mail {(usuario.mail || comercio.mail) || '---'}.</p>
              )}
            </div>
          )}
        </div>

        <p className="pedido-confirmado-action">
          <Link to={`/tienda/${slug}`} className="pedido-confirmado-back">
            Volver a la tienda
          </Link>
        </p>
      </div>
<<<<<<< HEAD

      {/* Detalle de compra (igual que tenías) */}
      <div style={{ marginTop: 12 }}>
        <h3>Tu resumen:</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {detalles.map(d => (
            <li key={d.id_detallepedido} style={{ borderBottom: '1px solid #eee', padding: '8px 0' }}>
              {d.producto_nombre} — x{d.cantidad} — <strong>${Number(d.precio).toFixed(2)}</strong>
            </li>
          ))}
        </ul>
        <p style={{ textAlign: 'right', fontSize: '1.2rem' }}>Total: <strong>${Number(pedido?.total).toFixed(2)}</strong></p>
      </div>

      <p style={{ marginTop: 24, textAlign: 'center' }}>
        <Link to={`/tienda/${slug}`} className="btn-back">Volver a la tienda</Link>
      </p>
=======
>>>>>>> pri-seguimiento
    </section>
  );
}