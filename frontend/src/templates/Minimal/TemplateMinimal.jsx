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
