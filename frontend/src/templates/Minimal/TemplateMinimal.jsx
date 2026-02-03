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
            <a href="#">Productos</a>
            <a href="#">Sobre nosotros</a>
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
        <button className="minimal-cta">Explorar</button>
      </section>

      <section className="minimal-list">
        <h3 className="minimal-section-title">Nuestros productos</h3>
        <div className="minimal-products">
          {store.products.map(p => (
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
                  const precioMin = Math.min(...precios);
                  return <p className="minimal-price">Desde ${precioMin.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>;
                }
              })() : (
                <p className="minimal-sin-precio">Consultar precio</p>
              )}
              <button 
                className="minimal-item-btn"
                onClick={() => {
                  if (p.variantes && p.variantes.length > 0) {
                    // Si tiene variantes, agrega la primera por defecto
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
