// frontend/src/pages/GestionCategorias.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function GestionCategorias() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [comercio, setComercio] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
  });
  const [errors, setErrors] = useState({});

  // Cargar comercio del usuario
  useEffect(() => {
    if (!user) return;

    fetch(`http://localhost:4000/api/comercio?id_usuario=${user.id_usuario}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.id_comercio) {
          setComercio(data);
          // Cargar categorías del comercio
          cargarCategorias(data.id_comercio);
        } else {
          setLoading(false);
        }
      })
      .catch(error => {
        console.error("Error al cargar comercio:", error);
        setLoading(false);
      });
  }, [user]);

  const cargarCategorias = (idComercio) => {
    fetch(`http://localhost:4000/api/categorias?id_comercio=${idComercio}`)
      .then(res => res.json())
      .then(data => {
        const categoriasFormato = Array.isArray(data) ? data.map(cat => ({
          id: cat.id_categoria,
          nombre: cat.nombre_cat,
        })) : [];
        setCategorias(categoriasFormato);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error al cargar categorías:", error);
        setLoading(false);
      });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.nombre) newErrors.nombre = "El nombre es obligatorio";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAgregar = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const response = await fetch("http://localhost:4000/api/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_comercio: comercio.id_comercio,
          nombre: form.nombre,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error });
        return;
      }

      const nuevaCategoria = {
        id: data.id_categoria,
        nombre: data.nombre_cat,
      };

      setCategorias([...categorias, nuevaCategoria]);
      setForm({ nombre: "" });
      setShowForm(false);
      setErrors({});
    } catch (error) {
      console.error("Error:", error);
      setErrors({ general: "No se pudo conectar al servidor" });
    }
  };

  const handleEliminar = async (idCategoria) => {
    if (!window.confirm("¿Estás seguro que querés eliminar esta categoría?")) return;

    try {
      const response = await fetch(`http://localhost:4000/api/categorias/${idCategoria}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        alert("Error al eliminar la categoría");
        return;
      }

      setCategorias(categorias.filter(c => c.id !== idCategoria));
    } catch (error) {
      console.error("Error:", error);
      alert("No se pudo conectar al servidor");
    }
  };

  if (!comercio && !loading) {
    return (
      <section className="panel-page">
        <div className="panel-container">
          <p>Primero debes crear un comercio para administrar categorías.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="panel-page">
      <div className="panel-container">
        <div
          className="panel-title"
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}
        >
          <span>
            Gestión de <span className="accent">Categorías</span>
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
          Organizá las categorías de tu tienda
        </p>

        {errors.general && <p className="error-text">{errors.general}</p>}

        {!showForm && (
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            + Agregar categoría
          </button>
        )}

        {showForm && (
          <form className="panel-form" onSubmit={handleAgregar}>
            <div className="form-group">
              <label>Nombre *</label>
              <input
                type="text"
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
              />
              {errors.nombre && <p className="error-text">{errors.nombre}</p>}
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn btn-primary">
                Guardar
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowForm(false);
                  setForm({ nombre: "" });
                  setErrors({});
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p>Cargando categorías...</p>
        ) : categorias.length === 0 ? (
          <p>No hay categorías agregadas aún.</p>
        ) : (
          <div className="categories-table">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map(categoria => (
                  <tr key={categoria.id}>
                    <td>{categoria.nombre}</td>
                    <td>
                      <button
                        className="btn"
                        style={{ 
                          background: '#14213D', 
                          color: 'white',
                          fontSize: '13px',
                          padding: '8px 16px'
                        }}
                        onClick={() => handleEliminar(categoria.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}