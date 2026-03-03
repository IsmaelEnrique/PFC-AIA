import React from 'react';
import './VariantPicker.css';

export default function VariantPicker({ isOpen, onClose, product, onSelectVariant, addButtonClass }) {
  if (!isOpen || !product) return null;

  const variantes = Array.isArray(product.variantes) ? product.variantes : [];

  const variantDisplayName = (v) => {
    if (!v) return '';
    if (v.nombre) return v.nombre;
    if (v.nombre_variante) return v.nombre_variante;
    if (v.caracteristicas && Array.isArray(v.caracteristicas) && v.caracteristicas.length) {
      return v.caracteristicas.map(c => c.valor).join(' - ');
    }
    // older shape: valores -> [{ nombre_valor }]
    if (v.valores && Array.isArray(v.valores) && v.valores.length) {
      return v.valores.map(x => x.nombre_valor || x.valor || '').filter(Boolean).join(' - ');
    }
    return `Variante ${v.id_variante || v.id || ''}`;
  };

  return (
    <div className="variantpicker-overlay" onClick={onClose}>
      <div className="variantpicker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="variantpicker-header">
          <h3>Elige una variante</h3>
          <button className="variantpicker-close" onClick={onClose}>✕</button>
        </div>

        <div className="variantpicker-body">
          <h4 style={{ marginTop: 0 }}>{product.name}</h4>
          {variantes.length === 0 && <p>No hay variantes disponibles.</p>}

          {variantes.map(v => {
            const name = variantDisplayName(v);
            const caracText = v.caracteristicas && Array.isArray(v.caracteristicas) && v.caracteristicas.length
              ? v.caracteristicas.map(c => c.valor).join(' - ')
              : (v.valores && Array.isArray(v.valores) && v.valores.length ? v.valores.map(x => x.nombre_valor || x.valor || '').filter(Boolean).join(' - ') : null);

            return (
              <div key={v.id_variante || v.id} className="variantpicker-item">
                <div className="variantpicker-info">
                  <div className="variantpicker-name">{name}</div>
                  <div className="variantpicker-price">${(parseFloat(v.precio) || 0).toLocaleString('es-AR', {minimumFractionDigits:2, maximumFractionDigits:2})}</div>
                  {caracText && caracText !== name && (
                    <div className="variantpicker-carac">{caracText}</div>
                  )}
                </div>
                <div>
                  <button className={addButtonClass || "variantpicker-add"} onClick={() => { onSelectVariant(product, v); onClose(); }}>Agregar</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
