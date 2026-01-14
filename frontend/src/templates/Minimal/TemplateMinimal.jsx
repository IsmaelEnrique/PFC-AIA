import "./Minimal.css";
export default function TemplateMinimal({ store, template }) {
  return (
    <div className="minimal">
      <header className="minimal-header">
        <h1>{store.name}</h1>
      </header>

      <section className="minimal-about">
        <p>{store.description}</p>
      </section>

      <section className="minimal-list">
        {store.products.map(p => (
          <div key={p.id} className="minimal-item">
            <h3>{p.name}</h3>
            <span>${p.price}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
