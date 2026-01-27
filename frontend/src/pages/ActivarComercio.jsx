import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ActivarComercio() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [form, setForm] = useState({
    nombre: "",
    rubro: "",
    descripcion: "",
    direccion: "",
    contacto: "",
    cuit: "",
  });

  const [formOriginal, setFormOriginal] = useState(null);

  const [activo, setActivo] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // 🔄 Cargar comercio si existe
  useEffect(() => {
    if (!user) return;

    fetch(`http://localhost:4000/api/comercio/${user.id_usuario}`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          const datosComercio = {
            nombre: data.nombre_comercio || "",
            rubro: data.rubro || "",
            descripcion: data.descripcion || "",
            direccion: data.direccion || "",
            contacto: data.contacto || "",
            cuit: data.cuit || "",
          };
          setForm(datosComercio);
          setFormOriginal(datosComercio);
          setActivo(data.activo);
        }
      });
  }, []);

  // Detectar cambios en el formulario
  const cambiosRealizados = formOriginal !== null && JSON.stringify(form) !== JSON.stringify(formOriginal);

  const validateForm = () => {
    const newErrors = {};
    if (!form.nombre) newErrors.nombre = "El nombre es obligatorio";
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

    // Validar el formulario
    if (!validateForm()) return;

    // Pedir confirmación al usuario
    if (!window.confirm("¿Estás seguro que querés guardar los cambios?")) {
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:4000/api/comercio/activar",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_usuario: user.id_usuario,
            nombre: form.nombre,
            rubro: form.rubro || null,
            descripcion: form.descripcion || null,
            direccion: form.direccion || null,
            contacto: form.contacto || null,
            cuit: form.cuit || null,
            activo: activo,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error });
        return;
      }

      // Actualizar el formulario original
      setFormOriginal(form);
      setSuccess(true);
      setErrors({});
    } catch (error) {
      console.error("Error:", error);
      setErrors({ general: "No se pudo conectar al servidor" });
    }
  };

  const handleActivarDesactivar = async (e) => {
    e.preventDefault();
    setSuccess(false);

    if (!user) {
      setErrors({ general: "Debés iniciar sesión" });
      return;
    }

    // Si está inactivo y quiere activar, validar solo nombre
    if (!activo && !validateForm()) return;

    // Pedir confirmación al usuario
    const nuevoEstado = !activo;
    const mensaje = nuevoEstado 
      ? "¿Estás seguro que querés activar el comercio?" 
      : "¿Estás seguro que querés desactivar el comercio?";
    
    if (!window.confirm(mensaje)) {
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:4000/api/comercio/activar",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_usuario: user.id_usuario,
            nombre: form.nombre,
            rubro: form.rubro || null,
            descripcion: form.descripcion || null,
            direccion: form.direccion || null,
            contacto: form.contacto || null,
            cuit: form.cuit || null,
            activo: nuevoEstado,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error });
        return;
      }

      // Actualizar estados
      setActivo(nuevoEstado);
      setFormOriginal(form);
      setSuccess(true);
      setErrors({});
    } catch (error) {
      console.error("Error:", error);
      setErrors({ general: "No se pudo conectar al servidor" });
    }
  };

  return (
    <section className="panel-page">
      <div className="panel-container">
        <div
          className="panel-title"
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}
        >
          <span>
            Gestión <span className="accent"> del comercio</span>
          </span>
          <button
            type="button"
            className="btn"
            onClick={() => navigate("/admin")}
            style={{
              background: "white",
              color: "#667eea",
              border: "2px solid #667eea",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              fontSize: "14px",
            }}
          >
            ← Volver al panel
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
          <p className="panel-subtitle" style={{ margin: 0 }}>
            Completá los datos de tu emprendimiento. Los datos con * son obligarios.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate("/cargar-logo")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              padding: "16px 26px",
              fontSize: "16px",
              fontWeight: 800,
              minWidth: "210px",
              letterSpacing: "0.3px",
              boxShadow: "0 8px 18px rgba(102, 126, 234, 0.25)",
              borderRadius: "10px"
            }}
          >
          
            <span style={{ lineHeight: 1 }}>Subir logo</span>
          </button>
        </div>

        <form className="panel-form" noValidate>

          {errors.general && (
            <p className="error-text">{errors.general}</p>
          )}

          {/* Nombre */}
          <div className="form-group">
            <label>Nombre del comercio *</label>
            <input
              type="text"
              value={form.nombre}
              className={errors.nombre ? "error-input" : ""}
              onChange={e =>
                setForm({ ...form, nombre: e.target.value })
              }
            />
            {errors.nombre && <p className="error-text">{errors.nombre}</p>}
          </div>

          {/* Rubro*/}
          <div className="form-group">
            <label>Rubro</label>
            <select
              value={form.rubro}
              onChange={e =>
                setForm({ ...form, rubro: e.target.value })
              }
            >
              <option value="">Seleccionar</option>
              <option value="indumentaria">Indumentaria</option>
              <option value="gastronomia">Gastronomía</option>
              <option value="servicios">Servicios</option>
              <option value="tecnologia">Tecnología</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          {/* Descripción */}
          <div className="form-group">
            <label>Descripción</label>
            <textarea
              rows="4"
              value={form.descripcion}
              onChange={e =>
                setForm({ ...form, descripcion: e.target.value })
              }
            />
          </div>

          {/* Dirección */}
          <div className="form-group">
            <label>Dirección</label>
            <input
              type="text"
              value={form.direccion}
              onChange={e =>
                setForm({ ...form, direccion: e.target.value })
              }
            />
          </div>

          {/* Contacto*/}
          <div className="form-group">
            <label>Contacto</label>
            <input
              type="text"
              value={form.contacto}
              onChange={e =>
                setForm({ ...form, contacto: e.target.value })
              }
            />
          </div>

          {/* CUIT - Opcional */}
          <div className="form-group">
            <label>CUIT </label>
            <input
              type="text"
              placeholder="Ej: 20-12345678-9"
              value={form.cuit}
              onChange={e =>
                setForm({ ...form, cuit: e.target.value })
              }
            />
          </div>

          {/* Botones */}
          <div style={{ display: "flex", gap: "10px" }}>
            {cambiosRealizados && (
              <button 
                type="button"
                className="btn btn-primary"
                onClick={handleGuardarCambios}
              >
                Guardar cambios
              </button>
            )}
            <button 
              type="button"
              className="btn btn-dark-gray"
              onClick={handleActivarDesactivar}
            >
              {activo ? "Desactivar comercio" : "Activar comercio"}
            </button>
          </div>

          {success && (
            <p className="success-text">
              Comercio guardado correctamente ✔
            </p>
          )}
        </form>
      </div>
    </section>
  );
}