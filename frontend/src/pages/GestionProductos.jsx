import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function GestionProductos() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comercio, setComercio] = useState(null);
  
  // Estados para filtros y ordenamiento
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [ordenamiento, setOrdenamiento] = useState("nombre");
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

  const productosFiltrados = () => {
    let resultado = [...productos];

    if (busqueda.trim()) {
      resultado = resultado.filter(p => 
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.codigo.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    if (filtroEstado === "activos") {
      resultado = resultado.filter(p => p.activo);
    } else if (filtroEstado === "inactivos") {
      resultado = resultado.filter(p => !p.activo);
    }

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
          min-height: calc(100vh - 70px);
          background: #FFFFFF;
          padding: 3rem 2rem;
        }

        .panel-container {
          max-width: 1100px;
          margin: 0 auto;
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .panel-title {
          font-size: 2.8rem;
          color: #14213D;
          font-weight: 700;
          letter-spacing: 0.5px;
          margin: 0;
        }

        .panel-title .accent {
          color: #FCA311;
        }

        .panel-content {
          margin-top: 2rem;
        }

        .actions-bar {
          margin-bottom: 2rem;
        }

        .filtros-container {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          padding: 20px;
          background: #f5f5f5;
          border: 1px solid #e0e0e0;
          border-radius: 10px;
          align-items: flex-end;
          margin-bottom: 2rem;
        }

        .filtro-grupo {
          display: flex;
          flex-direction: column;
          gap: 5px;
          min-width: 200px;
        }

        .filtro-grupo label {
          font-size: 14px;
          font-weight: 600;
          color: #14213D;
        }

        .input-busqueda,
        .select-filtro {
          padding: 10px 14px;
          border: 1px solid #e0e0e0;
          border-radius: 10px;
          font-size: 14px;
          transition: all 0.3s;
          background: white;
          color: #14213D;
        }

        .input-busqueda:focus,
        .select-filtro:focus {
          outline: none;
          border-color: #FCA311;
          box-shadow: 0 0 0 3px rgba(252, 163, 17, 0.1);
        }

        .filtro-resultados {
          display: flex;
          align-items: center;
          margin-left: auto;
          padding: 10px 16px;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          color: #14213D;
        }

        .panel-page .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
          font-size: 14px;
        }

        .panel-page .btn-primary {
          background: #FCA311;
          color: white;
          border: none;
        }

        .panel-page .btn-primary:hover {
          background: #e69310;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(252, 163, 17, 0.3);
        }

        .btn-small {
          padding: 8px 16px;
          font-size: 13px;
        }

        .panel-page .btn-secondary {
          background: #f5f5f5;
          color: #14213D;
          border: 1px solid #e0e0e0;
        }

        .panel-page .btn-secondary:hover {
          background: #e0e0e0;
        }

        .btn-danger {
          background: #dc3545;
          color: white;
        }

        .btn-danger:hover {
          background: #c82333;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #6B6B6B;
        }

        .empty-state p {
          font-size: 18px;
          margin-bottom: 20px;
          color: #14213D;
        }

        .warning-message {
          color: #dc3545;
          font-size: 16px;
          margin: 0 0 20px;
        }

        .productos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }

        .producto-card {
          border: 1px solid #e0e0e0;
          border-radius: 10px;
          overflow: hidden;
          background: white;
          transition: all 0.3s;
        }

        .producto-card:hover {
          border-color: #FCA311;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
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
          color: #6B6B6B;
          font-size: 14px;
        }

        .producto-info {
          padding: 20px;
        }

        .producto-info h3 {
          margin: 0 0 8px;
          font-size: 18px;
          color: #14213D;
          font-weight: 600;
        }

        .codigo {
          color: #6B6B6B;
          font-size: 13px;
          margin: 0 0 12px;
        }

        .estado-badge {
          display: inline-block;
          padding: 5px 12px;
          border-radius: 20px;
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
          padding: 15px 20px;
          background: #f5f5f5;
          display: flex;
          gap: 10px;
          border-top: 1px solid #e0e0e0;
        }

        .producto-acciones .btn {
          flex: 1;
        }

        @media (max-width: 768px) {
          .panel-title {
            font-size: 2rem;
          }
          
          .productos-grid {
            grid-template-columns: 1fr;
          }

          .panel-header {
            flex-direction: column;
            align-items: flex-start;
          }

        }
      `}</style>

      {!comercio ? (
        <section className="panel-page">
          <div className="panel-container">
            <div className="panel-header">
              <h1 className="panel-title">
                Gestión de Productos
              </h1>
              <button
              type="button"
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
            <div className="panel-header">
              <h1 className="panel-title">
                Gestión de Productos
              </h1>
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

              {productos.length > 0 && (
                <div className="filtros-container">
                  <div className="filtro-grupo">
                    <label>Buscar:</label>
                    <input
                      type="text"
                      placeholder="Nombre o código..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="input-busqueda"
                    />
                  </div>

                  <div className="filtro-grupo">
                    <label>Estado:</label>
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
                    <label> Ordenar por:</label>
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