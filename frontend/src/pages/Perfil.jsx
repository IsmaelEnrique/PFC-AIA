import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Perfil() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = JSON.parse(localStorage.getItem("user"));

  // 🌐 TU URL DEFINITIVA DE RENDER
  const API_BASE_URL = "https://pfc-aia.onrender.com";

  const [form, setForm] = useState({
    nombre: "",
    mail: "",
    contrasena_nueva: "",
    contrasena_anterior: "",
    cta_bancaria: "",
    dni: "",
    nombre_banco: "",
    nombre_titular: "",
    mp_vinculado: false,
  });

  const [formOriginal, setFormOriginal] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [mpStatus, setMpStatus] = useState(null);

  useEffect(() => {
    if (!user) return;

    const status = searchParams.get("status");
    if (status === "success") setMpStatus("¡Cuenta de Mercado Pago vinculada con éxito!");
    if (status === "error") setMpStatus("Hubo un error al vincular Mercado Pago.");

    // 🔄 CORRECCIÓN: Usar API_BASE_URL y backticks (``)
    fetch(`${API_BASE_URL}/api/usuarios/${user.id_usuario}`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          const datosUsuario = {
            nombre: data.nombre_usuario || "",
            mail: data.mail || "",
            contrasena_nueva: "",
            contrasena_anterior: "",
            cta_bancaria: data.cta_bancaria || "",
            dni: data.dni || "",
            nombre_banco: data.nombre_banco || "",
            nombre_titular: data.nombre_titular || "",
            mp_vinculado: !!data.mp_user_id,
          };
          setForm(datosUsuario);
          setFormOriginal(datosUsuario);
        }
      })
      .catch(() => setErrors({ general: "Error al conectar con el servidor en Render" }));
  }, [searchParams, user?.id_usuario]); // Agregado user.id_usuario como dependencia segura

  const handleVincularMP = () => {
    const clientId = "7848395303150296"; //
    
    // 💳 CORRECCIÓN: Usar API_BASE_URL para que Mercado Pago sepa a dónde volver
    // Esta URL debe coincidir EXACTAMENTE con la del panel de MP
    const redirectUri = encodeURIComponent("https://pfc-aia.onrender.com/api/pagos/callback");
    const state = user.id_usuario;

    const authUrl = `https://auth.mercadopago.com.ar/authorization?client_id=${clientId}&response_type=code&platform_id=mp&redirect_uri=${redirectUri}&state=${state}`;

    window.location.href = authUrl;
  };

  const cambiosRealizados = 
    formOriginal !== null && 
    (JSON.stringify({ ...form, contrasena_nueva: "", contrasena_anterior: "", mp_vinculado: false }) !== 
    JSON.stringify({ ...formOriginal, contrasena_nueva: "", contrasena_anterior: "", mp_vinculado: false }) ||
    form.contrasena_nueva !== "");

  const validateForm = () => {
    const newErrors = {};
    if (!form.nombre) newErrors.nombre = "El nombre es obligatorio";
    
    if (form.contrasena_nueva) {
      if (!form.contrasena_anterior) newErrors.contrasena_anterior = "Debés ingresar tu contraseña actual";
      if (form.contrasena_nueva.length < 6) newErrors.contrasena_nueva = "Mínimo 6 caracteres";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGuardarCambios = async (e) => {
    e.preventDefault();
    setSuccess(false);
    if (!user || !validateForm()) return;
    if (!window.confirm("¿Estás seguro que querés guardar los cambios?")) return;

    try {
      // 🔄 CORRECCIÓN: Cambiado de localhost a API_BASE_URL
      const response = await fetch(`${API_BASE_URL}/api/usuarios/perfil`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: user.id_usuario,
          nombre: form.nombre,
          contrasena_anterior: form.contrasena_anterior || null,
          contrasena_nueva: form.contrasena_nueva || null,
          cta_bancaria: form.cta_bancaria || null,
          dni: form.dni || null,
          nombre_banco: form.nombre_banco || null,
          nombre_titular: form.nombre_titular || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setErrors({ general: data.error });
        return;
      }

      localStorage.setItem("user", JSON.stringify({ ...user, nombre_usuario: form.nombre }));
      setFormOriginal({ ...form, contrasena_nueva: "", contrasena_anterior: "" });
      setForm({ ...form, contrasena_nueva: "", contrasena_anterior: "" });
      setSuccess(true);
      setErrors({});
    } catch (error) {
      setErrors({ general: "No se pudo conectar al servidor de Render" });
    }
  };

  // ... El resto del return (JSX) se mantiene igual
  return (
    <section className="panel-page">
      <div className="panel-container">
        <div className="panel-title" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <span>Mi <span className="accent">Perfil</span></span>
          <button type="button" className="btn btn-back" onClick={() => navigate("/admin")}>
            ← Volver al panel
          </button>
        </div>

        {mpStatus && (
          <p className={searchParams.get("status") === "success" ? "success-text" : "error-text"} style={{ fontWeight: "bold", textAlign: "center", padding: "10px" }}>
            {mpStatus}
          </p>
        )}

        <form className="panel-form" noValidate>
          {errors.general && <p className="error-text">{errors.general}</p>}

          <div className="form-group">
            <label>Nombre *</label>
            <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
            {errors.nombre && <p className="error-text">{errors.nombre}</p>}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.mail} disabled />
          </div>

          <div className="form-group">
            <label>Contraseña actual</label>
            <input type="password" placeholder="Requerida para cambios" value={form.contrasena_anterior} onChange={e => setForm({ ...form, contrasena_anterior: e.target.value })} />
            {errors.contrasena_anterior && <p className="error-text">{errors.contrasena_anterior}</p>}
          </div>

          <div className="form-group">
            <label>Nueva contraseña</label>
            <input type="password" placeholder="Dejar vacío para no cambiar" value={form.contrasena_nueva} onChange={e => setForm({ ...form, contrasena_nueva: e.target.value })} />
            {errors.contrasena_nueva && <p className="error-text">{errors.contrasena_nueva}</p>}
          </div>

          <div className="form-group">
            <label>DNI</label>
            <input type="text" value={form.dni} onChange={e => setForm({ ...form, dni: e.target.value })} />
          </div>

          <div className="mp-container" style={{ margin: "20px 0", padding: "20px", border: "1px solid #009EE3", borderRadius: "8px", backgroundColor: "#f0f9ff" }}>
            <h3 style={{ color: "#009EE3", marginTop: 0 }}>Mercado Pago</h3>
            <p style={{ fontSize: "14px", color: "#666" }}>
              {form.mp_vinculado 
                ? "✅ Tu cuenta ya está vinculada. Recibirás los pagos de tus ventas aquí." 
                : "Vinculá tu cuenta para que el dinero de tus ventas te llegue directamente."}
            </p>
            
            {!form.mp_vinculado && (
              <button 
                type="button" 
                className="btn-mp" 
                onClick={handleVincularMP}
                style={{ backgroundColor: "#009EE3", color: "white", padding: "10px 15px", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
              >
                Vincular mi cuenta
              </button>
            )}
          </div>

          <div className="form-group">
            <label>Cuenta Bancaria / CBU / Alias</label>
            <input type="text" value={form.cta_bancaria} onChange={e => setForm({ ...form, cta_bancaria: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Nombre del Banco</label>
            <input type="text" value={form.nombre_banco} onChange={e => setForm({ ...form, nombre_banco: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Titular de la Cuenta</label>
            <input type="text" value={form.nombre_titular} onChange={e => setForm({ ...form, nombre_titular: e.target.value })} />
          </div>

          {cambiosRealizados && (
            <button type="button" className="btn btn-primary" onClick={handleGuardarCambios}>
              Guardar cambios
            </button>
          )}

          {success && <p className="success-text">Perfil actualizado correctamente ✔</p>}
        </form>
      </div>
    </section>
  );
}