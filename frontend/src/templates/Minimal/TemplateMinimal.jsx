import "./Minimal.css";
import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

export default function TemplateMinimal({ store, agregarAlCarrito, cantidadCarrito, abrirCarrito, consumidor, abrirAuth, cerrarSesion, onSelectCategory, selectedCategory, onShowAll, showAll, hideHero = false, hideFooter = false, hideProducts = false, children, compact = false }) {
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
              onClick={() => abrirCarrito && abrirCarrito()}
              role="button"
            />
          ) : (
            <h1 onClick={() => abrirCarrito && abrirCarrito()} style={{cursor:'pointer'}}>{store.name}</h1>
          )}

          <nav className="minimal-menu">
            <a href="#" onClick={(e) => { e.preventDefault(); onShowAll ? onShowAll() : (onSelectCategory && onSelectCategory(null)); }}>Ver todo</a>

            <div
              className="minimal-dropdown"
              ref={dropdownRef}
            >
              <a
                href="#"
                className="minimal-dropdown-toggle"
                onClick={(e) => { e.preventDefault(); setMenuOpen(open => !open); }}
              >
                Categorías ▼
              </a>
              {store.categorias && store.categorias.length > 0 && (
                <div className="minimal-dropdown-menu" style={{ display: menuOpen ? 'block' : undefined }}>
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
                <span className="user-info">👤 {consumidor.nombre_usuario}</span>
                <button className="auth-btn" onClick={cerrarSesion}>Cerrar Sesión</button>
              </>
            ) : (
              <button className="auth-btn" onClick={abrirAuth}>Iniciar Sesión</button>
            )}

            <button className="minimal-carrito-nav" onClick={abrirCarrito} title="Ver carrito">
              🛒 {cantidadCarrito > 0 && <span className="nav-badge">{cantidadCarrito}</span>}
            </button>
          </nav>
        </div>
      </header>

      {!hideHero && (
        <section className="minimal-hero">
          <h2>{store.description}</h2>
        </section>
      )}

      {children}

      {!hideProducts && (
        <section className="minimal-list">
          {!selectedCategory && !showAll && <h3 className="minimal-section-title">Nuevos productos</h3>}
          <div className="minimal-products">
            {(showAll ? store.products : store.products.slice(0, 8)).map(p => (
            <div key={p.id} className="minimal-item">
              <div className="minimal-item-image">
                {p.foto ? (
                  <Link to={`/tienda/${store.comercio?.slug || ''}/producto/${p.id}`}>
                    <img src={p.foto} alt={p.name} />
                  </Link>
                ) : (
                  <div className="minimal-placeholder">Sin imagen</div>
                )}
              </div>
              <h4>
                <Link to={`/tienda/${store.comercio?.slug || ''}/producto/${p.id}`} className="minimal-product-link">
                  {p.name}
                </Link>
              </h4>
              {(() => {
                if (p.variantes && p.variantes.length > 0) {
                  const precios = p.variantes.map(v => parseFloat(v.precio)).filter(n => !isNaN(n));
                  if (precios.length === 0) return <p className="minimal-sin-precio">Ver precio en el detalle del producto</p>;
                  const unique = Array.from(new Set(precios.map(n => Number(n))));
                  if (unique.length === 1) {
                    return <p className="minimal-price">${unique[0].toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>;
                  }
                  const min = Math.min(...precios);
                  return <p className="minimal-price">Desde ${min.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>;
                }

                if (p.price && Number(p.price) > 0) {
                  return <p className="minimal-price">${Number(p.price).toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>;
                }

                return <p className="minimal-sin-precio">Ver precio en el detalle del producto</p>;
              })()}
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
          {!hideHero && !showAll && onShowAll && (
          <div style={{ 
            textAlign: 'center', 
            marginTop: '2rem',
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#666'
          }}>
            <a href="#" onClick={(e) => { e.preventDefault(); onShowAll && onShowAll(); }} style={{ color: 'inherit', textDecoration: 'none' }}>Ver todo en productos</a>
          </div>
          )}
        </section>
      )}

      {!hideFooter && (
        <>
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
        </>
      )}
    </div>
  );
}