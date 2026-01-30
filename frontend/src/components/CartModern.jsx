import React from "react";
import { useCart } from "../context/CartContext";
import "../styles/preview.css";

export default function CartModern() {
  const { items, addItem, removeItem, updateQuantity, clearCart } = useCart();
  const total = items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  return (
    <div className="cart-modern" style={{ background: "#fff", borderRadius: 18, padding: 24, boxShadow: "0 6px 32px #e0e0e0", minWidth: 320 }}>
      <h2 style={{ color: "#3a3a3a", marginBottom: 18, fontWeight: 700 }}>🛒 Mi Carrito</h2>
      {items.length === 0 ? (
        <p style={{ color: "#aaa" }}>Tu carrito está vacío</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {items.map((item) => (
            <li key={item.id} style={{ display: "flex", alignItems: "center", marginBottom: 14, background: "#f7f7f7", borderRadius: 10, padding: 10 }}>
              <img src={item.imagen} alt={item.nombre} style={{ width: 44, height: 44, borderRadius: 10, marginRight: 16, objectFit: "cover" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: "#3a3a3a" }}>{item.nombre}</div>
                <div style={{ color: "#666" }}>${item.precio} x {item.cantidad}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                  <button onClick={() => updateQuantity(item.id, Math.max(1, item.cantidad - 1))} style={{ background: "#e0e0e0", color: "#3a3a3a", border: "none", borderRadius: 5, width: 24, height: 24, fontWeight: 700 }}>-</button>
                  <span style={{ minWidth: 24, textAlign: "center" }}>{item.cantidad}</span>
                  <button onClick={() => updateQuantity(item.id, item.cantidad + 1)} style={{ background: "#e0e0e0", color: "#3a3a3a", border: "none", borderRadius: 5, width: 24, height: 24, fontWeight: 700 }}>+</button>
                  <button onClick={() => removeItem(item.id)} style={{ background: "#ff6f91", color: "#fff", border: "none", borderRadius: 5, marginLeft: 10, padding: "2px 10px", fontSize: 13 }}>Eliminar</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div style={{ marginTop: 18, fontWeight: 700, color: "#3a3a3a", fontSize: 20 }}>
        Total: ${total.toFixed(2)}
      </div>
      <button onClick={clearCart} style={{ marginTop: 18, background: "#3a3a3a", color: "#fff", border: "none", borderRadius: 8, padding: "12px 28px", fontWeight: 700, fontSize: 16, boxShadow: "0 2px 8px #e0e0e0" }}>
        Vaciar carrito
      </button>
    </div>
  );
}
