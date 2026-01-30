import React from "react";
import { useCart } from "../context/CartContext";
import "../styles/preview.css";

export default function CartMinimal() {
  const { items, addItem, removeItem, updateQuantity, clearCart } = useCart();
  const total = items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  return (
    <div className="cart-minimal" style={{ background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 2px 12px #eee", minWidth: 260 }}>
      <h3 style={{ color: "#222", marginBottom: 12 }}>🛒 Carrito</h3>
      {items.length === 0 ? (
        <p style={{ color: "#888" }}>Carrito vacío</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {items.map((item) => (
            <li key={item.id} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
              <img src={item.imagen} alt={item.nombre} style={{ width: 32, height: 32, borderRadius: 6, marginRight: 10, objectFit: "cover" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{item.nombre}</div>
                <div style={{ color: "#555", fontSize: 13 }}>${item.precio} x {item.cantidad}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <button onClick={() => updateQuantity(item.id, Math.max(1, item.cantidad - 1))} style={{ background: "#eee", color: "#222", border: "none", borderRadius: 3, width: 20, height: 20, fontWeight: 700 }}>-</button>
                  <span style={{ minWidth: 20, textAlign: "center" }}>{item.cantidad}</span>
                  <button onClick={() => updateQuantity(item.id, item.cantidad + 1)} style={{ background: "#eee", color: "#222", border: "none", borderRadius: 3, width: 20, height: 20, fontWeight: 700 }}>+</button>
                  <button onClick={() => removeItem(item.id)} style={{ background: "#ffb3b3", color: "#fff", border: "none", borderRadius: 3, marginLeft: 6, padding: "1px 6px", fontSize: 12 }}>Eliminar</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div style={{ marginTop: 10, fontWeight: 600, color: "#222", fontSize: 15 }}>
        Total: ${total.toFixed(2)}
      </div>
      <button onClick={clearCart} style={{ marginTop: 12, background: "#222", color: "#fff", border: "none", borderRadius: 6, padding: "7px 18px", fontWeight: 600, fontSize: 14 }}>
        Vaciar carrito
      </button>
    </div>
  );
}
