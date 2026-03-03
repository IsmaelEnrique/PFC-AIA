import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useCart from "../hooks/useCart";

export default function Checkout() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [tiendaData, setTiendaData] = useState(null);
  const [consumidor, setConsumidor] = useState(null);
  const [available, setAvailable] = useState({ payments: [], shipping: [] });
  const [selected, setSelected] = useState({ payment: null, shipping: null });
  const { carrito, idCarrito, calcularTotal } = useCart({ tiendaData, consumidor });

  const tipoDiseño = tiendaData?.comercio ? Number(tiendaData.comercio.tipo_diseño) : 1;
  const themeClass = tipoDiseño === 1 ? 'minimal' : (tipoDiseño === 2 ? 'colorful' : 'modern');

  useEffect(() => {
    const c = localStorage.getItem('consumidor');
    if (c) setConsumidor(JSON.parse(c));
  }, []);

  useEffect(() => {
    if (!slug) return;
    fetch(`http://localhost:4000/api/comercio/tienda/${slug}`)
      .then(r => r.json())
      .then(d => setTiendaData(d))
      .catch(() => {});
  }, [slug]);

  useEffect(() => {
    if (!tiendaData) return;
    // get enabled methods for this commerce (uses id_usuario from comercio)
    fetch(`http://localhost:4000/api/comercio/metodos?id_usuario=${tiendaData.comercio.id_usuario}`)
      .then(r => r.json())
      .then(data => {
        const pm = data.payments || [];
        const sh = data.shipping || [];
        setAvailable({ payments: pm, shipping: sh });
        setSelected({ payment: pm[0] || null, shipping: sh[0] || null });
      })
      .catch(() => {});
  }, [tiendaData]);

  const paymentLabel = (id) => ({ 1: 'Efectivo', 2: 'Mercado Pago', 3: 'Transferencia' }[id] || `Pago ${id}`);
  const shippingLabel = (id) => ({ 1: 'Retiro en el local', 2: 'Envío por correo' }[id] || `Envio ${id}`);

  const handleConfirm = async () => {
    if (!consumidor) return alert('Debés iniciar sesión como comprador para finalizar la compra');
    if (!selected.payment || !selected.shipping) return alert('Seleccioná método de pago y envío');
    const payload = {
      id_carrito: idCarrito,
      id_consumidor: consumidor.id_consumidor,
      id_comercio: tiendaData.comercio.id_comercio,
      total: calcularTotal(),
      id_pago: selected.payment,
      id_envio: selected.shipping,
    };

    try {
      const res = await fetch('http://localhost:4000/api/pedidos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) return alert(data.error || 'Error al crear pedido');
      // success: navigate to confirmation
      navigate(`/tienda/${slug}/pedido/${data.pedido.id_pedido}`, { state: { pedido: data.pedido } });
    } catch (e) { console.error(e); alert('Error conectando al servidor'); }
  };

  if (!tiendaData) return <div>Cargando tienda...</div>;

  return (
    <section className={`checkout-page ${themeClass}`}>
      <div className="checkout-container">
        <h1>Finalizar compra</h1>

        <div className="checkout-grid">
          <div className="checkout-summary">
            <h3>Resumen</h3>
            {carrito.length === 0 ? <p>No hay productos en el carrito</p> : (
              <ul className="checkout-items">
                {carrito.map(i => (
                  <li key={i.key} className="checkout-item">
                    <div className={`checkout-thumb ${themeClass}`}>
                      {i.producto.foto ? <img src={i.producto.foto} alt={i.producto.name} /> : <div className="thumb-placeholder">📦</div>}
                    </div>
                    <div className="checkout-item-info">
                      <div className="checkout-item-name">{i.producto.name}</div>
                      <div className="checkout-item-meta">x {i.cantidad} — ${(i.precio * i.cantidad).toFixed(2)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <p className="checkout-total"><strong>Total: </strong>${calcularTotal().toFixed(2)}</p>
          </div>

          <div className="checkout-options">
            <h3>Método de pago</h3>
            {available.payments.length === 0 && <p>No hay métodos de pago habilitados.</p>}
            {available.payments.map(pid => (
              <label key={pid} className="checkout-option">
                <input type="radio" name="payment" checked={selected.payment === pid} onChange={() => setSelected(s => ({ ...s, payment: pid }))} /> <span>{paymentLabel(pid)}</span>
              </label>
            ))}

            <h3>Envio</h3>
            {available.shipping.length === 0 && <p>No hay opciones de envío habilitadas.</p>}
            {available.shipping.map(sid => (
              <label key={sid} className="checkout-option">
                <input type="radio" name="shipping" checked={selected.shipping === sid} onChange={() => setSelected(s => ({ ...s, shipping: sid }))} /> <span>{shippingLabel(sid)}</span>
              </label>
            ))}

            <div style={{ marginTop: 16 }}>
              <button className="btn btn-primary" onClick={handleConfirm}>Confirmar y Pagar</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
