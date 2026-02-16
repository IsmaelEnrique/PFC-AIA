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
          <a href="#">Ver todo</a>
          
          <div className="modern-dropdown">
            <a href="#" className="modern-dropdown-toggle">
              Categorías 
            </a>
            {store.categorias && store.categorias.length > 0 && (
              <div className="modern-dropdown-menu">
                {store.categorias.map(cat => (
                  <a key={cat.id_categoria} href={`#cat-${cat.id_categoria}`}>
                    {cat.nombre_cat}
                  </a>
                ))}
              </div>
            )}
          </div>

          <a href="#">Contacto</a>
          <a href="#">Preguntas frecuentes</a>
          
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
        </div>
        <div className="modern-hero-image"></div>
      </section>

      <section className="modern-products">
        <h3>Nuevos productos</h3>
        <div className="modern-grid">
          {store.products.slice(0, 8).map(p => (
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
                    return <p className="modern-sin-precio">Ver precio en el detalle del producto</p>;
                  }
                })() : (
                  <p className="modern-sin-precio">Ver precio en el detalle del producto</p>
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
                  Agregar al carrito 
                </button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ 
          textAlign: 'center', 
          marginTop: '2rem',
          fontSize: '1.1rem',
          fontWeight: '600',
          color: '#666'
        }}>
          Ver todo en productos
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