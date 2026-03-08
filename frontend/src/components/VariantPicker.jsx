import React, { useEffect, useMemo, useState } from 'react';
import './VariantPicker.css';
import { apiUrl } from '../config/api';

export default function VariantPicker({ isOpen, onClose, product, onSelectVariant, addButtonClass }) {
  const productSafe = product || null;
  const variantes = useMemo(() => {
    return Array.isArray(productSafe?.variantes) ? productSafe.variantes : [];
  }, [productSafe]);
  const [seleccionValores, setSeleccionValores] = useState({});
  const [nombresCaracteristicas, setNombresCaracteristicas] = useState({});

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

  const isSingle = variantes.length === 1;

  const caracteristicas = useMemo(() => {
    const byCarac = new Map();

    variantes.forEach((v) => {
      const vals = Array.isArray(v.valores)
        ? v.valores
        : Array.isArray(v.caracteristicas)
          ? v.caracteristicas
          : [];

      vals.forEach((raw) => {
        const idCaracteristica = String(raw.id_caracteristica ?? raw.id ?? '');
        if (!idCaracteristica) return;

        const nombreCaracteristica = raw.nombre_caracteristica || nombresCaracteristicas[idCaracteristica] || `Caracteristica ${idCaracteristica}`;
        const idValor = String(raw.id_valor ?? `${idCaracteristica}:${raw.nombre_valor || raw.valor || raw.nombre || ''}`);
        const nombreValor = raw.nombre_valor || raw.valor || raw.nombre || '';

        if (!nombreValor) return;

        if (!byCarac.has(idCaracteristica)) {
          byCarac.set(idCaracteristica, {
            id_caracteristica: idCaracteristica,
            nombre_caracteristica: nombreCaracteristica,
            valores: [],
            _seen: new Set(),
          });
        }

        const group = byCarac.get(idCaracteristica);
        if (group._seen.has(idValor)) return;
        group._seen.add(idValor);
        group.valores.push({
          id_valor: idValor,
          nombre_valor: nombreValor,
        });
      });
    });

    return Array.from(byCarac.values()).map((g) => ({
      id_caracteristica: g.id_caracteristica,
      nombre_caracteristica: g.nombre_caracteristica,
      valores: g.valores,
    }));
  }, [variantes, nombresCaracteristicas]);

  useEffect(() => {
    setSeleccionValores({});
  }, [product?.id, product?.id_producto, isOpen]);

  useEffect(() => {
    const idProducto = productSafe?.id || productSafe?.id_producto;
    if (!isOpen || !idProducto) {
      setNombresCaracteristicas({});
      return;
    }

    const fetchNombres = async () => {
      try {
        const res = await fetch(apiUrl(`/api/productos/${idProducto}/caracteristicas`));
        if (!res.ok) {
          setNombresCaracteristicas({});
          return;
        }

        const data = await res.json();
        const map = Array.isArray(data)
          ? data.reduce((acc, c) => {
              acc[String(c.id_caracteristica)] = c.nombre_caracteristica;
              return acc;
            }, {})
          : {};

        setNombresCaracteristicas(map);
      } catch {
        setNombresCaracteristicas({});
      }
    };

    fetchNombres();
  }, [isOpen, productSafe?.id, productSafe?.id_producto]);

  const totalCaracteristicas = caracteristicas.length;
  const totalSeleccionadas = Object.keys(seleccionValores).length;
  const seleccionCompleta = totalCaracteristicas > 0 && totalSeleccionadas === totalCaracteristicas;

  const varianteSeleccionada = useMemo(() => {
    if (!seleccionCompleta) return null;

    return variantes.find((v) => {
      const vals = Array.isArray(v.valores)
        ? v.valores
        : Array.isArray(v.caracteristicas)
          ? v.caracteristicas
          : [];

      const valorPorCarac = new Map(
        vals.map((raw) => [
          String(raw.id_caracteristica ?? raw.id ?? ''),
          String(raw.id_valor ?? `${raw.id_caracteristica ?? raw.id}:${raw.nombre_valor || raw.valor || raw.nombre || ''}`),
        ])
      );

      return Object.entries(seleccionValores).every(
        ([idCarac, idValor]) => valorPorCarac.get(String(idCarac)) === String(idValor)
      );
    }) || null;
  }, [seleccionCompleta, seleccionValores, variantes]);

  const setValorCaracteristica = (idCaracteristica, idValor) => {
    setSeleccionValores((prev) => ({
      ...prev,
      [idCaracteristica]: idValor,
    }));
  };

  if (!isOpen || !productSafe) return null;

  return (
    <div className="variantpicker-overlay" onClick={onClose}>
      <div className="variantpicker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="variantpicker-header">
          <h3 style={{ margin: 0 }}>{productSafe.name}</h3>
          <button className="variantpicker-close" onClick={onClose}>✕</button>
        </div>
        <div className="variantpicker-body">
          {variantes.length === 0 && <p>No hay variantes disponibles.</p>}

          {isSingle && variantes[0] && (
            <div className="variantpicker-item">
              <div className="variantpicker-info">
                <div className="variantpicker-name">Producto único</div>
                <div className="variantpicker-price">${(parseFloat(variantes[0].precio) || 0).toLocaleString('es-AR', {minimumFractionDigits:2, maximumFractionDigits:2})}</div>
              </div>
              <div>
                {Number(variantes[0].stock) > 0 ? (
                  <button className={addButtonClass || "variantpicker-add"} onClick={() => { onSelectVariant(productSafe, variantes[0]); onClose(); }}>Agregar</button>
                ) : (
                  <button className={`${addButtonClass || "variantpicker-add"} disabled`} disabled>No hay stock disponible</button>
                )}
              </div>
            </div>
          )}

          {!isSingle && caracteristicas.map((carac) => (
            <div key={carac.id_caracteristica} className="variantpicker-selector">
              <p className="variantpicker-selector-label">{carac.nombre_caracteristica}</p>
              <div className="variantpicker-selector-options">
                {carac.valores.map((valor) => {
                  const active = String(seleccionValores[carac.id_caracteristica] || '') === String(valor.id_valor);
                  return (
                    <button
                      key={`${carac.id_caracteristica}-${valor.id_valor}`}
                      type="button"
                      className={`variantpicker-option-btn ${active ? 'active' : ''}`}
                      onClick={() => setValorCaracteristica(carac.id_caracteristica, valor.id_valor)}
                    >
                      {active ? '✓ ' : ''}{valor.nombre_valor}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {!isSingle && !seleccionCompleta && variantes.length > 0 && (
            <p className="variantpicker-hint">Selecciona una opción de cada característica.</p>
          )}

          {!isSingle && seleccionCompleta && !varianteSeleccionada && (
            <p className="variantpicker-hint error">No existe esa combinación.</p>
          )}

          {!isSingle && varianteSeleccionada && (
            <div className="variantpicker-item">
              <div className="variantpicker-info">
                <div className="variantpicker-name">{variantDisplayName(varianteSeleccionada)}</div>
                <div className="variantpicker-price">${(parseFloat(varianteSeleccionada.precio) || 0).toLocaleString('es-AR', {minimumFractionDigits:2, maximumFractionDigits:2})}</div>
              </div>
              <div>
                {Number(varianteSeleccionada.stock) > 0 ? (
                  <button className={addButtonClass || "variantpicker-add"} onClick={() => { onSelectVariant(productSafe, varianteSeleccionada); onClose(); }}>Agregar</button>
                ) : (
                  <button className={`${addButtonClass || "variantpicker-add"} disabled`} disabled>No hay stock disponible</button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
