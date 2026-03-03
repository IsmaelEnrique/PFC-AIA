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
          } else {
            // fallback a localStorage si existe
            const raw = localStorage.getItem("metodosPagoEnvioSettings");
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed.payments) setPayments(parsed.payments);
              if (parsed.shipping) setShipping(parsed.shipping);
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

  const handleSave = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const payload = { payments, shipping };
    // Guardar local primero
    localStorage.setItem("metodosPagoEnvioSettings", JSON.stringify(payload));

    // Mapear a ids (asumimos: pagos: 1=Efectivo,2=MercadoPago,3=Transferencia; envíos:1=Retiro,2=Correo)
    const paymentIds = [];
    if (payments.efectivo) paymentIds.push(1);
    if (payments.mercadoPago) paymentIds.push(2);
    if (payments.transferencia) paymentIds.push(3);

    const shippingIds = [];
    if (shipping.retiroLocal) shippingIds.push(1);
    if (shipping.envioCorreo) shippingIds.push(2);

    if (user && user.id_usuario) {
      const API_BASE = (import.meta.env && import.meta.env.PROD) ? 'https://pfc-aia.onrender.com' : 'http://localhost:4000';
      fetch(`${API_BASE}/api/comercio/metodos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario: user.id_usuario, payments: paymentIds, shipping: shippingIds }),
      })
        .then(res => res.json())
        .then((resp) => {
          console.log('POST /api/comercio/metodos response ->', resp);
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        })
        .catch(() => {
          // si falla backend, igualmente avisamos guardado local
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        });
    } else {
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
            correspondientes en tu perfil.
          </p>

          <hr />

          <h3>Opciones de envío</h3>

          <label className="checkbox-row">
            <input type="checkbox" name="retiroLocal" checked={shipping.retiroLocal} onChange={handleShippingChange} />
            <span> Retiro en el local</span>
          </label>

          <label className="checkbox-row">
            <input type="checkbox" name="envioCorreo" checked={shipping.envioCorreo} onChange={handleShippingChange} />
            <span> Envío por correo</span>
          </label>

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

