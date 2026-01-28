import "./Modern.css";
export default function TemplateModern({ store, template }) {
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
          <a href="#">Carrito</a>
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
                <p className="modern-card-price">${p.price}</p>
                <button className="modern-card-btn">Agregar al carrito</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="modern-footer">
        <p>© 2024 {store.name}. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
