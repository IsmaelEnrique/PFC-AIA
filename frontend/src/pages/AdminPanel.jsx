import { Link } from "react-router-dom";

export default function AdminPanel() {
  return (
    <section className="admin-page">
      <div className="admin-container">
        <h1 className="admin-title">
          Panel de Administración
        </h1>

        <p className="admin-subtitle">
          Gestioná tu cuenta y tu emprendimiento
        </p>

        <div className="admin-actions">
          <Link to="/perfil" className="btn btn-primary">
            Ver perfil
          </Link>

          <Link to="/activar-comercio" className="btn btn-secondary">
            Activar comercio
          </Link>

          <Link to="/disenar-pagina" className="btn btn-secondary">
            Diseñar página
          </Link>

          <Link to="/gestion-productos" className="btn btn-secondary">
            Gestión de productos
          </Link>

          <Link to="/gestion-categorias" className="btn btn-secondary">
            Gestión de categorías
          </Link>
        </div>
      </div>
    </section>
  );
}