import "./Modern.css";
import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import VariantPicker from '../../components/VariantPicker';

export default function TemplateModern({ store, agregarAlCarrito, cantidadCarrito, abrirCarrito, consumidor, abrirAuth, cerrarSesion, onSelectCategory, selectedCategory, onShowAll, showAll, hideHero = false, hideFooter = false, hideProducts = false, children, compact = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [variantProduct, setVariantProduct] = useState(null);

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
    <div className="modern">
      <header className="modern-header">
        {store.logo ? (
          <img 
            src={store.logo} 
            alt="Logo" 
            className="modern-logo-img"
            style={{ maxHeight: `${store.logoSize || 50}px` }}
            onClick={() => abrirCarrito && abrirCarrito()}
            role="button"
          />
        ) : (
          <div className="modern-logo" onClick={() => abrirCarrito && abrirCarrito()} style={{cursor:'pointer'}}>{store.name}</div>
        )}
        <nav className="modern-nav">
          <a href="#" onClick={(e) => { e.preventDefault(); onShowAll ? onShowAll() : (onSelectCategory && onSelectCategory(null)); }}>Ver todo</a>
          
          <div
            className="modern-dropdown"
            ref={dropdownRef}
          >
            <a
              href="#"
              className="modern-dropdown-toggle"
              onClick={(e) => { e.preventDefault(); setMenuOpen(open => !open); }}
            >
              Categorías
            </a>
            {store.categorias && store.categorias.length > 0 && (
              <div className="modern-dropdown-menu" style={{ display: menuOpen ? 'block' : undefined }}>
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
          <button className="modern-carrito-nav" onClick={abrirCarrito} title="Ver carrito">
            🛒 {cantidadCarrito > 0 && <span className="nav-badge">{cantidadCarrito}</span>}
          </button>
        </nav>
      </header>

      {!hideHero && (
        <section className="modern-hero">
          <div className="modern-hero-content">
            <h2>{store.description}</h2>
          </div>
          <div className="modern-hero-image"></div>
        </section>
      )}

      {children}

      {!hideProducts && (
        <section className="modern-products">
          {!selectedCategory && !showAll && <h3>Nuevos productos</h3>}
          <div className="modern-grid">
            {(showAll ? store.products : store.products.slice(0, 8)).map(p => (
            <div key={p.id} className="modern-card">
              <div className="modern-card-image">
                {p.foto ? (
                  <Link to={`/tienda/${store.comercio?.slug || ''}/producto/${p.id}`}>
                    <img src={p.foto} alt={p.name} />
                  </Link>
                ) : (
                  <div className="modern-placeholder">Sin imagen</div>
                )}
              </div>
              <div className="modern-card-content">
                <h4>
                  <Link to={`/tienda/${store.comercio?.slug || ''}/producto/${p.id}`} className="modern-product-link">{p.name}</Link>
                </h4>
                {(() => {
                  if (p.variantes && p.variantes.length > 0) {
                    const precios = p.variantes.map(v => parseFloat(v.precio)).filter(n => !isNaN(n));
                    if (precios.length === 0) return <p className="modern-sin-precio">Ver precio en el detalle del producto</p>;
                    const unique = Array.from(new Set(precios.map(n => Number(n))));
                    if (unique.length === 1) return <p className="modern-card-price">${unique[0].toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>;
                    const min = Math.min(...precios);
                    return <p className="modern-card-price">Desde ${min.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>;
                  }

                  if (p.price && Number(p.price) > 0) {
                    return <p className="modern-card-price">${Number(p.price).toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>;
                  }

                  return <p className="modern-sin-precio">Ver precio en el detalle del producto</p>;
                })()}
                <button 
                  className="modern-card-btn"
                  onClick={() => {
                    if (p.variantes && p.variantes.length > 0) {
                      setVariantProduct(p);
                      setVariantModalOpen(true);
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
          <VariantPicker
            isOpen={variantModalOpen}
            onClose={() => setVariantModalOpen(false)}
            product={variantProduct}
            onSelectVariant={(prod, variante) => { agregarAlCarrito(prod, variante); }}
            addButtonClass="modern-card-btn"
          />
          {(!hideHero && !showAll && onShowAll) && (
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
        </>
      )}
    </div>
  );
}