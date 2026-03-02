import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"; // 👈 Agregamos useSearchParams

export default function Perfil() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // 👈 Para capturar el estado de la vinculación
  const user = JSON.parse(localStorage.getItem("user"));

  const [form, setForm] = useState({
    nombre: "",
    mail: "",
    contrasena_nueva: "",
    contrasena_anterior: "",
    cta_bancaria: "",
    dni: "",
    nombre_banco: "",
    nombre_titular: "",
    mp_vinculado: false, // 👈 Nuevo estado para saber si ya está vinculado
  });

  const [formOriginal, setFormOriginal] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [mpStatus, setMpStatus] = useState(null); // 👈 Para mensajes de Mercado Pago

  // 🔄 Cargar datos del usuario
  useEffect(() => {
    if (!user) return;

    // Chequeamos si venimos de una redirección de Mercado Pago
    const status = searchParams.get("status");
    if (status === "success") setMpStatus("¡Cuenta de Mercado Pago vinculada con éxito!");
    if (status === "error") setMpStatus("Hubo un error al vincular Mercado Pago.");

    fetch(`http://localhost:4000/api/usuarios/${user.id_usuario}`)
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
            mp_vinculado: !!data.mp_user_id, // 👈 Si existe mp_user_id en la DB, está vinculado
          };
          setForm(datosUsuario);
          setFormOriginal(datosUsuario);
        }
      });
  }, [searchParams]);

  // 💳 Función para iniciar vinculación con Mercado Pago
  const handleVincularMP = () => {
    const clientId = "7848395303150296"; // Tu ID real
    const redirectUri = encodeURIComponent("http://localhost:4000/api/pagos/callback");
    const state = user.id_usuario; // Pasamos el ID para que el backend sepa a quién guardar el token

    const authUrl = `https://auth.mercadopago.com.ar/authorization?client_id=${clientId}&response_type=code&platform_id=mp&redirect_uri=${redirectUri}&state=${state}`;

    window.location.href = authUrl;
  };

  // Detectar cambios en el formulario
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
      if (form.contrasena_nueva.length < 6) newErrors.contrasena_nueva = "La nueva contraseña debe tener al menos 6 caracteres";
      if (form.contrasena_nueva === form.contrasena_anterior) newErrors.contrasena_nueva = "La nueva contraseña debe ser diferente";
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
      const response = await fetch("http://localhost:4000/api/usuarios/perfil", {
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
      setErrors({ general: "No se pudo conectar al servidor" });
    }
  };

  return (
    <section className="panel-page">
      <div className="panel-container">
        <div className="panel-title" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <span>Mi <span className="accent">Perfil</span></span>
          <button type="button" className="btn btn-back" onClick={() => navigate("/admin")}>
            ← Volver al panel
          </button>
        </div>

        {/* 📢 Mensajes de Mercado Pago */}
        {mpStatus && (
          <p className={searchParams.get("status") === "success" ? "success-text" : "error-text"}>
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

          {/* 🔵 SECCIÓN MERCADO PAGO */}
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