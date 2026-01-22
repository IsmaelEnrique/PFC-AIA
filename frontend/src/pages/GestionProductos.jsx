
import { useState, useEffect } from "react";

export default function GestionProductos() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
  });
  const [errors, setErrors] = useState({});

  // Cargar productos
  useEffect(() => {
    if (!user) return;
    
    fetch(`http://localhost:4000/api/productos?id_usuario=${user.id_usuario}`)
      .then(res => res.json())
      .then(data => {
        setProductos(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error al cargar productos:", error);
        setLoading(false);
      });
  }, [user]);

  const validateForm = () => {
    const newErrors = {};
    if (!form.nombre) newErrors.nombre = "El nombre es obligatorio";
    if (!form.precio) newErrors.precio = "El precio es obligatorio";
    if (isNaN(form.precio) || parseFloat(form.precio) <= 0) {
      newErrors.precio = "El precio debe ser un número positivo";
    }
    if (!form.stock && form.stock !== "0") newErrors.stock = "El stock es obligatorio";
    if (isNaN(form.stock) || parseInt(form.stock) < 0) {
      newErrors.stock = "El stock debe ser un número no negativo";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAgregar = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const response = await fetch("http://localhost:4000/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: user.id_usuario,
          nombre: form.nombre,
          descripcion: form.descripcion,
          precio: parseFloat(form.precio),
          stock: parseInt(form.stock),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error });
        return;
      }

      setProductos([...productos, data]);
      setForm({ nombre: "", descripcion: "", precio: "", stock: "" });
      setShowForm(false);
      setErrors({});
    } catch (error) {
      console.error("Error:", error);
      setErrors({ general: "No se pudo conectar al servidor" });
    }
  };

  const handleEliminar = async (idProducto) => {
    if (!window.confirm("¿Estás seguro que querés eliminar este producto?")) return;

    try {
      const response = await fetch(`http://localhost:4000/api/productos/${idProducto}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        alert("Error al eliminar el producto");
        return;
      }

      setProductos(productos.filter(p => p.id !== idProducto));
    } catch (error) {
      console.error("Error:", error);
      alert("No se pudo conectar al servidor");
    }
  };

  return (
    <section className="panel-page">
      <div className="panel-container">
        <h1 className="panel-title">
          Gestión de <span className="accent">Productos</span>
        </h1>

        <p className="panel-subtitle">
          Administrá los productos de tu tienda
        </p>

        {errors.general && <p className="error-text">{errors.general}</p>}

        {!showForm && (
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            + Agregar producto
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

            <div className="form-group">
              <label>Descripción</label>
              <textarea
                value={form.descripcion}
                onChange={e => setForm({ ...form, descripcion: e.target.value })}
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Precio *</label>
              <input
                type="number"
                step="0.01"
                value={form.precio}
                onChange={e => setForm({ ...form, precio: e.target.value })}
              />
              {errors.precio && <p className="error-text">{errors.precio}</p>}
            </div>

            <div className="form-group">
              <label>Stock *</label>
              <input
                type="number"
                value={form.stock}
                onChange={e => setForm({ ...form, stock: e.target.value })}
              />
              {errors.stock && <p className="error-text">{errors.stock}</p>}
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
                  setForm({ nombre: "", descripcion: "", precio: "", stock: "" });
                  setErrors({});
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p>Cargando productos...</p>
        ) : productos.length === 0 ? (
          <p>No hay productos agregados aún.</p>
        ) : (
          <div className="products-table">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map(producto => (
                  <tr key={producto.id}>
                    <td>{producto.nombre}</td>
                    <td>{producto.descripcion}</td>
                    <td>${producto.precio}</td>
                    <td>{producto.stock}</td>
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleEliminar(producto.id)}
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