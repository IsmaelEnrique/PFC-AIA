import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import TemplateMinimal from '../templates/Minimal/TemplateMinimal';
import TemplateColorful from '../templates/Colorful/TemplateColorful';
import TemplateModern from '../templates/Modern/TemplateModern';
import AuthModal from '../components/AuthModal';

export default function AllProducts() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tiendaData, setTiendaData] = useState(null);
  const [consumidor, setConsumidor] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [carrito, setCarrito] = useState([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [idCarrito, setIdCarrito] = useState(null);

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize selectedCategory from URL query `?cat=` if present
  useEffect(() => {
    if (!location) return;
    const params = new URLSearchParams(location.search);
    const cat = params.get('cat');
    if (cat) setSelectedCategory(cat);
  }, [location.search]);

  useEffect(() => {
    const consumidorGuardado = localStorage.getItem('consumidor');
    if (consumidorGuardado) {
      try { setConsumidor(JSON.parse(consumidorGuardado)); } catch {};
    }
  }, []);

  // Manejar login/registro de consumidor (similar a TiendaPublica)
  const handleLogin = async (consumidorData) => {
    console.log('handleLogin (AllProducts) invoked with', consumidorData);
    setConsumidor(consumidorData);

    if (tiendaData) {
      try {
        if (carrito.length > 0) {
          const items = carrito.map(item => ({ id_producto: item.producto.id, id_variante: item.variante?.id_variante || null, cantidad: item.cantidad }));
          await fetch('http://localhost:4000/api/consumidor/migrar-carrito', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_consumidor: consumidorData.id_consumidor, id_comercio: tiendaData.comercio.id_comercio, items })
          }).catch(err => console.error('Error migrando carrito:', err));
          try { localStorage.removeItem(`carrito_${tiendaData.comercio.id_comercio}`); } catch {}
        }

        console.log('AllProducts: fetching backend cart for', consumidorData.id_consumidor, tiendaData.comercio.id_comercio);
        // fetch backend cart
        const r = await fetch(`http://localhost:4000/api/carrito?id_consumidor=${consumidorData.id_consumidor}&id_comercio=${tiendaData.comercio.id_comercio}`);
        console.log('AllProducts: carrito response status', r.status);
        if (r.ok) {
          const data = await r.json();
          console.log('AllProducts: carrito data', data);
          setIdCarrito(data.carrito?.id_carrito || null);
          const itemsFormateados = (data.items || []).map(item => {
            const prod = tiendaData.productos.find(p => p.id_producto === item.id_producto);
            const varnt = item.id_variante ? prod?.variantes.find(v => v.id_variante === item.id_variante) : null;
            return {
              key: varnt ? `${item.id_producto}-${item.id_variante}` : `${item.id_producto}`,
              id_carrito: item.id_carrito,
              id_producto: item.id_producto,
              id_variante: item.id_variante,
              producto: { id: prod?.id_producto, name: prod?.nombre, foto: prod?.foto ? `http://localhost:4000${prod.foto}` : null, price: prod?.precio || 0 },
              variante: varnt ? { ...varnt, caracteristicas: varnt.caracteristicas || [] } : null,
              cantidad: item.cantidad,
              precio: parseFloat(item.precio_actual || item.precio || prod?.precio || 0)
            };
          });
          setCarrito(itemsFormateados);
        }
      } catch (err) { console.error('Error al sincronizar carrito tras login', err); }
    }
  };

  // When user (consumidor) logs in, migrate local cart to backend and fetch backend cart
  useEffect(() => {
    if (!consumidor || !tiendaData) return;

    const migrateAndFetch = async () => {
      try {
        // If there is a local cart, migrate it
        const carritoKey = `carrito_${tiendaData.comercio.id_comercio}`;
        const local = localStorage.getItem(carritoKey);
        if (local) {
          const items = JSON.parse(local).map(item => ({
            id_producto: item.producto.id,
            id_variante: item.variante?.id_variante || null,
            cantidad: item.cantidad
          }));

          if (items.length) {
            await fetch('http://localhost:4000/api/consumidor/migrar-carrito', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id_consumidor: consumidor.id_consumidor, id_comercio: tiendaData.comercio.id_comercio, items })
            });
            // clear local copy after migration
            localStorage.removeItem(carritoKey);
          }
        }

        // Fetch backend cart and set local state
        const res = await fetch(`http://localhost:4000/api/carrito?id_consumidor=${consumidor.id_consumidor}&id_comercio=${tiendaData.comercio.id_comercio}`);
        if (res.ok) {
          const data = await res.json();
          setIdCarrito(data.carrito?.id_carrito || null);
          const itemsFormateados = (data.items || []).map(item => {
            const producto = tiendaData.productos.find(p => p.id_producto === item.id_producto);
            const variante = item.id_variante ? producto?.variantes.find(v => v.id_variante === item.id_variante) : null;
            return {
              key: variante ? `${item.id_producto}-${item.id_variante}` : `${item.id_producto}`,
              id_carrito: item.id_carrito,
              id_producto: item.id_producto,
              id_variante: item.id_variante,
              producto: {
                id: producto?.id_producto,
                name: producto?.nombre,
                foto: producto?.foto ? `http://localhost:4000${producto.foto}` : null,
                price: producto?.precio || 0
              },
              variante: variante ? { ...variante, caracteristicas: variante.caracteristicas || [] } : null,
              cantidad: item.cantidad,
              precio: parseFloat(item.precio_actual || item.precio || producto?.precio || 0)
            };
          });
          setCarrito(itemsFormateados);
        }
      } catch (err) {
        console.error('Error migrando/obteniendo carrito:', err);
      }
    };

    migrateAndFetch();
  }, [consumidor, tiendaData]);

  // Cross-tab sync: listen to storage events for carrito changes
  useEffect(() => {
    const handler = (e) => {
      if (!tiendaData) return;
      const key = `carrito_${tiendaData.comercio.id_comercio}`;
      if (e.key === key) {
        try {
          const updated = e.newValue ? JSON.parse(e.newValue) : [];
          setCarrito(updated);
        } catch (err) { /* ignore parse errors */ }
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [tiendaData]);

  useEffect(() => {
    const fetchTienda = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:4000/api/comercio/tienda/${slug}`);
        if (!res.ok) {
          setError('No se pudo cargar la tienda');
          return;
        }
        const data = await res.json();
        setTiendaData(data);
      } catch (err) {
        setError('Error de conexión');
      } finally { setLoading(false); }
    };

    if (slug) fetchTienda();
  }, [slug]);

  // Load carrito from localStorage for this store (guest mode)
  useEffect(() => {
    if (!tiendaData) return;
    const key = `carrito_${tiendaData.comercio.id_comercio}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try { setCarrito(JSON.parse(saved)); } catch (e) { /* ignore */ }
    }
  }, [tiendaData]);

  if (loading) return <div className="tienda-loading"><div className="loader"></div><p>Cargando tienda...</p></div>;
  if (error) return <div className="tienda-error"><h2>😕 {error}</h2></div>;
  if (!tiendaData) return null;

  const { comercio, categorias, productos } = tiendaData;

  const logoUrl = comercio.logo ? (comercio.logo.startsWith('http') ? comercio.logo : `http://localhost:4000${comercio.logo}`) : null;

  const storeData = {
    name: comercio.nombre_comercio,
    description: comercio.descripcion || 'Productos',
    logo: logoUrl,
    logoSize: 60,
    products: productos.map(p => ({
      id: p.id_producto,
      name: p.nombre,
      price: p.precio || 0,
      description: p.descripcion,
      foto: p.foto ? `http://localhost:4000${p.foto}` : null,
      categorias: p.categorias,
      variantes: p.variantes
    })),
    categorias,
    comercio
  };

  const tipoDiseño = Number(comercio.tipo_diseño);


  // include possible created date if present
  const productsWithMeta = storeData.products.map(p => {
    const variantPrices = Array.isArray(p.variantes)
      ? p.variantes.map(v => {
          const n = parseFloat(v.precio);
          return Number.isFinite(n) ? n : null;
        }).filter(x => x != null)
      : [];

    const minVariantPrice = variantPrices.length ? Math.min(...variantPrices) : null;
    const effectivePrice = (p.price || 0) > 0 ? Number(p.price) : (minVariantPrice != null ? minVariantPrice : 0);

    return {
      ...p,
      _created_at: p.created_at || p.fecha_alta || p.fecha || null,
      minVariantPrice,
      effectivePrice
    };
  });

  const processed = productsWithMeta
    .filter(p => {
      // category filter
      if (selectedCategory) {
        if (!p.categorias || !Array.isArray(p.categorias)) return false;
        const found = p.categorias.some(c => c && (c.id_categoria == selectedCategory || c.id == selectedCategory || c == selectedCategory));
        if (!found) return false;
      }
      return p.name.toLowerCase().includes(search.trim().toLowerCase());
    })
    .sort((a, b) => {
      if (sort === 'price_asc') return (a.effectivePrice || 0) - (b.effectivePrice || 0);
      if (sort === 'price_desc') return (b.effectivePrice || 0) - (a.effectivePrice || 0);
      if (sort === 'name_asc') return a.name.localeCompare(b.name);
      if (sort === 'newest') {
        const da = a._created_at ? new Date(a._created_at) : null;
        const db = b._created_at ? new Date(b._created_at) : null;
        if (da && db) return db - da;
        return (b.id || 0) - (a.id || 0);
      }
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
  const pagedProducts = processed.slice((page - 1) * pageSize, page * pageSize);

  const templateProps = {
    store: { ...storeData, products: pagedProducts },
     carrito,
     agregarAlCarrito: (producto, variante = null) => {
       const itemKey = variante ? `${producto.id}-${variante.id_variante || variante.id}` : `${producto.id}`;
       setCarrito(prev => {
         const existente = prev.find(item => item.key === itemKey);
         let nuevoCarrito;
         const precio = variante ? (parseFloat(variante.precio) || 0) : (producto.effectivePrice || producto.price || 0);
         if (existente) {
           nuevoCarrito = prev.map(item => item.key === itemKey ? { ...item, cantidad: item.cantidad + 1 } : item);
         } else {
           nuevoCarrito = [...prev, { key: itemKey, producto: { id: producto.id, name: producto.name, foto: producto.foto, price: producto.price || 0 }, variante: variante ? variante : null, cantidad: 1, precio }];
         }
        try { if (tiendaData) localStorage.setItem(`carrito_${tiendaData.comercio.id_comercio}`, JSON.stringify(nuevoCarrito)); } catch {}

        // If user is logged, sync the add to backend and refresh backend cart
        (async () => {
          try {
            if (consumidor && tiendaData) {
              await fetch('http://localhost:4000/api/carrito/agregar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_consumidor: consumidor.id_consumidor, id_comercio: tiendaData.comercio.id_comercio, id_producto: producto.id, id_variante: variante?.id_variante || null, cantidad: 1 })
              });
              // refresh backend cart
              const r = await fetch(`http://localhost:4000/api/carrito?id_consumidor=${consumidor.id_consumidor}&id_comercio=${tiendaData.comercio.id_comercio}`);
              if (r.ok) {
                const data = await r.json();
                setIdCarrito(data.carrito?.id_carrito || null);
                    const itemsFormateados = (data.items || []).map(item => {
                    const prod = tiendaData.productos.find(p => p.id_producto === item.id_producto);
                    const varnt = item.id_variante ? prod?.variantes.find(v => v.id_variante === item.id_variante) : null;
                    return {
                      key: varnt ? `${item.id_producto}-${item.id_variante}` : `${item.id_producto}`,
                      id_carrito: item.id_carrito,
                      id_producto: item.id_producto,
                      id_variante: item.id_variante,
                      producto: { id: prod?.id_producto, name: prod?.nombre, foto: prod?.foto ? `http://localhost:4000${prod.foto}` : null, price: prod?.precio || 0 },
                      variante: varnt ? { ...varnt, caracteristicas: varnt.caracteristicas || [] } : null,
                      cantidad: item.cantidad,
                      precio: parseFloat(item.precio_actual || item.precio || prod?.precio || 0)
                    };
                  });
                setCarrito(itemsFormateados);
                try { localStorage.removeItem(`carrito_${tiendaData.comercio.id_comercio}`); } catch {}
              }
            }
          } catch (err) { console.error('Error sincronizando add al backend', err); }
        })();

        return nuevoCarrito;
       });
     },
     cantidadCarrito: carrito.reduce((t, i) => t + i.cantidad, 0),
    abrirCarrito: () => setCarritoAbierto(true),
   consumidor,
    abrirAuth: () => setAuthModalOpen(true),
    cerrarSesion: () => {
      try { localStorage.removeItem('consumidor'); } catch {}
      setConsumidor(null);
      setCarrito([]);
      window.location.reload();
    },
    onSelectCategory: (id) => {
      setSelectedCategory(id);
      setPage(1);
      // update URL query
      const base = location.pathname;
      if (id == null) {
        navigate(base, { replace: true });
      } else {
        navigate(`${base}?cat=${encodeURIComponent(id)}`, { replace: true });
      }
    },
    selectedCategory,
    onShowAll: () => { setSelectedCategory(null); setPage(1); navigate(location.pathname, { replace: true }); },
    hideHero: true,
    showAll: true,
    hideFooter: true
  };

  const quitarDelCarrito = (itemKey) => {
    setCarrito(prev => {
      const nuevo = prev.filter(i => i.key !== itemKey);
      try { if (tiendaData) localStorage.setItem(`carrito_${tiendaData.comercio.id_comercio}`, JSON.stringify(nuevo)); } catch {}
      return nuevo;
    });
  };

  // If logged in, remove from backend using composite key
  const quitarDelCarritoBackend = async (itemKey) => {
    const item = carrito.find(i => i.key === itemKey);
    if (consumidor && item && item.id_carrito && item.id_producto) {
      try {
        const q = new URLSearchParams({ id_carrito: String(item.id_carrito), id_producto: String(item.id_producto) });
        if (item.id_variante != null) q.append('id_variante', String(item.id_variante));
        await fetch(`http://localhost:4000/api/carrito/eliminar?${q.toString()}`, { method: 'DELETE' });
        // refresh backend cart
        const r = await fetch(`http://localhost:4000/api/carrito?id_consumidor=${consumidor.id_consumidor}&id_comercio=${tiendaData.comercio.id_comercio}`);
        if (r.ok) {
          const data = await r.json();
          setIdCarrito(data.carrito?.id_carrito || null);
          const itemsFormateados = (data.items || []).map(item => {
            const prod = tiendaData.productos.find(p => p.id_producto === item.id_producto);
            const varnt = item.id_variante ? prod?.variantes.find(v => v.id_variante === item.id_variante) : null;
            return {
              key: varnt ? `${item.id_producto}-${item.id_variante}` : `${item.id_producto}`,
              id_carrito: item.id_carrito,
              id_producto: item.id_producto,
              id_variante: item.id_variante,
              producto: { id: prod?.id_producto, name: prod?.nombre, foto: prod?.foto ? `http://localhost:4000${prod.foto}` : null, price: prod?.precio || 0 },
              variante: varnt ? { ...varnt, caracteristicas: varnt.caracteristicas || [] } : null,
              cantidad: item.cantidad,
              precio: parseFloat(item.precio_actual || item.precio || prod?.precio || 0)
            };
          });
          setCarrito(itemsFormateados);
        }
      } catch (err) { console.error('Error eliminando item backend', err); }
    }
  };

  const actualizarCantidad = (itemKey, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      quitarDelCarrito(itemKey);
      return;
    }
    setCarrito(prev => {
      const nuevo = prev.map(item => item.key === itemKey ? { ...item, cantidad: nuevaCantidad } : item);
      try { if (tiendaData) localStorage.setItem(`carrito_${tiendaData.comercio.id_comercio}`, JSON.stringify(nuevo)); } catch {}
      return nuevo;
    });
  };

  // If logged in and item has backend id, update backend quantity
  const actualizarCantidadBackend = async (itemKey, nuevaCantidad) => {
    const item = carrito.find(i => i.key === itemKey);
    if (!item) return;
    if (consumidor && item.id_carrito && item.id_producto) {
      try {
        await fetch('http://localhost:4000/api/carrito/actualizar', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_carrito: item.id_carrito, id_producto: item.id_producto, id_variante: item.id_variante || null, cantidad: nuevaCantidad })
        });
        // refresh backend cart
        const r = await fetch(`http://localhost:4000/api/carrito?id_consumidor=${consumidor.id_consumidor}&id_comercio=${tiendaData.comercio.id_comercio}`);
        if (r.ok) {
          const data = await r.json();
          setIdCarrito(data.carrito?.id_carrito || null);
          const itemsFormateados = (data.items || []).map(item => {
            const prod = tiendaData.productos.find(p => p.id_producto === item.id_producto);
            const varnt = item.id_variante ? prod?.variantes.find(v => v.id_variante === item.id_variante) : null;
            return {
              key: varnt ? `${item.id_producto}-${item.id_variante}` : `${item.id_producto}`,
              id_carrito: item.id_carrito,
              id_producto: item.id_producto,
              id_variante: item.id_variante,
              producto: { id: prod?.id_producto, name: prod?.nombre, foto: prod?.foto ? `http://localhost:4000${prod.foto}` : null, price: prod?.precio || 0 },
              variante: varnt ? { ...varnt, caracteristicas: varnt.caracteristicas || [] } : null,
              cantidad: item.cantidad,
              precio: parseFloat(item.precio_actual || item.precio || prod?.precio || 0)
            };
          });
          setCarrito(itemsFormateados);
        }
      } catch (err) { console.error('Error actualizando cantidad backend', err); }
    }
  };

  const calcularSubtotal = () => carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  const calcularTotal = () => calcularSubtotal();
  const cantidadTotalItems = carrito.reduce((total, item) => total + item.cantidad, 0);

  const vaciarCarrito = () => {
    setCarrito([]);
    try { if (tiendaData) localStorage.removeItem(`carrito_${tiendaData.comercio.id_comercio}`); } catch {}
  };

  const controlsNode = (
    <div className="controls-wrap">
      <div className="controls-bar">
        <input
          className="control-input"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select className="control-select" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
          <option value="">Ordenar</option>
          <option value="price_asc">Precio: menor a mayor</option>
          <option value="price_desc">Precio: mayor a menor</option>
          <option value="name_asc">Nombre: A → Z</option>
          <option value="newest">Más nuevos</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="tienda-publica">
      {tipoDiseño === 1 && <TemplateMinimal {...templateProps}>{controlsNode}</TemplateMinimal>}
      {tipoDiseño === 2 && <TemplateColorful {...templateProps}>{controlsNode}</TemplateColorful>}
      {tipoDiseño === 3 && <TemplateModern {...templateProps}>{controlsNode}</TemplateModern>}

      <div style={{ maxWidth: 1100, margin: '1.5rem auto', textAlign: 'center' }}>
        <div className="pagination-bar">
          <button className="btn-pager" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</button>
          <span>Página {page} / {totalPages}</span>
          <button className="btn-pager" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Siguiente</button>
        </div>
      </div>

      {/* Render footer after pagination so it's at the bottom of the page */}
      <footer className={tipoDiseño === 1 ? 'minimal-footer' : tipoDiseño === 2 ? 'colorful-footer' : 'modern-footer'} style={{ marginTop: 20 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '12px 16px', textAlign: 'center' }}>
          <p>© 2024 {storeData.name}. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* Floating cart bubble for products page (show even when hideFooter=true) */}
      {(tipoDiseño === 2 || tipoDiseño === 1) && (
        <button
          className={`carrito-flotante ${tipoDiseño === 1 ? 'carrito-flotante-minimal' : 'carrito-flotante-colorful'}`}
          onClick={() => setCarritoAbierto(true)}
        >
          🛒
          {cantidadTotalItems > 0 && <span className="carrito-badge">{cantidadTotalItems}</span>}
        </button>
      )}

      {/* Carrito modal (similar to TiendaPublica) */}
      {carritoAbierto && (
        <div className="carrito-modal-overlay" onClick={() => setCarritoAbierto(false)}>
          <div className={`carrito-modal ${tipoDiseño === 1 ? 'carrito-minimal' : tipoDiseño === 2 ? 'carrito-colorful' : 'carrito-modern'}`} onClick={(e) => e.stopPropagation()}>
            <div className="carrito-header">
              <h2>Mi Carrito</h2>
              <button className="carrito-close" onClick={() => setCarritoAbierto(false)}>✕</button>
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
                          <h4>{item.producto.name}</h4>
                          {item.variante && (
                            <p className="carrito-item-variante">
                              {item.variante.caracteristicas ? item.variante.caracteristicas.map(c => c.valor).join(' - ') : ''}
                            </p>
                          )}
                          <p className="carrito-item-precio">
                            ${item.precio.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </p>
                        </div>

                        <div className="carrito-item-acciones">
                          <div className="carrito-cantidad-control">
                            <button 
                                onClick={() => { actualizarCantidad(item.key, item.cantidad - 1); if (consumidor && item.id_carrito && item.id_producto) actualizarCantidadBackend(item.key, item.cantidad - 1); }}
                                className="carrito-btn-cantidad"
                              >
                              -
                            </button>
                            <span className="carrito-cantidad">{item.cantidad}</span>
                            <button 
                              onClick={() => { actualizarCantidad(item.key, item.cantidad + 1); if (consumidor && item.id_carrito && item.id_producto) actualizarCantidadBackend(item.key, item.cantidad + 1); }}
                              className="carrito-btn-cantidad"
                            >
                              +
                            </button>
                          </div>
                          <button 
                            onClick={() => { quitarDelCarrito(item.key); if (consumidor && item.id_carrito && item.id_producto) quitarDelCarritoBackend(item.key); }}
                            className="carrito-btn-eliminar"
                            title="Eliminar del carrito"
                          >
                            🗑️
                          </button>
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
                      <span className="carrito-precio-subtotal">
                        ${calcularSubtotal().toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </span>
                    </div>
                    <div className="carrito-resumen-linea carrito-total">
                      <span>Total</span>
                      <span className="carrito-precio-total">
                        ${calcularTotal().toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </span>
                    </div>
                  </div>

                  <div className="carrito-acciones-footer">
                    <button className="carrito-btn-vaciar" onClick={vaciarCarrito}>
                      Vaciar Carrito
                    </button>
                    <button className="carrito-btn-finalizar">
                      Finalizar Compra
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} onLogin={handleLogin} id_comercio={comercio?.id_comercio} />
    </div>
  );
}
