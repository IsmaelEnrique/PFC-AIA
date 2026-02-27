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
    cta_bancaria: "",
    dni: "",
    nombre_banco: "",
    nombre_titular: "",
  });

  const [formOriginal, setFormOriginal] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // 🔄 Cargar datos del usuario
  useEffect(() => {
    if (!user) return;

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
          };
          setForm(datosUsuario);
          setFormOriginal(datosUsuario);
        }
      });
  }, []);

  // Detectar cambios en el formulario (ignorando contraseñas vacías)
  const cambiosRealizados = 
    formOriginal !== null && 
    (JSON.stringify({ ...form, contrasena_nueva: "", contrasena_anterior: "" }) !== 
    JSON.stringify({ ...formOriginal, contrasena_nueva: "", contrasena_anterior: "" }) ||
    form.contrasena_nueva !== "");

  const validateForm = () => {
    const newErrors = {};
    if (!form.nombre) newErrors.nombre = "El nombre es obligatorio";
    
    // Si intenta cambiar contraseña, validar
    if (form.contrasena_nueva) {
      if (!form.contrasena_anterior) {
        newErrors.contrasena_anterior = "Debés ingresar tu contraseña actual";
      }
      if (form.contrasena_nueva.length < 6) {
        newErrors.contrasena_nueva = "La nueva contraseña debe tener al menos 6 caracteres";
      }
      if (form.contrasena_nueva === form.contrasena_anterior) {
        newErrors.contrasena_nueva = "La nueva contraseña debe ser diferente";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGuardarCambios = async (e) => {
    e.preventDefault();
    setSuccess(false);

    if (!user) {
      setErrors({ general: "Debés iniciar sesión" });
      return;
    }

    if (!validateForm()) return;

    if (!window.confirm("¿Estás seguro que querés guardar los cambios?")) {
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:4000/api/usuarios/perfil",
        {
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
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error });
        return;
      }

      // Actualizar localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...user,
          nombre_usuario: form.nombre,
        })
      );

      setFormOriginal({ ...form, contrasena_nueva: "", contrasena_anterior: "" });
      setForm({ ...form, contrasena_nueva: "", contrasena_anterior: "" });
      setSuccess(true);
      setErrors({});
    } catch (error) {
      console.error("Error:", error);
      setErrors({ general: "No se pudo conectar al servidor" });
    }
  };

  return (
    <>

      <section className="panel-page">
        <div className="panel-container">
          <div
            className="panel-title"
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}
          >
            <span>
              Mi <span className="accent">Perfil</span>
            </span>
           <button
            type="button"
            className="btn btn-back"
            onClick={() => navigate("/admin")}
          >
            ← Volver al panel
          </button>
          </div>

          <p className="panel-subtitle">
            Editá tus datos personales y de cobro
          </p>

          <form className="panel-form" noValidate>

            {errors.general && (
              <p className="error-text">{errors.general}</p>
            )}

            {/* Nombre */}
            <div className="form-group">
              <label>Nombre *</label>
              <input
                type="text"
                value={form.nombre}
                onChange={e =>
                  setForm({ ...form, nombre: e.target.value })
                }
              />
              {errors.nombre && <p className="error-text">{errors.nombre}</p>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={form.mail}
                disabled
              />
            </div>

            {/* Contraseña Anterior */}
            <div className="form-group">
              <label>Contraseña actual</label>
              <input
                type="password"
                placeholder="Requerida si querés cambiar la contraseña"
                value={form.contrasena_anterior}
                onChange={e =>
                  setForm({ ...form, contrasena_anterior: e.target.value })
                }
              />
              {errors.contrasena_anterior && <p className="error-text">{errors.contrasena_anterior}</p>}
            </div>

            {/* Contraseña Nueva */}
            <div className="form-group">
              <label>Nueva contraseña</label>
              <input
                type="password"
                placeholder="Dejar vacío para no cambiar"
                value={form.contrasena_nueva}
                onChange={e =>
                  setForm({ ...form, contrasena_nueva: e.target.value })
                }
              />
              {errors.contrasena_nueva && <p className="error-text">{errors.contrasena_nueva}</p>}
            </div>

            {/* DNI */}
            <div className="form-group">
              <label>DNI</label>
              <input
                type="text"
                value={form.dni}
                onChange={e =>
                  setForm({ ...form, dni: e.target.value })
                }
              />
            </div>

            {/* Cuenta Bancaria */}
            <div className="form-group">
              <label>Cuenta Bancaria / CBU / Alias</label>
              <input
                type="text"
                value={form.cta_bancaria}
                onChange={e =>
                  setForm({ ...form, cta_bancaria: e.target.value })
                }
              />
            </div>

            {/* Nombre del Banco */}
            <div className="form-group">
              <label>Nombre del Banco</label>
              <input
                type="text"
                value={form.nombre_banco}
                onChange={e =>
                  setForm({ ...form, nombre_banco: e.target.value })
                }
              />
            </div>

            {/* Titular de la Cuenta */}
            <div className="form-group">
              <label>Titular de la Cuenta</label>
              <input
                type="text"
                value={form.nombre_titular}
                onChange={e =>
                  setForm({ ...form, nombre_titular: e.target.value })
                }
              />
            </div>

            {cambiosRealizados && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleGuardarCambios}
              >
                Guardar cambios
              </button>
            )}

            {success && (
              <p className="success-text">
                Perfil actualizado correctamente ✔
              </p>
            )}
          </form>
        </div>
      </section>
    </>
  );
}