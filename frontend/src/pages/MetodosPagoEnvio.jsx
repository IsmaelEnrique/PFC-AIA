import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function MetodosPagoEnvio() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState({
    efectivo: true,
    mercadoPago: false,
    transferencia: false,
  });

  const [shipping, setShipping] = useState({
    retiroLocal: true,
    envioCorreo: false,
  });

  const [saved, setSaved] = useState(false);

  const [bank, setBank] = useState({
    cta_bancaria: "",
    nombre_banco: "",
    nombre_titular: "",
  });
  const [shippingPrice, setShippingPrice] = useState("");

  // Cargar settings guardados
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.id_usuario) return;

      // Intentar cargar desde backend (usar URL completa para evitar problemas con el dev server)
      const API_BASE = (import.meta.env && import.meta.env.PROD) ? 'https://pfc-aia.onrender.com' : 'http://localhost:4000';
      fetch(`${API_BASE}/api/comercio/metodos?id_usuario=${user.id_usuario}`)
        .then((res) => res.json())
        .then((data) => {
          console.log('GET /api/comercio/metodos ->', data);
          if (data && (Array.isArray(data.payments) || Array.isArray(data.shipping))) {
            const pm = {
              efectivo: !!data.payments.find(p => p === 1),
              mercadoPago: !!data.payments.find(p => p === 2),
              transferencia: !!data.payments.find(p => p === 3),
            };
            const sh = {
              retiroLocal: !!data.shipping.find(s => s === 1),
              envioCorreo: !!data.shipping.find(s => s === 2),
            };
            setPayments(pm);
            setShipping(sh);
            // si el backend devuelve un precio de envío, cargarlo
            if (data.shippingPrice !== undefined) setShippingPrice(data.shippingPrice);
            if (data.shipping_price !== undefined) setShippingPrice(data.shipping_price);
          } else {
            // fallback a localStorage si existe
            const raw = localStorage.getItem("metodosPagoEnvioSettings");
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed.payments) setPayments(parsed.payments);
              if (parsed.shipping) setShipping(parsed.shipping);
              if (parsed.shippingPrice) setShippingPrice(parsed.shippingPrice);
              if (parsed.bank) setBank(parsed.bank);
            }
          }
          })
        .catch(() => {
          const raw = localStorage.getItem("metodosPagoEnvioSettings");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.payments) setPayments(parsed.payments);
            if (parsed.shipping) setShipping(parsed.shipping);
          }
          });

        // Cargar datos bancarios del perfil
        fetch(`${API_BASE}/api/usuarios/${user.id_usuario}`)
          .then((r) => r.json())
          .then((u) => {
            if (u) {
              setBank({
                cta_bancaria: u.cta_bancaria || "",
                nombre_banco: u.nombre_banco || "",
                nombre_titular: u.nombre_titular || "",
              });
              if (u.shipping_price !== undefined) setShippingPrice(u.shipping_price);
              if (u.shippingPrice !== undefined) setShippingPrice(u.shippingPrice);
            }
          })
          .catch(() => {});
    } catch (e) {
      // ignore
    }
  }, []);

  const handlePaymentChange = (e) => {
    const { name, checked } = e.target;
    setPayments((p) => ({ ...p, [name]: checked }));
  };

  const handleShippingChange = (e) => {
    const { name, checked } = e.target;
    setShipping((s) => ({ ...s, [name]: checked }));
  };

  const handleSave = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const payload = { payments, shipping };
    // Guardar local primero
    localStorage.setItem("metodosPagoEnvioSettings", JSON.stringify({ ...payload, shippingPrice, bank }));

    // Mapear a ids (asumimos: pagos: 1=Efectivo,2=MercadoPago,3=Transferencia; envíos:1=Retiro,2=Correo)
    const paymentIds = [];
    if (payments.efectivo) paymentIds.push(1);
    if (payments.mercadoPago) paymentIds.push(2);
    if (payments.transferencia) paymentIds.push(3);

    const shippingIds = [];
    if (shipping.retiroLocal) shippingIds.push(1);
    if (shipping.envioCorreo) shippingIds.push(2);

    const API_BASE = (import.meta.env && import.meta.env.PROD) ? 'https://pfc-aia.onrender.com' : 'http://localhost:4000';

    if (user && user.id_usuario) {
      // Intentar guardar en el backend; hacemos un intento ordenado y manejamos errores
      try {
        const resp = await fetch(`${API_BASE}/api/comercio/metodos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_usuario: user.id_usuario, payments: paymentIds, shipping: shippingIds, shippingPrice }),
        });
        const json = await resp.json().catch(() => null);
        console.log('POST /api/comercio/metodos response ->', json);
      } catch (e) {
        console.error('Error guardando métodos en comercio:', e);
      }

      // Asegurarnos de actualizar el perfil del usuario con los datos bancarios (y shipping_price)
      try {
        const profileResp = await fetch(`${API_BASE}/api/usuarios/perfil`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_usuario: user.id_usuario,
            nombre: user.nombre_usuario || user.nombre || '',
            cta_bancaria: bank.cta_bancaria || null,
            nombre_banco: bank.nombre_banco || null,
            nombre_titular: bank.nombre_titular || null,
            shipping_price: shippingPrice || null,
          }),
        });
        if (!profileResp.ok) {
          const txt = await profileResp.text().catch(() => null);
          console.error('PUT /api/usuarios/perfil falló:', profileResp.status, txt);
        } else {
          const pjson = await profileResp.json().catch(() => null);
          console.log('PUT /api/usuarios/perfil ->', pjson);
        }
      } catch (e) {
        console.error('Error actualizando perfil:', e);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      // usuario no logueado: guardamos datos bancarios en localStorage junto con métodos
      const raw = localStorage.getItem("metodosPagoEnvioSettings");
      const parsed = raw ? JSON.parse(raw) : {};
      localStorage.setItem("metodosPagoEnvioSettings", JSON.stringify({ ...parsed, bank, shippingPrice }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <section className="admin-page">
      <div className="admin-container">
        <div className="admin-title" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <span>Métodos de <span className="accent">pago y envíos</span></span>
          <button type="button" className="btn btn-back" onClick={() => navigate("/admin")}>← Volver al panel</button>
        </div>

        <p className="admin-subtitle">Seleccioná qué opciones querés ofrecer en tu comercio.</p>

        <div className="panel">
          <h3>Métodos de pago</h3>

          <label className="checkbox-row">
            <input type="checkbox" name="efectivo" checked={payments.efectivo} onChange={handlePaymentChange} />
            <span> Efectivo</span>
          </label>

          <label className="checkbox-row">
            <input type="checkbox" name="mercadoPago" checked={payments.mercadoPago} onChange={handlePaymentChange} />
            <span> Mercado Pago</span>
          </label>

          <label className="checkbox-row">
            <input type="checkbox" name="transferencia" checked={payments.transferencia} onChange={handlePaymentChange} />
            <span> Transferencia</span>
          </label>

          <p className="muted">
            Nota: Mercado Pago y Transferencia solo estarán disponibles para clientes una vez que completes los datos
            correspondientes abajo.
          </p>

          <hr />

          <h3>Opciones de envío</h3>

          <label className="checkbox-row">
            <input type="checkbox" name="retiroLocal" checked={shipping.retiroLocal} onChange={handleShippingChange} />
            <span> Retiro en el local</span>
          </label>
          <p className="muted" style={{ marginLeft: 24, marginTop: 8, marginBottom: 12 }}>
            Se mostrará al cliente la dirección puesta en el perfil para el retiro de su producto.
          </p>

          <label className="checkbox-row">
            <input type="checkbox" name="envioCorreo" checked={shipping.envioCorreo} onChange={handleShippingChange} />
            <span> Envío por correo</span>
          </label>

          <div style={{ marginLeft: 24, marginTop: 8, marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>Precio por envío (ARS)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={shippingPrice}
              onChange={e => setShippingPrice(e.target.value)}
              placeholder="Ej: 3500"
              className="shipping-input"
            />
            <p className="muted" style={{ marginTop: 8 }}>
              Este valor se sumará al total cuando el cliente elija envío por correo.
            </p>
          </div>

        </div>

        <div className="panel" style={{ marginTop: 64, paddingTop: 12 }}>
          <h3>Datos bancarios</h3>
          <p className="muted" style={{ marginTop: 8, marginBottom: 12 }}>
            Los datos serán mostrados para el comprador al momento que elija como método de pago transferencia.
          </p>
          <div className="form-group" style={{ marginBottom: 18 }}>
            <label>Cuenta Bancaria / CBU / Alias</label>
            <input type="text" value={bank.cta_bancaria} onChange={e => setBank({ ...bank, cta_bancaria: e.target.value })} />
          </div>

          <div className="form-group" style={{ marginBottom: 18 }}>
            <label>Nombre del Banco</label>
            <input type="text" value={bank.nombre_banco} onChange={e => setBank({ ...bank, nombre_banco: e.target.value })} />
          </div>

          <div className="form-group" style={{ marginBottom: 18 }}>
            <label>Titular de la Cuenta</label>
            <input type="text" value={bank.nombre_titular} onChange={e => setBank({ ...bank, nombre_titular: e.target.value })} />
          </div>
        </div>

        <div className="admin-actions" style={{ marginTop: 20 }}>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "10px 18px",
              fontSize: "14px",
              fontWeight: 700,
              minWidth: "160px",
              width: "auto",
              justifySelf: "start",
              alignSelf: "start",
              letterSpacing: "0.2px",
              boxShadow: "0 6px 12px rgba(102, 126, 234, 0.15)",
              borderRadius: "8px",
            }}
          >
            Guardar cambios
          </button>
        </div>

        {saved && <p className="success" style={{ marginTop: 12 }}>Preferencias guardadas.</p>}

      </div>
    </section>
  );
}

