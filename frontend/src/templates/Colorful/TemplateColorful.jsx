import "./Colorful.css";
import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

export default function TemplateColorful({ store, agregarAlCarrito, cantidadCarrito, abrirCarrito, consumidor, abrirAuth, cerrarSesion, onSelectCategory, selectedCategory, onShowAll, showAll, hideHero = false, hideFooter = false, hideProducts = false, children, compact = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuOpen && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    // mark body with theme class so global parts of the page can adapt
    document.body.classList.add('theme-colorful');
    return () => { document.body.classList.remove('theme-colorful'); };
  }, []);

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
      onClick={() => abrirCarrito && abrirCarrito()}
      role="button"
    />
  ) : (
    <div className="colorful-logo" onClick={() => abrirCarrito && abrirCarrito()} style={{cursor:'pointer'}}>{store.name}</div>
  )}
  <nav className="colorful-nav">
    <a href="#" onClick={(e) => { e.preventDefault(); onShowAll ? onShowAll() : (onSelectCategory && onSelectCategory(null)); }}>Ver todo</a>

    <div
      className="colorful-dropdown"
      ref={dropdownRef}
    >
      <a
        href="#"
        className="colorful-dropdown-toggle"
        onClick={(e) => { e.preventDefault(); setMenuOpen(open => !open); }}
      >
        Categorías
      </a>
      {store.categorias && store.categorias.length > 0 && (
        <div className="colorful-dropdown-menu" style={{ display: menuOpen ? 'block' : undefined }}>
          {store.categorias.map(cat => (
            <a
              key={cat.id_categoria}
              href="#"
              onClick={(e) => { e.preventDefault(); onSelectCategory && onSelectCategory(cat.id_categoria); setMenuOpen(false); }}
              className={selectedCategory === cat.id_categoria ? 'active-cat' : ''}
            >
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
        <span className="user-info">👤 {consumidor.mail || (consumidor.nombre ? `${consumidor.nombre} ${consumidor.apellido || ''}` : '')}</span>
        <button className="auth-btn" onClick={cerrarSesion}>Cerrar Sesión</button>
      </>
    ) : (
      <button className="auth-btn" onClick={abrirAuth}>Iniciar Sesión</button>
    )}
    <button className="colorful-carrito-nav" onClick={abrirCarrito} title="Ver carrito">
      🛒 {cantidadCarrito > 0 && <span className="nav-badge">{cantidadCarrito}</span>}
    </button>
  </nav>
</header>

      {/* HERO SECTION */}
      {!hideHero && (
        <section className="colorful-hero">
          <div className="colorful-hero-content">
            <h1>{store.name}</h1>
            <p className="colorful-description">{store.description}</p>
          </div>
        </section>
      )}

      {children}

      {/* FEATURED PRODUCTS */}
      {!hideProducts && (
        <section className="colorful-featured">
          {!selectedCategory && !showAll && <h2>Nuevos productos</h2>}
          <div className="colorful-carousel">
            {(showAll ? store.products : store.products.slice(0, 8)).map((p, idx) => (
            <div key={p.id} className={`colorful-slide slide-${idx % 3}`}>
              <div className="colorful-slide-img">
                {p.foto ? (
                  <Link to={`/tienda/${store.comercio?.slug || ''}/producto/${p.id}`}>
                    <img src={p.foto} alt={p.name} />
                  </Link>
                ) : (
                  <div className="colorful-placeholder">Sin imagen</div>
                )}
              </div>
              <h3>
                <Link to={`/tienda/${store.comercio?.slug || ''}/producto/${p.id}`} className="colorful-product-link">{p.name}</Link>
              </h3>
              <div className="colorful-price-container">
                {(() => {
                  if (p.variantes && p.variantes.length > 0) {
                    const precios = p.variantes.map(v => parseFloat(v.precio)).filter(n => !isNaN(n));
                    if (precios.length === 0) return <span className="colorful-sin-precio">Ver precio en el detalle del producto</span>;
                    const unique = Array.from(new Set(precios.map(n => Number(n))));
                    if (unique.length === 1) return <span className="colorful-price">${unique[0].toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>;
                    const min = Math.min(...precios);
                    return <span className="colorful-price">Desde ${min.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>;
                  }

                  if (p.price && Number(p.price) > 0) {
                    return <span className="colorful-price">${Number(p.price).toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>;
                  }

                  return <span className="colorful-sin-precio">Ver precio en el detalle del producto</span>;
                })()}
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
                  Agregar al carrito
                </button>
              </div>
            </div>
          ))}
          </div>
          {(!hideHero && !showAll && onShowAll) && (
        <div style={{ 
          textAlign: 'center', 
          marginTop: '2rem',
          fontSize: '1.1rem',
          fontWeight: '600',
          opacity: '0.9'
        }}>
          <a href="#" onClick={(e) => { e.preventDefault(); onShowAll && onShowAll(); }} style={{ color: 'inherit', textDecoration: 'none' }}>Ver todo en productos</a>
        </div>
          )}
        </section>
      )}

      {!hideFooter && (
        <>
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
        </>
      )}
    </div>
  );
}