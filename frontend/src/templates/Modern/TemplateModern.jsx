import React, { useState } from "react";
import "./Modern.css";
import CartModern from "../../components/CartModern";
import { useCart } from "../../context/CartContext";

export default function TemplateModern({ store, template }) {
  const [cartOpen, setCartOpen] = useState(false);
  const { addItem } = useCart();
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
          <button type="button" style={{marginLeft: 18, background: "#3a3a3a", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 700, cursor: "pointer"}} onClick={() => setCartOpen(open => !open)}>
            🛒 Carrito
          </button>
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
                {p.variantes && p.variantes.length > 0 ? (() => {
                  const precios = p.variantes.map(v => parseFloat(v.precio));
                  const precioUnico = precios.every(precio => precio === precios[0]);
                  if (precioUnico) {
                    return <p className="modern-card-price">${precios[0].toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>;
                  } else {
                    const precioMin = Math.min(...precios);
                    return <p className="modern-card-price">Desde ${precioMin.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>;
                  }
                })() : (
                  <p className="modern-sin-precio">Consultar precio</p>
                )}
                <button className="modern-card-btn" onClick={() => {
                  const precio = p.variantes && p.variantes.length > 0 ? parseFloat(p.variantes[0].precio) : 0;
                  addItem({
                    id: p.id,
                    nombre: p.name || p.nombre,
                    precio: precio,
                    cantidad: 1,
                    imagen: p.foto || p.imagen || ""
                  });
                }}>Agregar al carrito</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Carrito modal moderno */}
      {cartOpen && (
        <div style={{ position: "fixed", top: 90, right: 36, zIndex: 2100 }}>
          <CartModern />
        </div>
      )}

      <footer className="modern-footer">
        <p>© 2024 {store.name}. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
