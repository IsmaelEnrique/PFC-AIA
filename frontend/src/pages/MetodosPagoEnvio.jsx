import { API_BASE_URL, apiUrl } from "../config/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function MetodosPagoEnvio() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // 1. ✅ ESTADO INICIAL: Todo en false para la primera vez
  const [payments, setPayments] = useState({
    efectivo: false,
    mercadoPago: false,
    transferencia: false,
  });

  const [shipping, setShipping] = useState({
    retiroLocal: false,
    envioCorreo: false,
  });

  const [saved, setSaved] = useState(false);
  const [isMpLinked, setIsMpLinked] = useState(false);
  const [mpStatus, setMpStatus] = useState(null);

  const [bank, setBank] = useState({
    cta_bancaria: "",
    nombre_banco: "",
    nombre_titular: "",
  });
  const [shippingPrice, setShippingPrice] = useState("");

  const API_BASE = API_BASE_URL;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    const status = searchParams.get("status");
    if (status === "success") setMpStatus("¡Mercado Pago vinculado con éxito!");
    if (status === "error") setMpStatus("Error al vincular Mercado Pago.");

    fetch(`${API_BASE}/api/comercio/metodos?id_usuario=${user.id_usuario}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.payments) {
          setPayments({
            efectivo: !!data.payments.find(p => p === 1),
            mercadoPago: !!data.payments.find(p => p === 2),
            transferencia: !!data.payments.find(p => p === 3),
          });
          setShipping({
            retiroLocal: !!data.shipping.find(s => s === 1),
            envioCorreo: !!data.shipping.find(s => s === 2),
          });
          if (data.shipping_price) setShippingPrice(data.shipping_price);
        }
      });

    fetch(`${API_BASE}/api/usuarios/${user.id_usuario}`)
      .then(r => r.json())
      .then(u => {
        if (u) {
          setBank({
            cta_bancaria: u.cta_bancaria || "",
            nombre_banco: u.nombre_banco || "",
            nombre_titular: u.nombre_titular || "",
          });
          setIsMpLinked(!!u.mp_user_id);
        }
      });
  }, [searchParams]);

  const handleVincularMP = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const clientId = "7848395303150296"; 
    const redirectUri = encodeURIComponent(apiUrl("/api/mp/callback"));
    const state = user.id_usuario;
    window.location.href = `https://auth.mercadopago.com.ar/authorization?client_id=${clientId}&response_type=code&platform_id=mp&redirect_uri=${redirectUri}&state=${state}`;
  };

  const handlePaymentChange = (e) => {
    const { name, checked } = e.target;
    setPayments((p) => ({ ...p, [name]: checked }));
  };

  const handleSave = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const paymentIds = [];
    if (payments.efectivo) paymentIds.push(1);
    if (payments.mercadoPago) paymentIds.push(2);
    if (payments.transferencia) paymentIds.push(3);

    const shippingIds = [];
    if (shipping.retiroLocal) shippingIds.push(1);
    if (shipping.envioCorreo) shippingIds.push(2);

    try {
      await fetch(`${API_BASE}/api/comercio/metodos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario: user.id_usuario, payments: paymentIds, shipping: shippingIds, shippingPrice }),
      });

      await fetch(`${API_BASE}/api/usuarios/perfil`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: user.id_usuario,
          nombre: user.nombre_usuario || user.nombre,
          cta_bancaria: bank.cta_bancaria,
          nombre_banco: bank.nombre_banco,
          nombre_titular: bank.nombre_titular,
          shipping_price: shippingPrice,
        }),
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) { console.error(e); }
  };

  return (
    <section className="admin-page">
      <div className="admin-container">
        <div className="admin-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Métodos de <span className="accent">pago y envíos</span></span>
          <button onClick={() => navigate("/admin")} className="btn btn-back">← Volver al panel</button>
        </div>

        {mpStatus && <p className="success-text" style={{ textAlign: "center", fontWeight: "bold" }}>{mpStatus}</p>}

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

          {/* Bloque Mercado Pago dinámico */}
          {payments.mercadoPago && (
            <div style={{ marginLeft: "25px", padding: "15px", border: "1px solid #009EE3", borderRadius: "8px", backgroundColor: "#f0f9ff", marginBottom: "15px", marginTop: "10px" }}>
              <p style={{ fontSize: "14px", margin: "0 0 10px 0" }}>
                {isMpLinked 
                  ? "✅ Cuenta de Mercado Pago vinculada correctamente." 
                  : "Para recibir pagos online, vinculá tu cuenta de Mercado Pago."}
              </p>
              {!isMpLinked && (
                <button onClick={handleVincularMP} className="btn-mp" style={{ backgroundColor: "#009EE3", color: "white", padding: "8px 12px", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
                  Vincular Mercado Pago
                </button>
              )}
            </div>
          )}

          <label className="checkbox-row">
            <input type="checkbox" name="transferencia" checked={payments.transferencia} onChange={handlePaymentChange} />
            <span> Transferencia</span>
          </label>
        </div>

        {/* 2. ✅ PANEL BANCARIO CONDICIONAL: Solo aparece si 'transferencia' es true */}
        {payments.transferencia && (
          <div className="panel" style={{ marginTop: "20px", borderLeft: "4px solid #667eea" }}>
            <h3>Datos bancarios</h3>
            <p className="muted" style={{ marginBottom: "15px" }}>
              Estos datos se le mostrarán al cliente cuando elija pagar por transferencia bancaria.
            </p>
            <div className="form-group">
              <label>Cuenta Bancaria / CBU / Alias</label>
              <input type="text" value={bank.cta_bancaria} onChange={e => setBank({ ...bank, cta_bancaria: e.target.value })} placeholder="Ej: mi.alias.mp o CBU..." />
            </div>
            <div className="form-group">
              <label>Nombre del Banco</label>
              <input type="text" value={bank.nombre_banco} onChange={e => setBank({ ...bank, nombre_banco: e.target.value })} placeholder="Ej: Banco Nación, Mercado Pago, etc." />
            </div>
            <div className="form-group">
              <label>Titular de la Cuenta</label>
              <input type="text" value={bank.nombre_titular} onChange={e => setBank({ ...bank, nombre_titular: e.target.value })} placeholder="Nombre completo del titular" />
            </div>
          </div>
        )}

        <div className="panel" style={{ marginTop: "20px" }}>
          <h3>Opciones de envío</h3>
          <label className="checkbox-row">
            <input type="checkbox" name="retiroLocal" checked={shipping.retiroLocal} onChange={(e) => setShipping({ ...shipping, retiroLocal: e.target.checked })} />
            <span> Retiro en el local</span>
          </label>
          
          <label className="checkbox-row">
            <input type="checkbox" name="envioCorreo" checked={shipping.envioCorreo} onChange={(e) => setShipping({ ...shipping, envioCorreo: e.target.checked })} />
            <span> Envío por correo</span>
          </label>

          {/* Precio de envío dinámico */}
          {shipping.envioCorreo && (
            <div style={{ marginLeft: "25px", marginTop: "15px", padding: "10px", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Precio fijo por envío (ARS)</label>
              <input type="number" value={shippingPrice} onChange={e => setShippingPrice(e.target.value)} className="shipping-input" placeholder="Ej: 3500" style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }} />
              <p className="muted" style={{ marginTop: "5px", fontSize: "12px" }}>Este monto se sumará al total de la compra.</p>
            </div>
          )}
        </div>

        <div className="admin-actions" style={{ marginTop: "30px" }}>
          <button className="btn btn-primary" onClick={handleSave} style={{ width: "100%", padding: "12px" }}>
            Guardar todas las preferencias
          </button>
        </div>

        {saved && <p className="success-text" style={{ textAlign: "center", marginTop: "15px" }}>✅ Preferencias actualizadas correctamente.</p>}
      </div>
    </section>
  );
}