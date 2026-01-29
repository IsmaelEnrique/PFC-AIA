import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function GestionProductos() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comercio, setComercio] = useState(null);
  
  // Estados para filtros y ordenamiento
  const [filtroEstado, setFiltroEstado] = useState("todos"); // todos, activos, inactivos
  const [ordenamiento, setOrdenamiento] = useState("nombre"); // nombre, codigo, recientes
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      setLoading(false);
      return;
    }

    const user = JSON.parse(userData);
    fetch(`http://localhost:4000/api/comercio/${user.id_usuario}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.id_comercio) {
          setComercio(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!comercio) return;

    fetch(`http://localhost:4000/api/productos?id_comercio=${comercio.id_comercio}`)
      .then(r => r.json())
      .then(data => {
        setProductos(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [comercio]);

  const handleToggleActivo = async (producto) => {
    if (!window.confirm("¿Cambiar estado del producto?")) return;

    try {
      const response = await fetch(
        `http://localhost:4000/api/productos/${producto.id_producto}/estado`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activo: !producto.activo }),
        }
      );

      if (response.ok) {
        setProductos(
          productos.map(p =>
            p.id_producto === producto.id_producto
              ? { ...p, activo: !p.activo }
              : p
          )
        );
      }
    } catch {
      alert("Error al cambiar estado");
    }
  };

  // Función para filtrar y ordenar productos
  const productosFiltrados = () => {
    let resultado = [...productos];

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      resultado = resultado.filter(p => 
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.codigo.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    // Filtrar por estado
    if (filtroEstado === "activos") {
      resultado = resultado.filter(p => p.activo);
    } else if (filtroEstado === "inactivos") {
      resultado = resultado.filter(p => !p.activo);
    }

    // Ordenar
    if (ordenamiento === "nombre") {
      resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (ordenamiento === "codigo") {
      resultado.sort((a, b) => a.codigo.localeCompare(b.codigo));
    } else if (ordenamiento === "recientes") {
      resultado.sort((a, b) => b.id_producto - a.id_producto);
    }

    return resultado;
  };

  return (
    <>
      <style>{`
        .panel-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 20px;
        }

        .panel-container {
          max-width: 1400px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .panel-title {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }

        .panel-title .accent {
          color: #ffd700;
        }

        .panel-content {
          padding: 30px;
        }

        .actions-bar {
          margin-bottom: 30px;
        }

        .filtros-container {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          padding: 20px;
          background: #f8f9fa;
          border-bottom: 1px solid #e0e0e0;
          align-items: flex-end;
          margin-bottom: 20px;
        }

        .filtro-grupo {
          display: flex;
          flex-direction: column;
          gap: 5px;
          min-width: 200px;
        }

        .filtro-grupo label {
          font-size: 13px;
          font-weight: 600;
          color: #555;
        }

        .input-busqueda,
        .select-filtro {
          padding: 8px 12px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.3s;
        }

        .input-busqueda:focus,
        .select-filtro:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .filtro-resultados {
          display: flex;
          align-items: center;
          margin-left: auto;
          padding: 8px 16px;
          background: white;
          border: 2px solid #667eea;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #667eea;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s;
          font-size: 14px;
        }

        .btn-back {
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          font-size: 14px;
        }

        .btn-back:hover {
          background: #667eea;
          color: white;
          transform: translateX(-3px);
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-small {
          padding: 6px 12px;
          font-size: 12px;
        }

        .btn-secondary {
          background: #e0e0e0;
          color: #333;
        }

        .btn-secondary:hover {
          background: #d0d0d0;
        }

        .btn-danger {
          background: #ff6b6b;
          color: white;
        }

        .btn-danger:hover {
          background: #ff5252;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }

        .empty-state p {
          font-size: 18px;
          margin-bottom: 20px;
        }

        .warning-message {
          color: #ff6b6b;
          font-size: 18px;
          margin: 0 0 20px;
        }

        .productos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .producto-card {
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
          background: white;
          transition: all 0.3s;
        }

        .producto-card:hover {
          border-color: #667eea;
          box-shadow: 0 5px 20px rgba(102, 126, 234, 0.15);
        }

        .producto-imagen {
          width: 100%;
          height: 200px;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .producto-imagen img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .producto-imagen .placeholder {
          color: #b0b0b0;
          font-size: 14px;
          letter-spacing: 0.3px;
        }

        .producto-info {
          padding: 20px;
        }

        .producto-info h3 {
          margin: 0 0 8px;
          font-size: 18px;
          color: #333;
        }

        .codigo {
          color: #666;
          font-size: 13px;
          margin: 0 0 8px;
        }

        .descripcion {
          color: #888;
          font-size: 14px;
          margin: 0 0 12px;
          line-height: 1.4;
        }

        .estado-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .estado-badge.activo {
          background: #d4edda;
          color: #155724;
        }

        .estado-badge.inactivo {
          background: #f8d7da;
          color: #721c24;
        }

        .producto-acciones {
          padding: 15px;
          background: #f9f9f9;
          display: flex;
          gap: 8px;
          border-top: 1px solid #e0e0e0;
        }

        .producto-acciones .btn {
          flex: 1;
        }

        @media (max-width: 768px) {
          .productos-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {!comercio ? (
        <section className="panel-page">
          <div className="panel-container">
            <div className="panel-title panel-header">
              <span>
                Gestión de <span className="accent">Productos</span>
              </span>
              <button
                className="btn btn-back"
                onClick={() => navigate("/admin")}
              >
                ← Volver al panel
              </button>
            </div>

            <div className="panel-content">
              <div className="empty-state">
                <p>No hay un comercio activo</p>
                <p className="warning-message">
                  Creá tu comercio desde la sección <strong>"Activar Comercio"</strong>
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="panel-page">
          <div className="panel-container">
            <div className="panel-title panel-header">
              <span>
                Gestión de <span className="accent">Productos</span>
              </span>
              <button
                className="btn btn-back"
                onClick={() => navigate("/admin")}
              >
                ← Volver al panel
              </button>
            </div>

            <div className="panel-content">
              <div className="actions-bar">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/agregar-producto")}
                >
                  + Agregar Producto
                </button>
              </div>

              {/* Filtros y Ordenamiento */}
              {productos.length > 0 && (
                <div className="filtros-container">
                  <div className="filtro-grupo">
                    <label>🔍 Buscar:</label>
                    <input
                      type="text"
                      placeholder="Nombre o código..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="input-busqueda"
                    />
                  </div>

                  <div className="filtro-grupo">
                    <label>📊 Estado:</label>
                    <select 
                      value={filtroEstado} 
                      onChange={(e) => setFiltroEstado(e.target.value)}
                      className="select-filtro"
                    >
                      <option value="todos">Todos</option>
                      <option value="activos">Activos</option>
                      <option value="inactivos">Inactivos</option>
                    </select>
                  </div>

                  <div className="filtro-grupo">
                    <label>⬇️ Ordenar por:</label>
                    <select 
                      value={ordenamiento} 
                      onChange={(e) => setOrdenamiento(e.target.value)}
                      className="select-filtro"
                    >
                      <option value="nombre">Nombre (A-Z)</option>
                      <option value="codigo">Código</option>
                      <option value="recientes">Más recientes</option>
                    </select>
                  </div>

                  <div className="filtro-resultados">
                    Mostrando {productosFiltrados().length} de {productos.length} productos
                  </div>
                </div>
              )}

              {loading ? (
                <p>Cargando productos...</p>
              ) : productos.length === 0 ? (
                <div className="empty-state">
                  <p>No hay productos creados</p>
                </div>
              ) : productosFiltrados().length === 0 ? (
                <div className="empty-state">
                  <p>No se encontraron productos con los filtros aplicados</p>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      setBusqueda("");
                      setFiltroEstado("todos");
                      setOrdenamiento("nombre");
                    }}
                  >
                    Limpiar filtros
                  </button>
                </div>
              ) : (
                <div className="productos-grid">
                  {productosFiltrados().map(p => (
                    <div key={p.id_producto} className="producto-card">
                      <div className="producto-imagen">
                        {p.foto ? (
                          <img src={`http://localhost:4000${p.foto}`} alt={p.nombre} />
                        ) : (
                          <span className="placeholder">Sin imagen</span>
                        )}
                      </div>
                      <div className="producto-info">
                        <h3>{p.nombre}</h3>
                        <p className="codigo">Código: {p.codigo}</p>
                        <span className={`estado-badge ${p.activo ? "activo" : "inactivo"}`}>
                          {p.activo ? "✓ Activo" : "✗ Inactivo"}
                        </span>
                      </div>
                      <div className="producto-acciones">
                        <button
                          className="btn btn-small btn-primary"
                          onClick={() => navigate(`/agregar-producto?id=${p.id_producto}`)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-small btn-secondary"
                          onClick={() => handleToggleActivo(p)}
                        >
                          {p.activo ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
