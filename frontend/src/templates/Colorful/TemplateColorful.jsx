import "./Colorful.css";
export default function TemplateColorful({ store, agregarAlCarrito, cantidadCarrito, abrirCarrito, consumidor, abrirAuth, cerrarSesion }) {
  return (
    <div className="colorful">
      {/* HEADER */}
<header className="colorful-header">
  {store.logo ? (
    <img 
      src={store.logo} 
      alt="Logo" 
      className="colorful-logo-img"
      style={{ maxHeight: `${store.logoSize || 50}px` }}
    />
  ) : (
    <div className="colorful-logo">{store.name}</div>
  )}
  <nav className="colorful-nav">
    <a href="#">Ver todo</a>
    
    <div className="colorful-dropdown">
      <a href="#" className="colorful-dropdown-toggle">
        Categorías
      </a>
      {store.categorias && store.categorias.length > 0 && (
        <div className="colorful-dropdown-menu">
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
      className="colorful-carrito-nav" 
      onClick={abrirCarrito}
      title="Ver carrito"
    >
      🛒 {cantidadCarrito > 0 && <span className="nav-badge">{cantidadCarrito}</span>}
    </button>
  </nav>
</header>

      {/* HERO SECTION */}
      <section className="colorful-hero">
        <div className="colorful-hero-content">
          <h1>{store.name}</h1>
          <p className="colorful-description">{store.description}</p>
          
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="colorful-featured">
        <h2>Nuevos productos</h2>
        <div className="colorful-carousel">
          {store.products.slice(0, 8).map((p, idx) => (
            <div key={p.id} className={`colorful-slide slide-${idx % 3}`}>
              <div className="colorful-slide-img">
                {p.foto ? (
                  <img src={p.foto} alt={p.name} />
                ) : (
                  <div className="colorful-placeholder">Sin imagen</div>
                )}
              </div>
              <h3>{p.name}</h3>
              <div className="colorful-price-container">
                {p.variantes && p.variantes.length > 0 ? (() => {
                  const precios = p.variantes.map(v => parseFloat(v.precio));
                  const precioUnico = precios.every(precio => precio === precios[0]);
                  
                  if (precioUnico) {
                    return <span className="colorful-price">${precios[0].toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>;
                  } else {
                    return <span className="colorful-sin-precio">Ver precio en el detalle del producto</span>;
                  }
                })() : (
                  <span className="colorful-sin-precio">Ver precio en el detalle del producto</span>
                )}
                <button 
                  className="colorful-slide-btn"
                  onClick={() => {
                    if (p.variantes && p.variantes.length > 0) {
                      agregarAlCarrito(p, p.variantes[0]);
                    } else {
                      agregarAlCarrito(p);
                    }
                  }}
                >
                  Agregar 🛒
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
        opacity: '0.9'
      }}>
        Ver todo en productos
      </div>
      </section>

      {/* FOOTER */}
      <footer className="colorful-footer">
        <p>© 2024 {store.name}. ¡Gracias por tu visita!</p>
      </footer>

      {/* Botón flotante del carrito */}
      {abrirCarrito && (
        <button className="carrito-flotante carrito-flotante-colorful" onClick={abrirCarrito}>
          🛒
          {cantidadCarrito > 0 && (
            <span className="carrito-badge">{cantidadCarrito}</span>
          )}
        </button>
      )}
    </div>
  );
}