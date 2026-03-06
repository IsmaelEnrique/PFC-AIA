import { useParams, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from 'react';
import TiendaLoading from '../components/TiendaLoading';

export default function PedidoConfirmado() {
  const { slug } = useParams();
  const location = useLocation();
  const pedido = location.state?.pedido;
  const detalles = location.state?.detalles || [];
  const comercio = location.state?.comercio || {};
  const usuario = location.state?.usuario || {};

  const [tiendaData, setTiendaData] = useState(null);
  const [loading, setLoading] = useState(false);

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
    </section>
  );
}
