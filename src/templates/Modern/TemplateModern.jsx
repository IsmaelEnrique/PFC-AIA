import "./Modern.css";
export default function TemplateModern({ store, template }) {
  return (
    <div className="modern">
      <header className="modern-header">
        <h1>{store.name}</h1>
        <nav>
          <a>Productos</a>
          <a>Contacto</a>
        </nav>
      </header>

      <section className="modern-hero">
        <h2>{store.description}</h2>
        <button>Ver productos</button>
      </section>

      <section className="modern-grid">
        {store.products.map(p => (
          <div key={p.id} className="modern-card">
            <div className="img" />
            <h3>{p.name}</h3>
            <span>${p.price}</span>
            <button>Agregar</button>
          </div>
        ))}
      </section>
    </div>
  );
}
