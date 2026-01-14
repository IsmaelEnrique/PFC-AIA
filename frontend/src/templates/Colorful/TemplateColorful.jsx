import "./Colorful.css";
export default function TemplateColorful({ store, template }) {
  return (
    <div className="colorful">
      <header className="colorful-hero">
        <h1>{store.name}</h1>
        <p>{store.description}</p>
        <button>OFERTAS 🔥</button>
      </header>

      <section className="colorful-carousel">
        {store.products.map(p => (
          <div key={p.id} className="colorful-slide">
            <div className="img" />
            <h3>{p.name}</h3>
            <span>${p.price}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
