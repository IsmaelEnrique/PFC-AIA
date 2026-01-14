import { useState } from "react";

export default function ActivarComercio() {
  const [form, setForm] = useState({
    nombre: "",
    rubro: "",
    descripcion: "",
    direccion: "",
    contacto: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // -------------------------
  // ✅ Validación
  // -------------------------
  const validateForm = () => {
    const newErrors = {};

    if (!form.nombre) newErrors.nombre = "El nombre del comercio es obligatorio.";
    if (!form.rubro) newErrors.rubro = "Seleccioná un rubro.";
    if (!form.descripcion) newErrors.descripcion = "La descripción es obligatoria.";
    if (!form.direccion) newErrors.direccion = "La dirección es obligatoria.";
    if (!form.contacto) newErrors.contacto = "El contacto es obligatorio.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // -------------------------
  // 📤 Envío
  // -------------------------
  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess(false);

    if (!validateForm()) return;

    // 🔜 Acá después va el fetch al backend
    console.log("Comercio activado ✅", form);

    setSuccess(true);
    setErrors({});
  };

  // -------------------------
  // 🧱 UI
  // -------------------------
  return (
    <section className="panel-page">
      <div className="panel-container">
        <h1 className="panel-title">
          Activar <span className="accent">Comercio</span>
        </h1>

        <p className="panel-subtitle">
          Completá los datos de tu emprendimiento para activarlo
        </p>

        <form className="panel-form" onSubmit={handleSubmit} noValidate>
          {/* Nombre */}
          <div className="form-group">
            <label>Nombre del comercio</label>
            <input
              type="text"
              className={errors.nombre ? "error-input" : ""}
              value={form.nombre}
              onChange={(e) =>
                setForm({ ...form, nombre: e.target.value })
              }
            />
            {errors.nombre && <p className="error-text">{errors.nombre}</p>}
          </div>

          {/* Rubro */}
          <div className="form-group">
            <label>Rubro</label>
            <select
              value={form.rubro}
              onChange={(e) =>
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
            {errors.rubro && <p className="error-text">{errors.rubro}</p>}
          </div>

          {/* Descripción */}
          <div className="form-group">
            <label>Descripción</label>
            <textarea
              rows="4"
              value={form.descripcion}
              onChange={(e) =>
                setForm({ ...form, descripcion: e.target.value })
              }
            />
            {errors.descripcion && (
              <p className="error-text">{errors.descripcion}</p>
            )}
          </div>

          {/* Dirección */}
          <div className="form-group">
            <label>Dirección</label>
            <input
              type="text"
              className={errors.nombre ? "error-input" : ""}
              value={form.direccion}
              onChange={(e) =>
                setForm({ ...form, direccion: e.target.value })
              }
            />
            {errors.direccion && (
              <p className="error-text">{errors.direccion}</p>
            )}
          </div>

          {/* Contacto */}
          <div className="form-group">
            <label>Datos de contacto</label>
            <input
              type="text"
              className={errors.nombre ? "error-input" : ""}
              placeholder="Teléfono"
              value={form.contacto}
              onChange={(e) =>
                setForm({ ...form, contacto: e.target.value })
              }
            />
            {errors.contacto && (
              <p className="error-text">{errors.contacto}</p>
            )}
          </div>

          <button type="submit" className="btn btn-primary">
            Activar negocio
          </button>

          {success && (
            <p className="success-text">
              Comercio activado correctamente 🎉
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
