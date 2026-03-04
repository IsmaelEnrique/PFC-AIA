import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useCart from "../hooks/useCart";
// render checkout content without the store template/header

export default function Checkout() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [tiendaData, setTiendaData] = useState(null);
  const [consumidor, setConsumidor] = useState(null);
  const [available, setAvailable] = useState({ payments: [], shipping: [] });
  const [selected, setSelected] = useState({ payment: null, shipping: null });
  const [address, setAddress] = useState({ calle: '', numero: '', piso: '', localidad: '', provincia: '', codigo_postal: '' });
  const { carrito, idCarrito, calcularTotal, cantidadTotalItems, agregarAlCarrito, quitarDelCarrito, actualizarCantidad, vaciarCarrito, syncOnLogin } = useCart({ tiendaData, consumidor });

  const tipoDiseño = tiendaData?.comercio ? Number(tiendaData.comercio.tipo_diseño) : 1;

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
    // If shipping is correo (id 2) validate address
    if (Number(selected.shipping) === 2) {
      const req = ['calle','numero','localidad','provincia','codigo_postal'];
      for (const k of req) {
        if (!address[k] || String(address[k]).trim() === '') return alert('Completá todos los campos de dirección para el envío');
      }
    }
    const payload = {
      id_carrito: idCarrito,
      id_consumidor: consumidor.id_consumidor,
      id_comercio: tiendaData.comercio.id_comercio,
      total: calcularTotal() + (Number(tiendaData.comercio?.costo_envio_fijo || tiendaData.comercio?.shipping_cost_fixed || 0)),
      id_pago: selected.payment,
      id_envio: selected.shipping,
      direccion: Number(selected.shipping) === 2 ? address : null,
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

  const { comercio } = tiendaData;

  const checkoutContent = (
    <section className={`checkout-page-inner`}>
      <div className="checkout-container">
        <h1>Finalizar compra</h1>

        <div className="checkout-grid">
          <div className="checkout-summary">
            <h3>Resumen</h3>
            {carrito.length === 0 ? <p>No hay productos en el carrito</p> : (
              <ul className="checkout-items">
                {carrito.map(i => (
                  <li key={i.key} className="checkout-item">
                    <div className={`checkout-thumb`}>
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
              {Number(selected.shipping) === 2 ? (
                <p className="checkout-total"><strong>Total: </strong>${(calcularTotal() + Number(tiendaData.comercio?.costo_envio_fijo || tiendaData.comercio?.shipping_cost_fixed || 0)).toFixed(2)} <span className="muted">(incluye envío)</span></p>
              ) : (
                <p className="checkout-total"><strong>Total: </strong>${calcularTotal().toFixed(2)}</p>
              )}
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
            {/* Always offer local pickup and correo options (backend may also provide) */}
            <label className="checkout-option">
              <input type="radio" name="shipping" checked={Number(selected.shipping) === 1} onChange={() => setSelected(s => ({ ...s, shipping: 1 }))} /> <span>Retiro en el local</span>
            </label>
            <label className="checkout-option">
              <input type="radio" name="shipping" checked={Number(selected.shipping) === 2} onChange={() => setSelected(s => ({ ...s, shipping: 2 }))} /> <span>Envío por Correo Argentino</span>
            </label>
            {available.shipping && available.shipping.length > 0 && (
              <div style={{ marginTop: 8 }} className="muted">Opciones del comercio: {available.shipping.map(s => shippingLabel(s)).join(', ')}</div>
            )}

            {/* If correo selected, show address fields and shipping cost */}
            {Number(selected.shipping) === 2 && (
              <div className="checkout-address">
                <h4>Dirección de envío</h4>
                <label> Calle <input value={address.calle} onChange={(e) => setAddress(a=>({ ...a, calle: e.target.value }))} /></label>
                <label> Número <input value={address.numero} onChange={(e) => setAddress(a=>({ ...a, numero: e.target.value }))} /></label>
                <label> Piso <input value={address.piso} onChange={(e) => setAddress(a=>({ ...a, piso: e.target.value }))} /></label>
                <label> Localidad <input value={address.localidad} onChange={(e) => setAddress(a=>({ ...a, localidad: e.target.value }))} /></label>
                <label> Provincia <input value={address.provincia} onChange={(e) => setAddress(a=>({ ...a, provincia: e.target.value }))} /></label>
                <label> Código Postal <input value={address.codigo_postal} onChange={(e) => setAddress(a=>({ ...a, codigo_postal: e.target.value }))} /></label>

                <p className="muted">Costo de envío fijo: ${Number(tiendaData.comercio?.costo_envio_fijo || tiendaData.comercio?.shipping_cost_fixed || 0).toFixed(2)}</p>
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              <button className="carrito-btn-finalizar" onClick={handleConfirm}>Confirmar y Pagar</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const themeClass = tipoDiseño === 1 ? 'minimal' : (tipoDiseño === 2 ? 'colorful' : 'modern');
  return (
    <div className={`checkout-page ${themeClass}`}>
      {checkoutContent}
    </div>
  );
}
