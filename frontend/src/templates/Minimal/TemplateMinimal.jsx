import "./Minimal.css";
export default function TemplateMinimal({ store, agregarAlCarrito, cantidadCarrito, abrirCarrito, consumidor, abrirAuth, cerrarSesion }) {
  return (
    <div className="minimal">
      <header className="minimal-header">
        <div className="minimal-nav">
          {store.logo ? (
            <img 
              src={store.logo} 
              alt="Logo" 
              className="minimal-logo-img"
              style={{ maxHeight: `${store.logoSize || 40}px` }}
            />
          ) : (
            <h1>{store.name}</h1>
          )}
          <nav className="minimal-menu">
            <a href="#">Ver todo</a>
            
            <div className="minimal-dropdown">
              <a href="#" className="minimal-dropdown-toggle">
                Categorías ▼
              </a>
              {store.categorias && store.categorias.length > 0 && (
                <div className="minimal-dropdown-menu">
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
              className="minimal-carrito-nav" 
              onClick={abrirCarrito}
              title="Ver carrito"
            >
              🛒 {cantidadCarrito > 0 && <span className="nav-badge">{cantidadCarrito}</span>}
            </button>
          </nav>
        </div>
      </header>

      <section className="minimal-hero">
        <h2>{store.description}</h2>
      </section>

      <section className="minimal-list">
        <h3 className="minimal-section-title">Nuevos productos</h3>
        <div className="minimal-products">
          {store.products.slice(0, 8).map(p => (
            <div key={p.id} className="minimal-item">
              <div className="minimal-item-image">
                {p.foto ? (
                  <img src={p.foto} alt={p.name} />
                ) : (
                  <div className="minimal-placeholder">Sin imagen</div>
                )}
              </div>
              <h4>{p.name}</h4>
              {p.variantes && p.variantes.length > 0 ? (() => {
                const precios = p.variantes.map(v => parseFloat(v.precio));
                const precioUnico = precios.every(precio => precio === precios[0]);
                
                if (precioUnico) {
                  return <p className="minimal-price">${precios[0].toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>;
                } else {
                  return <p className="minimal-sin-precio">Ver precio en el detalle del producto</p>;
                }
              })() : (
                <p className="minimal-sin-precio">Ver precio en el detalle del producto</p>
              )}
              <button 
                className="minimal-item-btn"
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

      <footer className="minimal-footer">
        <p>© 2024 {store.name}. Todos los derechos reservados.</p>
      </footer>

      {/* Botón flotante del carrito */}
      {abrirCarrito && (
        <button className="carrito-flotante carrito-flotante-minimal" onClick={abrirCarrito}>
          🛒
          {cantidadCarrito > 0 && (
            <span className="carrito-badge">{cantidadCarrito}</span>
          )}
        </button>
      )}
    </div>
  );
}