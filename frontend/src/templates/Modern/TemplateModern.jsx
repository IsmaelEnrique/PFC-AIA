import "./Modern.css";
export default function TemplateModern({ store, agregarAlCarrito, cantidadCarrito, abrirCarrito, consumidor, abrirAuth, cerrarSesion }) {
  return (
    <div className="modern">
      <header className="modern-header">
        {store.logo ? (
          <img 
            src={store.logo} 
            alt="Logo" 
            className="modern-logo-img"
            style={{ maxHeight: `${store.logoSize || 50}px` }}
          />
        ) : (
          <div className="modern-logo">{store.name}</div>
        )}
        <nav className="modern-nav">
          <a href="#">Productos</a>
          <a href="#">Categorías</a>
          <a href="#">Contacto</a>
          {consumidor ? (
            <>
              <span className="user-info">👤 {consumidor.nombre_usuario}</span>
              <button className="auth-btn" onClick={cerrarSesion}>Cerrar Sesión</button>
            </>
          ) : (
            <button className="auth-btn" onClick={abrirAuth}>Iniciar Sesión</button>
          )}
          <button 
            className="modern-carrito-nav" 
            onClick={abrirCarrito}
            title="Ver carrito"
          >
            🛒 {cantidadCarrito > 0 && <span className="nav-badge">{cantidadCarrito}</span>}
          </button>
        </nav>
      </header>

      <section className="modern-hero">
        <div className="modern-hero-content">
          <h2>{store.description}</h2>
          <button className="modern-hero-btn">Comprar ahora</button>
        </div>
        <div className="modern-hero-image"></div>
      </section>

      <section className="modern-products">
        <h3>Productos destacados</h3>
        <div className="modern-grid">
          {store.products.map(p => (
            <div key={p.id} className="modern-card">
              <div className="modern-card-image">
                {p.foto ? (
                  <img src={p.foto} alt={p.name} />
                ) : (
                  <div className="modern-placeholder">Sin imagen</div>
                )}
              </div>
              <div className="modern-card-content">
                <h4>{p.name}</h4>
                {p.variantes && p.variantes.length > 0 ? (() => {
                  const precios = p.variantes.map(v => parseFloat(v.precio));
                  const precioUnico = precios.every(precio => precio === precios[0]);
                  
                  if (precioUnico) {
                    return <p className="modern-card-price">${precios[0].toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>;
                  } else {
                    const precioMin = Math.min(...precios);
                    return <p className="modern-card-price">Desde ${precioMin.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>;
                  }
                })() : (
                  <p className="modern-sin-precio">Consultar precio</p>
                )}
                <button 
                  className="modern-card-btn"
                  onClick={() => {
                    if (p.variantes && p.variantes.length > 0) {
                      agregarAlCarrito(p, p.variantes[0]);
                    } else {
                      agregarAlCarrito(p);
                    }
                  }}
                >
                  Agregar al carrito 🛒
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="modern-footer">
        <p>© 2024 {store.name}. Todos los derechos reservados.</p>
      </footer>

      {/* Botón flotante del carrito */}
      {abrirCarrito && (
        <button className="carrito-flotante carrito-flotante-modern" onClick={abrirCarrito}>
          🛒
          {cantidadCarrito > 0 && (
            <span className="carrito-badge">{cantidadCarrito}</span>
          )}
        </button>
      )}
    </div>
  );
}
