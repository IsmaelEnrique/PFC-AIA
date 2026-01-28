import "./Colorful.css";
export default function TemplateColorful({ store, template }) {
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
          <a href="#">Productos</a>
          <a href="#">Promociones</a>
          <a href="#">Contacto</a>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section className="colorful-hero">
        <div className="colorful-hero-content">
          <h1>{store.name}</h1>
          <p className="colorful-description">{store.description}</p>
          <button className="colorful-cta">OFERTAS 🔥</button>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="colorful-featured">
        <h2>Nuestras ofertas destacadas</h2>
        <div className="colorful-carousel">
          {store.products.map((p, idx) => (
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
                    const precioMin = Math.min(...precios);
                    return <span className="colorful-price">Desde ${precioMin.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>;
                  }
                })() : (
                  <span className="colorful-sin-precio">Consultar precio</span>
                )}
                <button className="colorful-slide-btn">Comprar</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="colorful-footer">
        <p>© 2024 {store.name}. ¡Gracias por tu visita!</p>
      </footer>
    </div>
  );
}
