import { API_BASE_URL, apiUrl } from "../config/api";
import { useState, useEffect, useCallback } from 'react';
import { calcularSubtotal as calcularSubtotalItems, calcularTotal as calcularTotalItems } from '../utils/cartMath';

export default function useCart({ tiendaData, consumidor }) {
  const [carrito, setCarrito] = useState([]);
  const [idCarrito, setIdCarrito] = useState(null);

  const storageKey = tiendaData ? `carrito_${tiendaData.comercio.id_comercio}` : null;

  const normalizeProduct = (p) => {
    if (!p) return { id: null, name: '', foto: null, price: 0 };
    const id = p.id || p.id_producto || null;
    const name = p.name || p.nombre || '';
    let foto = p.foto || null;
    if (foto && !foto.startsWith('http')) foto = `${API_BASE_URL}${foto}`;
    const price = p.price || p.precio || p.effectivePrice || 0;
    return { id, name, foto, price };
  };

  const normalizeVariant = (v) => {
    if (!v) return null;
    const id = v.id_variante || v.id || null;
    // unify characteristic values into { valor }
    const caracteristicas = v.caracteristicas && Array.isArray(v.caracteristicas)
      ? v.caracteristicas.map(c => ({ valor: c.valor || c.nombre_valor || c.nombre || (c.valor_text || '') }))
      : (v.valores && Array.isArray(v.valores)
        ? v.valores.map(val => ({ valor: val.nombre_valor || val.valor || val.nombre || '' }))
        : []);
    let nombre = v.nombre || v.nombre_variante || v.nombre_var || null;
    if (!nombre && caracteristicas.length) nombre = caracteristicas.map(c => c.valor).join(' - ');
    if (!nombre && v.titulo) nombre = v.titulo;
    const precio = v.precio || v.price || null;
    const displayName = nombre || (caracteristicas.length ? caracteristicas.map(c => c.valor).join(' - ') : `Variante ${id || ''}`);
    return { id_variante: id, nombre: nombre || displayName, displayName, caracteristicas, precio, __raw: v };
  };

  const mapBackendItems = useCallback((items = []) => {
    if (!tiendaData) return [];
    return items.map(item => {
      const productoRaw = tiendaData.productos.find(p => p.id_producto === item.id_producto);
      const producto = normalizeProduct(productoRaw);
      const varianteRaw = (item.id_variante != null) ? productoRaw?.variantes?.find(v => (v.id_variante == item.id_variante || v.id == item.id_variante)) : null;
      const variante = normalizeVariant(varianteRaw);
      const variantKeyPart = variante ? (variante.id_variante != null ? String(variante.id_variante) : encodeURIComponent(variante.displayName || JSON.stringify(variante.__raw || '')) ) : '';
      return {
        key: variantKeyPart ? `${item.id_producto}-${variantKeyPart}` : `${item.id_producto}`,
        id_carrito: item.id_carrito,
        id_producto: item.id_producto,
        id_variante: item.id_variante,
        producto,
        variante,
        cantidad: item.cantidad,
        precio: parseFloat(item.precio_actual || item.precio || producto.price || 0)
      };
    });
  }, [tiendaData]);

  // Load cart from backend (if consumidor) or localStorage
  useEffect(() => {
    if (!tiendaData) return;

    const cargar = async () => {
      if (!consumidor) {
        try {
          const raw = storageKey ? localStorage.getItem(storageKey) : null;
          if (raw) setCarrito(JSON.parse(raw));
        } catch (e) { console.error('Error reading local cart', e); }
        return;
      }

      try {
        const res = await fetch(apiUrl(`/api/carrito?id_consumidor=${consumidor.id_consumidor}&id_comercio=${tiendaData.comercio.id_comercio}`));
        if (res.ok) {
          const data = await res.json();
          setIdCarrito(data.carrito?.id_carrito || null);
          setCarrito(mapBackendItems(data.items || []));
        }
      } catch (e) { console.error('Error loading backend cart', e); }
    };

    cargar();
  }, [tiendaData, consumidor, storageKey, mapBackendItems]);

  const persistLocal = useCallback((next) => {
    if (!tiendaData) return;
    try { if (!consumidor && storageKey) localStorage.setItem(storageKey, JSON.stringify(next)); } catch (e) {}
  }, [tiendaData, consumidor, storageKey]);

  const agregarAlCarrito = async (producto, variante = null) => {
    const p = normalizeProduct(producto);
    const v = normalizeVariant(variante);

    const variantesProducto = Array.isArray(producto?.variantes) ? producto.variantes : [];
    if (!v && variantesProducto.length > 0) {
      // Guard clause: products with variants must always be added with a selected variant.
      console.warn('Se intentó agregar un producto con variantes sin seleccionar variante', {
        id_producto: p.id,
        variantes: variantesProducto.length,
      });
      alert('Este producto tiene variantes. Seleccioná una variante antes de agregar al carrito.');
      return;
    }

    const variantKeyPart = v ? (v.id_variante != null ? String(v.id_variante) : encodeURIComponent(v.displayName || JSON.stringify(v.__raw || ''))) : '';
    const itemKey = variantKeyPart ? `${p.id}-${variantKeyPart}` : `${p.id}`;

    setCarrito(prev => {
      const existente = prev.find(i => i.key === itemKey);
      let next;
      const price = (v && v.precio != null) ? parseFloat(v.precio) : (p.price || 0);
      if (existente) {
        next = prev.map(i => i.key === itemKey ? { ...i, cantidad: i.cantidad + 1 } : i);
      } else {
        next = [...prev, { key: itemKey, producto: p, variante: v, cantidad: 1, precio: price }];
      }
      persistLocal(next);
      return next;
    });

    if (consumidor && tiendaData) {
      try {
        await fetch(apiUrl("/api/carrito/agregar"), {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_consumidor: consumidor.id_consumidor, id_comercio: tiendaData.comercio.id_comercio, id_producto: p.id, id_variante: v?.id_variante || null, cantidad: 1 })
        });
        // refresh backend cart
        const r = await fetch(apiUrl(`/api/carrito?id_consumidor=${consumidor.id_consumidor}&id_comercio=${tiendaData.comercio.id_comercio}`));
        if (r.ok) { const data = await r.json(); setIdCarrito(data.carrito?.id_carrito || null); setCarrito(mapBackendItems(data.items || [])); try { if (storageKey) localStorage.removeItem(storageKey); } catch {} }
      } catch (e) { console.error('Error syncing add to backend', e); }
    }
  };

  const quitarDelCarrito = async (itemKey) => {
    const item = carrito.find(i => i.key === itemKey);
    setCarrito(prev => {
      const next = prev.filter(i => i.key !== itemKey);
      persistLocal(next);
      return next;
    });

    if (consumidor && item?.id_carrito && item?.id_producto) {
      try {
        const q = new URLSearchParams({ id_carrito: String(item.id_carrito), id_producto: String(item.id_producto) });
        if (item.id_variante != null) q.append('id_variante', String(item.id_variante));
        await fetch(apiUrl(`/api/carrito/eliminar?${q.toString()}`), { method: 'DELETE' });
        const r = await fetch(apiUrl(`/api/carrito?id_consumidor=${consumidor.id_consumidor}&id_comercio=${tiendaData.comercio.id_comercio}`));
        if (r.ok) { const data = await r.json(); setIdCarrito(data.carrito?.id_carrito || null); setCarrito(mapBackendItems(data.items || [])); }
      } catch (e) { console.error('Error syncing remove to backend', e); }
    }
  };

  const actualizarCantidad = async (itemKey, nuevaCantidad) => {
    if (nuevaCantidad <= 0) { quitarDelCarrito(itemKey); return; }
    const item = carrito.find(i => i.key === itemKey);
    setCarrito(prev => {
      const next = prev.map(i => i.key === itemKey ? { ...i, cantidad: nuevaCantidad } : i);
      persistLocal(next);
      return next;
    });

    if (consumidor && item?.id_carrito && item?.id_producto) {
      try {
        await fetch(apiUrl("/api/carrito/actualizar"), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id_carrito: item.id_carrito, id_producto: item.id_producto, id_variante: item.id_variante || null, cantidad: nuevaCantidad }) });
        const r = await fetch(apiUrl(`/api/carrito?id_consumidor=${consumidor.id_consumidor}&id_comercio=${tiendaData.comercio.id_comercio}`));
        if (r.ok) { const data = await r.json(); setIdCarrito(data.carrito?.id_carrito || null); setCarrito(mapBackendItems(data.items || [])); }
      } catch (e) { console.error('Error syncing update to backend', e); }
    }
  };

  const vaciarCarrito = async () => {
    setCarrito([]);
    try { if (!consumidor && storageKey) localStorage.removeItem(storageKey); } catch (e) {}
    if (consumidor && idCarrito) {
      try { await fetch(apiUrl(`/api/carrito/vaciar/${idCarrito}`), { method: 'DELETE' }); const r = await fetch(apiUrl(`/api/carrito?id_consumidor=${consumidor.id_consumidor}&id_comercio=${tiendaData.comercio.id_comercio}`)); if (r.ok) { const data = await r.json(); setIdCarrito(data.carrito?.id_carrito || null); setCarrito(mapBackendItems(data.items || [])); } } catch (e) { console.error('Error vaciando backend cart', e); }
    }
  };

  const calcularSubtotal = () => calcularSubtotalItems(carrito);
  const calcularTotal = () => calcularTotalItems(carrito);
  const cantidadTotalItems = carrito.reduce((t,i) => t + i.cantidad, 0);

  const syncOnLogin = async (consumidorData) => {
    if (!tiendaData) return;
    try {
      // migrate local items
      const localRaw = storageKey ? localStorage.getItem(storageKey) : null;
      if (localRaw) {
        const items = JSON.parse(localRaw).map(item => ({ id_producto: item.producto.id, id_variante: item.variante?.id_variante || item.variante?.id || null, cantidad: item.cantidad }));
        if (items.length) {
          await fetch(apiUrl("/api/consumidor/migrar-carrito"), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id_consumidor: consumidorData.id_consumidor, id_comercio: tiendaData.comercio.id_comercio, items }) });
          try { if (storageKey) localStorage.removeItem(storageKey); } catch {}
        }
      }
      // fetch backend cart
      const r = await fetch(apiUrl(`/api/carrito?id_consumidor=${consumidorData.id_consumidor}&id_comercio=${tiendaData.comercio.id_comercio}`));
      if (r.ok) { const data = await r.json(); setIdCarrito(data.carrito?.id_carrito || null); setCarrito(mapBackendItems(data.items || [])); }
    } catch (e) { console.error('Error syncing on login', e); }
  };

  return {
    carrito,
    idCarrito,
    agregarAlCarrito,
    quitarDelCarrito,
    actualizarCantidad,
    vaciarCarrito,
    calcularSubtotal,
    calcularTotal,
    cantidadTotalItems,
    setCarrito,
    setIdCarrito,
    syncOnLogin
  };
}
