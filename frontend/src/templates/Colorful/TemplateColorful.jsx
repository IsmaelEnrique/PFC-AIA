import "./Colorful.css";
import ColorfulNavbar from "../../components/ColorfulNavbar";
import CartColorful from "../../components/CartColorful";
import { useCart } from "../../context/CartContext";
import React, { useState, useContext } from "react";
export default function TemplateColorful({ store, template }) {
  const [cartOpen, setCartOpen] = useState(false);
  const { addItem } = useCart();
  return (
      <div className="colorful">
        {/* HEADER personalizado con carrito */}
        <ColorfulNavbar store={store} onCartClick={() => setCartOpen((open) => !open)} />
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
                  <button
                    className="colorful-slide-btn"
                    onClick={() => {
                      // Asegura que el producto tenga cantidad y precio y nombre correctos
                      const precio = p.variantes && p.variantes.length > 0 ? parseFloat(p.variantes[0].precio) : 0;
                      addItem({
                        id: p.id,
                        nombre: p.name || p.nombre,
                        precio: precio,
                        cantidad: 1,
                        imagen: p.foto || p.imagen || ""
                      });
                    }}
                  >
                    Comprar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CARRITO MODAL */}
        {cartOpen && (
          <div style={{ position: "fixed", top: 100, right: 32, zIndex: 1000 }}>
            <CartColorful />
          </div>
        )}

        <footer className="colorful-footer">
          <p>© 2024 {store.name}. ¡Gracias por tu visita!</p>
        </footer>
      </div>
  );
}
