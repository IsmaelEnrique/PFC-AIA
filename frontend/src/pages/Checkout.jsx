import { apiUrl } from "../config/api";
import { useEffect, useState } from "react";
import TiendaLoading from "../components/TiendaLoading";
import { useParams, useNavigate } from "react-router-dom";
import useCart from "../hooks/useCart";
import { getConsumidorSession } from "../utils/consumidorSession";
// render checkout content without the store template/header

export default function Checkout() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [tiendaData, setTiendaData] = useState(null);
  const [consumidor, setConsumidor] = useState(null);
  const [available, setAvailable] = useState({ payments: [], shipping: [] });
  const [selected, setSelected] = useState({ payment: null, shipping: null });
  const [sellerUser, setSellerUser] = useState(null);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [address, setAddress] = useState({ calle: '', numero: '', piso: '', localidad: '', provincia: '', codigo_postal: '' });
  const { carrito, idCarrito, calcularTotal } = useCart({ tiendaData, consumidor });

  const tipoDiseño = tiendaData?.comercio ? Number(tiendaData.comercio.tipo_diseño) : 1;
  const comercioId = tiendaData?.comercio?.id_comercio;

  useEffect(() => {
    if (!comercioId) {
      setConsumidor(null);
      return;
    }

    try {
      const c = getConsumidorSession(comercioId);
      setConsumidor(c || null);
    } catch {
      setConsumidor(null);
    }
  }, [comercioId]);

  useEffect(() => {
    if (!slug) return;
    fetch(apiUrl(`/api/comercio/tienda/${slug}`))
      .then(r => r.json())
      .then(d => setTiendaData(d))
      .catch(() => {});
  }, [slug]);

  useEffect(() => {
    if (!tiendaData) return;
    // get enabled methods for this commerce (uses id_usuario from comercio)
    fetch(apiUrl(`/api/comercio/metodos?id_usuario=${tiendaData.comercio.id_usuario}`))
      .then(r => r.json())
      .then(data => {
        const pm = data.payments || [];
        const sh = data.shipping || [];
        setAvailable({ payments: pm, shipping: sh });
        // No pisar la selección del usuario si ya eligió una opción válida.
        setSelected((prev) => {
          const paymentValido = pm.includes(prev.payment) ? prev.payment : null;
          const shippingValido = sh.includes(prev.shipping) ? prev.shipping : null;
          return {
            payment: paymentValido ?? pm[0] ?? null,
            shipping: shippingValido ?? sh[0] ?? null,
          };
        });
      })
      .catch(() => {});

    // Cargar datos del usuario propietario (para datos bancarios)
    fetch(apiUrl(`/api/usuarios/${tiendaData.comercio.id_usuario}`))
      .then(r => r.json())
      .then(u => setSellerUser(u))
      .catch(() => setSellerUser(null));
  }, [tiendaData]);

  const paymentLabel = (id) => ({ 1: 'Efectivo', 2: 'Mercado Pago', 3: 'Transferencia' }[id] || `Pago ${id}`);

  const variantLabel = (variante) => {
    if (!variante) return '';
    if (variante.caracteristicas && Array.isArray(variante.caracteristicas) && variante.caracteristicas.length) {
      return variante.caracteristicas.map(c => c.valor).join(' - ');
    }
    return variante.nombre || variante.displayName || '';
  };

  const handleConfirm = async () => {
    if (submittingOrder) return;
    if (!consumidor) return alert('Debés iniciar sesión como comprador para finalizar la compra');
    if (!carrito || carrito.length === 0) return alert('El carrito está vacío. Agregá al menos un producto para continuar.');
    if (!selected.payment || !selected.shipping) return alert('Seleccioná método de pago y envío');
    // If shipping is correo (id 2) validate address
    if (Number(selected.shipping) === 2) {
      const req = ['calle','numero','localidad','provincia','codigo_postal'];
      for (const k of req) {
        if (!address[k] || String(address[k]).trim() === '') return alert('Completá todos los campos de dirección para el envío');
      }
    }
    // Enviamos el subtotal como `total` y el servidor sumará el `shipping_price` cuando corresponda
    const payload = {
      id_carrito: idCarrito,
      id_consumidor: consumidor.id_consumidor,
      id_comercio: tiendaData.comercio.id_comercio,
      total: calcularTotal(),
      id_pago: selected.payment,
      id_envio: selected.shipping,
      ...(Number(selected.shipping) === 2 ? {
        calle: address.calle,
        numero: address.numero,
        piso: address.piso,
        localidad: address.localidad,
        provincia: address.provincia,
        codigo_postal: address.codigo_postal,
      } : {}),
    };

    try {
      setSubmittingOrder(true);
      const res = await fetch(apiUrl("/api/pedidos"), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) return alert(data.error || 'Error al crear pedido');
      // success: navigate to confirmation with detalles and comercio info
      navigate(`/tienda/${slug}/pedido/${data.pedido.id_pedido}`, { state: { pedido: data.pedido, detalles: data.detalles, comercio: data.comercio, usuario: sellerUser } });
    } catch (e) { console.error(e); alert('Error conectando al servidor'); }
    finally { setSubmittingOrder(false); }
  };

  if (!tiendaData) return <TiendaLoading />;

  const checkoutContent = (
    <section className={`checkout-page-inner`}>
      <div className="checkout-container">
        <button className="volver-tienda-top" onClick={() => navigate(`/tienda/${slug}`)}>Volver a la tienda</button>
        <h1>Finalizar compra</h1>

        <div className="checkout-grid">
          <div className="checkout-options">
            <h3>Método de pago</h3>
            {available.payments.length === 0 && <p>No hay métodos de pago habilitados.</p>}
            {available.payments.map(pid => (
              <label key={pid} className="checkout-option">
                <input type="radio" name="payment" checked={selected.payment === pid} onChange={() => setSelected(s => ({ ...s, payment: pid }))} /> <span>{paymentLabel(pid)}</span>
              </label>
            ))}

            {Number(selected.payment) === 3 && sellerUser && (
              <div style={{ marginTop: 12, padding: 12, borderRadius: 8, border: '1px solid var(--border)', background: '#fff' }}>
                <h4 style={{ margin: 0 }}>Datos para transferencia</h4>
                <p className="muted" style={{ marginTop: 8 }}><strong>CBU / Alias:</strong> {sellerUser.cta_bancaria || 'No disponible'}</p>
                <p className="muted" style={{ marginTop: 4 }}><strong>Banco:</strong> {sellerUser.nombre_banco || 'No disponible'}</p>
                <p className="muted" style={{ marginTop: 4 }}><strong>Titular:</strong> {sellerUser.nombre_titular || sellerUser.nombre_usuario || 'No disponible'}</p>
              </div>
            )}

            <h3>Envio</h3>
            {/* Always offer local pickup and correo options (backend may also provide) */}
            <label className="checkout-option">
              <input type="radio" name="shipping" checked={Number(selected.shipping) === 1} onChange={() => setSelected(s => ({ ...s, shipping: 1 }))} /> <span>Retiro en el local</span>
            </label>
            <label className="checkout-option">
              <input type="radio" name="shipping" checked={Number(selected.shipping) === 2} onChange={() => setSelected(s => ({ ...s, shipping: 2 }))} /> <span>Envío por Correo</span>
            </label>
            {available.shipping && available.shipping.length > 0 
            
            }

            {/* If correo selected, show address fields and shipping cost */}
            {Number(selected.shipping) === 2 && (
              <div className="checkout-address">
                <h4>Dirección de envío</h4>
                <div className="form-group">
                  <label>Calle</label>
                  <input className="shipping-input" value={address.calle} onChange={(e) => setAddress(a=>({ ...a, calle: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Número</label>
                  <input className="shipping-input" value={address.numero} onChange={(e) => setAddress(a=>({ ...a, numero: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Piso</label>
                  <input className="shipping-input" value={address.piso} onChange={(e) => setAddress(a=>({ ...a, piso: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Localidad</label>
                  <input className="shipping-input" value={address.localidad} onChange={(e) => setAddress(a=>({ ...a, localidad: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Provincia</label>
                  <input className="shipping-input" value={address.provincia} onChange={(e) => setAddress(a=>({ ...a, provincia: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Código Postal</label>
                  <input className="shipping-input" value={address.codigo_postal} onChange={(e) => setAddress(a=>({ ...a, codigo_postal: e.target.value }))} />
                </div>

                <p className="muted">Costo de envío fijo: ${Number(tiendaData.comercio?.shipping_price ?? tiendaData.comercio?.costo_envio_fijo ?? tiendaData.comercio?.shipping_cost_fixed ?? 0).toFixed(2)}</p>
              </div>
            )}

            {Number(selected.shipping) === 1 && (
              <div style={{ marginTop: 12, padding: 12, borderRadius: 8, border: '1px solid var(--border)', background: '#fff' }}>
                <h4 style={{ margin: 0 }}>Dirección para retiro</h4>
                <p className="muted" style={{ marginTop: 8 }}>{tiendaData.comercio?.direccion || 'Dirección no registrada'}</p>
              </div>
            )}

            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <button className="carrito-btn-finalizar" onClick={handleConfirm} disabled={submittingOrder}>
                {submittingOrder ? 'Procesando...' : 'Confirmar pedido'}
              </button>
            </div>
          </div>

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
                      {i.variante && (
                        <div className="checkout-item-variant muted" style={{ fontSize: '0.95rem' }}>
                          {variantLabel(i.variante)}
                        </div>
                      )}
                      <div className="checkout-item-meta">x {i.cantidad} — ${(i.precio * i.cantidad).toFixed(2)}</div>
                    </div>
                  </li>
                ))}
              </ul>
              )}
              <div style={{ marginTop: 12 }}>
                <p className="checkout-total"><strong>Subtotal:</strong> ${calcularTotal().toFixed(2)}</p>
                {Number(selected.shipping) === 2 && (
                  <p className="checkout-total"><strong>Costo de envío:</strong> ${Number(tiendaData.comercio?.shipping_price ?? tiendaData.comercio?.costo_envio_fijo ?? tiendaData.comercio?.shipping_cost_fixed ?? 0).toFixed(2)}</p>
                )}
                <p className="checkout-total"><strong>Total:</strong> ${Number(calcularTotal() + (Number(selected.shipping) === 2 ? Number(tiendaData.comercio?.shipping_price ?? tiendaData.comercio?.costo_envio_fijo ?? tiendaData.comercio?.shipping_cost_fixed ?? 0) : 0)).toFixed(2)}</p>
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
