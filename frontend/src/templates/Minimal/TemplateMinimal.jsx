import "./Minimal.css";
export default function TemplateMinimal({ store, template }) {
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
              <div className="minimal-item-image"></div>
              <h4>{p.name}</h4>
              <p className="minimal-price">${p.price}</p>
              <button className="minimal-item-btn">Conocer más</button>
            </div>
          ))}
        </div>
      </section>

      <footer className="minimal-footer">
        <p>© 2024 {store.name}. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
