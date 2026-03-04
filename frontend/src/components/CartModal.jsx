import React from 'react';

export default function CartModal({ isOpen, onClose, carrito, cantidadTotalItems, calcularSubtotal, calcularTotal, actualizarCantidad, quitarDelCarrito, vaciarCarrito, tipoDiseño, onCheckout }) {
  if (!isOpen) return null;
  const temaClass = tipoDiseño === 1 ? 'carrito-minimal' : tipoDiseño === 2 ? 'carrito-colorful' : 'carrito-modern';

  return (
    <div className="carrito-modal-overlay" onClick={onClose}>
      <div className={`carrito-modal ${temaClass}`} onClick={(e) => e.stopPropagation()}>
        <div className="carrito-header">
          <h2>🛒 Mi Carrito</h2>
          <button className="carrito-close" onClick={onClose}>✕</button>
        </div>

        <div className="carrito-contenido">
          {carrito.length === 0 ? (
            <div className="carrito-vacio">
              <p>Tu carrito está vacío</p>
              <span style={{ fontSize: '3rem' }}></span>
            </div>
          ) : (
            <>
              <div className="carrito-items">
                {carrito.map(item => (
                  <div key={item.key} className="carrito-item">
                    <div className="carrito-item-imagen">
                      {item.producto.foto ? (
                        <img src={item.producto.foto} alt={item.producto.name} />
                      ) : (
                        <div className="carrito-item-sin-imagen">📦</div>
                      )}
                    </div>

                    <div className="carrito-item-info">
                      <h4>{item.producto.name || (item.producto.nombre)}</h4>
                      {item.variante && (
                        <p className="carrito-item-variante">
                          {item.variante.caracteristicas ? item.variante.caracteristicas.map(c => c.valor).join(' - ') : item.variante.nombre}
                        </p>
                      )}
                      <p className="carrito-item-precio">
                        ${item.precio.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </p>
                    </div>

                    <div className="carrito-item-acciones">
                      <div className="carrito-cantidad-control">
                        <button onClick={() => actualizarCantidad(item.key, item.cantidad - 1)} className="carrito-btn-cantidad">-</button>
                        <span className="carrito-cantidad">{item.cantidad}</span>
                        <button onClick={() => actualizarCantidad(item.key, item.cantidad + 1)} className="carrito-btn-cantidad">+</button>
                      </div>
                      <button onClick={() => quitarDelCarrito(item.key)} className="carrito-btn-eliminar" title="Eliminar del carrito">🗑️</button>
                    </div>

                    <div className="carrito-item-subtotal">
                      ${(item.precio * item.cantidad).toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </div>
                  </div>
                ))}
              </div>

              <div className="carrito-resumen">
                <div className="carrito-resumen-linea">
                  <span>Subtotal ({cantidadTotalItems} {cantidadTotalItems === 1 ? 'producto' : 'productos'})</span>
                  <span className="carrito-precio-subtotal">${calcularSubtotal().toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="carrito-resumen-linea carrito-total">
                  <span>Total</span>
                  <span className="carrito-precio-total">${calcularTotal().toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
              </div>

              <div className="carrito-acciones-footer">
                <button className="carrito-btn-vaciar" onClick={vaciarCarrito}>Vaciar Carrito</button>
                <button className="carrito-btn-finalizar" onClick={onCheckout}>Finalizar Compra</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
