import React from "react";
import { useCart } from "../context/CartContext";

// ...el resto del archivo permanece igual, solo se elimina la declaración duplicada...
export default function ColorfulNavbar({ store, onCartClick }) {
  const { items } = useCart();
  // Si el item no tiene cantidad, se asume 0
  const cantidad = Array.isArray(items)
    ? items.reduce((acc, item) => acc + (typeof item.cantidad === 'number' ? item.cantidad : 0), 0)
    : 0;

  return (
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
        <button
          type="button"
          style={{
            background: "#a259ff",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 16px",
            fontWeight: 700,
            marginLeft: 16,
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer"
          }}
          onClick={onCartClick}
        >
          🛒 Carrito
          <span style={{
            background: "#fff",
            color: "#a259ff",
            borderRadius: "50%",
            padding: "2px 8px",
            marginLeft: 6,
            fontWeight: 700,
            fontSize: 15
          }}>{cantidad}</span>
        </button>
      </nav>
    </header>
  );
}
