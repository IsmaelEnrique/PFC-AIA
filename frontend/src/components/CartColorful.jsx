import React from "react";
import { useCart } from "../context/CartContext";
import "../styles/preview.css";

export default function CartColorful() {
  const { items, addItem, removeItem, updateQuantity, clearCart } = useCart();

  const total = items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  return (
    <div className="cart-colorful" style={{ background: "#f7e8ff", borderRadius: 16, padding: 24, boxShadow: "0 4px 24px #c7a6e6" }}>
      <h2 style={{ color: "#a259ff", marginBottom: 16 }}>🛒 Tu Carrito</h2>
      {items.length === 0 ? (
        <p style={{ color: "#a259ff" }}>¡El carrito está vacío!</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {items.map((item) => (
            <li key={item.id} style={{ display: "flex", alignItems: "center", marginBottom: 12, background: "#fff", borderRadius: 8, padding: 12, boxShadow: "0 2px 8px #e0c3fc" }}>
              <img src={item.imagen} alt={item.nombre} style={{ width: 48, height: 48, borderRadius: 8, marginRight: 16, objectFit: "cover" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: "#a259ff" }}>{item.nombre}</div>
                <div style={{ color: "#6c3483" }}>${item.precio} x {item.cantidad}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <button onClick={() => updateQuantity(item.id, Math.max(1, item.cantidad - 1))} style={{ background: "#a259ff", color: "#fff", border: "none", borderRadius: 4, width: 24, height: 24, fontWeight: 700 }}>-</button>
                  <span style={{ minWidth: 24, textAlign: "center" }}>{item.cantidad}</span>
                  <button onClick={() => updateQuantity(item.id, item.cantidad + 1)} style={{ background: "#a259ff", color: "#fff", border: "none", borderRadius: 4, width: 24, height: 24, fontWeight: 700 }}>+</button>
                  <button onClick={() => removeItem(item.id)} style={{ background: "#ff6f91", color: "#fff", border: "none", borderRadius: 4, marginLeft: 8, padding: "2px 8px" }}>Eliminar</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div style={{ marginTop: 16, fontWeight: 700, color: "#a259ff", fontSize: 18 }}>
        Total: ${total.toFixed(2)}
      </div>
      <button onClick={clearCart} style={{ marginTop: 16, background: "#a259ff", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 700, fontSize: 16, boxShadow: "0 2px 8px #e0c3fc" }}>
        Vaciar carrito
      </button>
    </div>
  );
}
