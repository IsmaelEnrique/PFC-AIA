import { apiUrl } from "../config/api";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const FIELD_LIMITS = {
  nombre: 50,
  rubro: 50,
  descripcion: 500,
  preguntas_frecuentes: 5000,
  direccion: 100,
  contacto: 50,
  cuit: 11,
  slug: 255,
};

export default function ActivarComercio() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id_usuario;

  const [form, setForm] = useState({
    nombre: "",
    rubro: "",
    descripcion: "",
    preguntas_frecuentes: "",
    direccion: "",
    contacto: "",
    cuit: "",
    slug: "",
    banner: "",
  });

  const [formOriginal, setFormOriginal] = useState(null);

  const [activo, setActivo] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [mostrarPreguntasFrecuentes, setMostrarPreguntasFrecuentes] = useState(false);

  // 🔄 Cargar comercio si existe
  useEffect(() => {
    if (!userId) return;

    fetch(apiUrl(`/api/comercio/${userId}`))
      .then(res => res.json())
      .then(data => {
        if (data) {
          const datosComercio = {
            nombre: data.nombre_comercio || "",
            rubro: data.rubro || "",
            descripcion: data.descripcion || "",
            preguntas_frecuentes: data.preguntas_frecuentes || "",
            direccion: data.direccion || "",
            contacto: data.contacto || "",
            cuit: data.cuit || "",
            slug: data.slug || "",
            banner: data.banner || "",
          };
          setForm(datosComercio);
          setFormOriginal(datosComercio);
          setActivo(data.activo);
          setMostrarPreguntasFrecuentes(Boolean(data.preguntas_frecuentes));
        }
      });
  }, [userId]);

  // Detectar cambios en el formulario
  const cambiosRealizados = formOriginal !== null && JSON.stringify(form) !== JSON.stringify(formOriginal);

  const validateForm = () => {
    const newErrors = {};

    const cuitSoloDigitos = (form.cuit || "").replace(/\D/g, "");

    if (!form.nombre?.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
    } else if (form.nombre.trim().length > FIELD_LIMITS.nombre) {
      newErrors.nombre = `El nombre no puede superar ${FIELD_LIMITS.nombre} caracteres`;
    }

    if (form.rubro && form.rubro.length > FIELD_LIMITS.rubro) {
      newErrors.rubro = `El rubro no puede superar ${FIELD_LIMITS.rubro} caracteres`;
    }

    if (form.descripcion && form.descripcion.length > FIELD_LIMITS.descripcion) {
      newErrors.descripcion = `La descripción no puede superar ${FIELD_LIMITS.descripcion} caracteres`;
    }

    if (form.preguntas_frecuentes && form.preguntas_frecuentes.length > FIELD_LIMITS.preguntas_frecuentes) {
      newErrors.preguntas_frecuentes = `Las preguntas frecuentes no pueden superar ${FIELD_LIMITS.preguntas_frecuentes} caracteres`;
    }

    if (form.direccion && form.direccion.length > FIELD_LIMITS.direccion) {
      newErrors.direccion = `La dirección no puede superar ${FIELD_LIMITS.direccion} caracteres`;
    }

    if (form.contacto && form.contacto.length > FIELD_LIMITS.contacto) {
      newErrors.contacto = `El contacto no puede superar ${FIELD_LIMITS.contacto} caracteres`;
    }

    if (form.slug && form.slug.length > FIELD_LIMITS.slug) {
      newErrors.slug = `La URL personalizada no puede superar ${FIELD_LIMITS.slug} caracteres`;
    }

    if (!form.slug?.trim()) {
      newErrors.slug = "La URL personalizada (slug) es obligatoria";
    }

    if (cuitSoloDigitos && cuitSoloDigitos.length !== FIELD_LIMITS.cuit) {
      newErrors.cuit = "El CUIT debe tener exactamente 11 dígitos";
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

    // Validar el formulario
    if (!validateForm()) return;

    // Pedir confirmación al usuario
    if (!window.confirm("¿Estás seguro que querés guardar los cambios?")) {
      return;
    }

    try {
      const cuitSoloDigitos = (form.cuit || "").replace(/\D/g, "");
      const response = await fetch(apiUrl("/api/comercio/activar"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_usuario: user.id_usuario,
            nombre: form.nombre.trim(),
            rubro: form.rubro || null,
            descripcion: form.descripcion || null,
            preguntas_frecuentes: form.preguntas_frecuentes || null,
            direccion: form.direccion || null,
            contacto: form.contacto || null,
            cuit: cuitSoloDigitos || null,
            slug: form.slug || null,
            banner: form.banner || null,
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
      const cuitSoloDigitos = (form.cuit || "").replace(/\D/g, "");
      const response = await fetch(apiUrl("/api/comercio/activar"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_usuario: user.id_usuario,
            nombre: form.nombre.trim(),
            rubro: form.rubro || null,
            descripcion: form.descripcion || null,
            preguntas_frecuentes: form.preguntas_frecuentes || null,
            direccion: form.direccion || null,
            contacto: form.contacto || null,
            cuit: cuitSoloDigitos || null,
            slug: form.slug || null,
            banner: form.banner || null,
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
          className="btn btn-back"
          onClick={() => navigate("/admin")}
        >
          ← Volver al panel
        </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
          <p className="panel-subtitle" style={{ margin: 0 }}>
            Completá los datos de tu emprendimiento. Los datos con * son obligarios.
          </p>
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
              maxLength={FIELD_LIMITS.nombre}
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
              className={errors.rubro ? "error-input" : ""}
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
            {errors.rubro && <p className="error-text">{errors.rubro}</p>}
          </div>

          {/* Descripción */}
          <div className="form-group">
            <label>Descripción</label>
            <textarea
              rows="4"
              value={form.descripcion}
              className={errors.descripcion ? "error-input" : ""}
              maxLength={FIELD_LIMITS.descripcion}
              onChange={e =>
                setForm({ ...form, descripcion: e.target.value })
              }
            />
            {errors.descripcion && <p className="error-text">{errors.descripcion}</p>}
          </div>

          <div className="form-group">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setMostrarPreguntasFrecuentes((prev) => !prev)}
              style={{ marginBottom: "10px" }}
            >
              {mostrarPreguntasFrecuentes
                ? "Ocultar texto de preguntas frecuentes"
                : "Agregar texto de preguntas frecuentes"}
            </button>

            {mostrarPreguntasFrecuentes && (
              <>
                <label>Preguntas frecuentes (envíos, pagos, cambios, devoluciones)</label>
                <textarea
                  rows="8"
                  value={form.preguntas_frecuentes}
                  className={errors.preguntas_frecuentes ? "error-input" : ""}
                  maxLength={FIELD_LIMITS.preguntas_frecuentes}
                  placeholder="Ejemplo: Envíos en 24/48 hs, medios de pago disponibles, política de cambios y devoluciones..."
                  onChange={e =>
                    setForm({ ...form, preguntas_frecuentes: e.target.value })
                  }
                />
                <p style={{ fontSize: "12px", color: "#6c757d", marginTop: "6px" }}>
                  {form.preguntas_frecuentes.length}/{FIELD_LIMITS.preguntas_frecuentes} caracteres
                </p>
                {errors.preguntas_frecuentes && <p className="error-text">{errors.preguntas_frecuentes}</p>}
              </>
            )}
          </div>

          {/* Dirección */}
          <div className="form-group">
            <label>Dirección</label>
            <input
              type="text"
              value={form.direccion}
              className={errors.direccion ? "error-input" : ""}
              maxLength={FIELD_LIMITS.direccion}
              onChange={e =>
                setForm({ ...form, direccion: e.target.value })
              }
            />
            {errors.direccion && <p className="error-text">{errors.direccion}</p>}
          </div>

          {/* Contacto*/}
          <div className="form-group">
            <label>Contacto</label>
            <input
              type="text"
              value={form.contacto}
              className={errors.contacto ? "error-input" : ""}
              maxLength={FIELD_LIMITS.contacto}
              onChange={e =>
                setForm({ ...form, contacto: e.target.value })
              }
            />
            {errors.contacto && <p className="error-text">{errors.contacto}</p>}
          </div>

          {/* CUIT - Opcional */}
          <div className="form-group">
            <label>CUIT </label>
            <input
              type="text"
              placeholder="Ej: 20-12345678-9"
              value={form.cuit}
              className={errors.cuit ? "error-input" : ""}
              maxLength={13}
              onChange={e =>
                setForm({ ...form, cuit: e.target.value.replace(/[^\d-]/g, "") })
              }
            />
            {errors.cuit && <p className="error-text">{errors.cuit}</p>}
          </div>

          {/* Slug - URL personalizada */}
          <div className="form-group">
            <label>URL personalizada de tu tienda *</label>
            <div style={{
              background: "#f8f9fa",
              border: "2px solid #e9ecef",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "8px"
            }}>
              <div style={{ 
                fontSize: "13px", 
                color: "#6c757d", 
                marginBottom: "6px",
                fontWeight: "500"
              }}>
                Tu tienda estará disponible en:
              </div>
              <div style={{ 
                fontSize: "16px", 
                color: "#667eea", 
                fontWeight: "600",
                fontFamily: "monospace",
                wordBreak: "break-all"
              }}>
                tudominio.com/tienda/<span style={{ background: "#fff3cd", borderRadius: "4px" }}>{form.slug || "tu-comercio"}</span>
              </div>
            </div>
            <input
              type="text"
              placeholder="Ej: mi-tienda, mi-emprendimiento"
              value={form.slug}
              className={errors.slug ? "error-input" : ""}
              maxLength={FIELD_LIMITS.slug}
              onChange={e => {
                const valor = e.target.value.toLowerCase();
                const slug = valor
                  .replace(/\s+/g, '-')
                  .replace(/[^a-z0-9-]/g, '')
                  .replace(/-+/g, '-')
                  .replace(/^-|-$/g, '');
                setForm({ ...form, slug });
              }}
            />
            {errors.slug && <p className="error-text">{errors.slug}</p>}
            <p style={{ 
              fontSize: "13px", 
              color: "#6c757d", 
              marginTop: "6px",
              fontStyle: "italic"
            }}>
              💡 Solo letras, números y guiones. Ej: mi-comercio, tienda-online
            </p>
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
              {activo ? "Desactivar comercio" : "Guardar cambios"}
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