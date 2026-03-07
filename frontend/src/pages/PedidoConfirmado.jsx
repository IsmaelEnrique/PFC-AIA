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

  const paymentLabel = (id) => ({ 1: 'Efectivo', 2: 'Mercado Pago', 3: 'Transferencia' }[id] || 'Metodo');

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
          
          if (!response.ok) throw new Error("Error en la respuesta del servidor");
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
          </div>
        )}

       <div className="pedido-confirmado-block">
          <h3>Método de pago</h3>
          {pedido && (
            <div className="metodo-pago-box">
              <p><strong>{paymentLabel(pedido.id_pago)}</strong></p>
              
              {/* --- 🚀 AQUÍ VOLVEMOS A AGREGAR LA LÓGICA DEL BOTÓN --- */}
              {Number(pedido.id_pago) === 2 && (
                <div className="mp-button-container" style={{ marginTop: '20px' }}>
                  {preferenceId ? (
                    <>
                      <p style={{ fontSize: '0.9rem', marginBottom: '10px' }}>Hacé clic abajo para pagar con Mercado Pago:</p>
                      <Wallet initialization={{ preferenceId }} customization={{ texts: { valueProp: 'smart_option' } }} />
                    </>
                  ) : (
                    <p className="loading-pay-text">
                      {loadingPay ? "Generando botón de pago..." : "Hubo un problema al generar el pago. Verificá si el comercio vinculó su cuenta."}
                    </p>
                  )}
                </div>
              )}
              {/* --------------------------------------------------- */}

              {Number(pedido.id_pago) === 1 && <p>Coordinaremos el pago al momento de la entrega. Esperá nuestro mensaje.</p>}
              {Number(pedido.id_pago) === 3 && (
                <p>Esperamos tu comprobante al número {comercio.contacto || '---'} o por mail {(usuario.mail || comercio.mail) || '---'}.</p>
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
    </section>
  );
}

