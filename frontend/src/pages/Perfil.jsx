import { API_BASE_URL } from "../config/api";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Perfil() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [form, setForm] = useState({
    nombre: "",
    mail: "",
    contrasena_nueva: "",
    contrasena_anterior: "",
    dni: "",
  });

  const [formOriginal, setFormOriginal] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;

    fetch(`${API_BASE_URL}/api/usuarios/${user.id_usuario}`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          const datosUsuario = {
            nombre: data.nombre_usuario || "",
            mail: data.mail || "",
            contrasena_nueva: "",
            contrasena_anterior: "",
            dni: data.dni || "",
          };
          setForm(datosUsuario);
          setFormOriginal(datosUsuario);
        }
      })
      .catch(() => setErrors({ general: "Error al conectar con el servidor" }));
  }, [user?.id_usuario]);

  const cambiosRealizados = 
    formOriginal !== null && 
    (JSON.stringify({ ...form, contrasena_nueva: "", contrasena_anterior: "" }) !== 
    JSON.stringify({ ...formOriginal, contrasena_nueva: "", contrasena_anterior: "" }) ||
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

    try {
      const response = await fetch(`${API_BASE_URL}/api/usuarios/perfil`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id_usuario: user.id_usuario,
            nombre: form.nombre,
            contrasena_anterior: form.contrasena_anterior || null,
            contrasena_nueva: form.contrasena_nueva || null,
            dni: form.dni || null,
          }),
      });

      if (!response.ok) {
        const data = await response.json();
        setErrors({ general: data.error });
        return;
      }

      localStorage.setItem("user", JSON.stringify({ ...user, nombre_usuario: form.nombre }));
      setFormOriginal({ ...form, contrasena_nueva: "", contrasena_anterior: "" });
      setSuccess(true);
      setErrors({});
    } catch (error) {
      setErrors({ general: "No se pudo conectar al servidor" });
    }
  };

  return (
    <section className="panel-page">
      <div className="panel-container">
        <div className="panel-title" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>Mi <span className="accent">Perfil</span></span>
          <button type="button" className="btn btn-back" onClick={() => navigate("/admin")}>← Volver</button>
        </div>

        <form className="panel-form" onSubmit={handleGuardarCambios}>
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
            <input type="password" value={form.contrasena_anterior} onChange={e => setForm({ ...form, contrasena_anterior: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Nueva contraseña</label>
            <input type="password" value={form.contrasena_nueva} onChange={e => setForm({ ...form, contrasena_nueva: e.target.value })} />
          </div>

          <div className="form-group">
            <label>DNI</label>
            <input type="text" value={form.dni} onChange={e => setForm({ ...form, dni: e.target.value })} />
          </div>

          {cambiosRealizados && (
            <button type="submit" className="btn btn-primary">Guardar cambios</button>
          )}

          {success && <p className="success-text">Perfil actualizado correctamente ✔</p>}
        </form>
      </div>
    </section>
  );
}