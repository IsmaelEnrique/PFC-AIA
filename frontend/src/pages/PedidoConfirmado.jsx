import { useParams, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from 'react';
import TiendaLoading from '../components/TiendaLoading';

export default function PedidoConfirmado() {
  const { slug, id } = useParams();
  const location = useLocation();
  const pedido = location.state?.pedido;
  const detalles = location.state?.detalles || [];
  const comercio = location.state?.comercio || {};
  const usuario = location.state?.usuario || {};

  const [tiendaData, setTiendaData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const fetchTienda = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:4000/api/comercio/tienda/${slug}`);
        if (!res.ok) return setTiendaData(null);
        const d = await res.json();
        setTiendaData(d);
      } catch (e) {
        setTiendaData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTienda();
  }, [slug]);

  if (loading || !tiendaData) return <TiendaLoading />;

  return (
    <section style={{ padding: 24 }}>
      <h1>Pedido confirmado</h1>
      <p>Gracias por tu compra. Tu pedido fue creado correctamente en espera hasta que recibamos tu pago. Recibirás por mail las actualizaciones de tu pedido!</p>
      {pedido?.numero_pedido && <p><strong>Número de pedido:</strong> {pedido.numero_pedido}</p>}

      {detalles.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <h3>Detalle de la compra</h3>
          <ul>
            {detalles.map(d => (
              <li key={d.id_detallepedido}>{d.producto_nombre || `Producto ${d.id_producto}`} — x{d.cantidad} — ${Number(d.precio).toFixed(2)}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <h3>Método de pago:</h3>
        {pedido && (
          <div>
            <p><strong>{( {1:'Efectivo',2:'Mercado Pago',3:'Transferencia'}[pedido.id_pago] ) || 'Método'}</strong></p>
            {Number(pedido.id_pago) === 1 && <p>Coordinaremos el pago al momento de la entrega. Espera nuestro mensaje.</p>}
            {Number(pedido.id_pago) === 3 && (
              <p>Esperamos tu comprobante al número {comercio.contacto || '---'} o por mail {(usuario.mail || comercio.mail) || '---'}.</p>
            )}
          </div>
        )}
      </div>
      <p style={{ marginTop: 18 }}>
        <Link
          to={`/tienda/${slug}`}
          style={{
            display: 'inline-block',
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: 6,
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          Volver a la tienda
        </Link>
      </p>
    </section>
  );
}
