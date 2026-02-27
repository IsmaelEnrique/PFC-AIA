import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AuthModal from "../components/AuthModal";
import TemplateMinimal from "../templates/Minimal/TemplateMinimal";
import TemplateColorful from "../templates/Colorful/TemplateColorful";
import TemplateModern from "../templates/Modern/TemplateModern";
import "../styles/tienda-publica.css";
import "../styles/product-detail.css";

export default function ProductDetail() {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tiendaData, setTiendaData] = useState(null);
  const [producto, setProducto] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [idCarrito, setIdCarrito] = useState(null);
  const [consumidor, setConsumidor] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    const consumidorGuardado = localStorage.getItem('consumidor');
    if (consumidorGuardado) {
      try { setConsumidor(JSON.parse(consumidorGuardado)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const resT = await fetch(`http://localhost:4000/api/comercio/tienda/${slug}`);
        if (!resT.ok) return setError('Tienda no encontrada');
        const tienda = await resT.json();
        setTiendaData(tienda);

        const resP = await fetch(`http://localhost:4000/api/productos/${id}`);
        if (!resP.ok) return setError('Producto no encontrado');
        const prod = await resP.json();
        // Normalizar foto
        prod.foto = prod.foto ? `http://localhost:4000${prod.foto}` : null;

        // Obtener variantes con sus valores (nombre de cada valor)
        try {
          const resV = await fetch(`http://localhost:4000/api/productos/${id}/variantes`);
          if (resV.ok) {
            const variantesRaw = await resV.json();
            const variantes = variantesRaw.map(v => {
              // 'valores' viene del backend como array de { id_valor, id_caracteristica, nombre_valor }
              const caracteristicas = (v.valores || []).map(val => ({ id_caracteristica: val.id_caracteristica, valor: val.nombre_valor }));
              const nombre = caracteristicas.length > 0 ? caracteristicas.map(c => c.valor).join(' - ') : (`Variante ${v.id_variante}`);
              return {
                ...v,
                nombre,
                caracteristicas
              };
            });
            prod.variantes = variantes;
          }
        } catch (e) {
          console.error('Error cargando variantes:', e);
        }

        setProducto(prod);
      } catch (err) {
        console.error(err);
        setError('Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    if (slug && id) fetchData();
  }, [slug, id]);

  useEffect(() => {
    if (!tiendaData) return;
    const carritoKey = `carrito_${tiendaData.comercio.id_comercio}`;
    const carritoLocal = localStorage.getItem(carritoKey);
    if (carritoLocal) {
      try { setCarrito(JSON.parse(carritoLocal)); } catch (e) { console.error(e); }
    }
  }, [tiendaData]);

  const agregarAlCarrito = async (producto, variante = null) => {
    const itemKey = variante ? `${producto.id_producto}-${variante.id_variante}` : `${producto.id_producto}`;

    setCarrito(prev => {
      const existente = prev.find(i => i.key === itemKey);
      let nuevo;
      if (existente) {
        nuevo = prev.map(i => i.key === itemKey ? { ...i, cantidad: i.cantidad + 1 } : i);
      } else {
        nuevo = [...prev, {
          key: itemKey,
          producto: { id: producto.id_producto, name: producto.nombre, foto: producto.foto, price: producto.precio || 0 },
          variante,
          cantidad: 1,
          precio: variante ? parseFloat(variante.precio) : (producto.precio || 0)
        }];
      }

      if (!consumidor && tiendaData) {
        const carritoKey = `carrito_${tiendaData.comercio.id_comercio}`;
        localStorage.setItem(carritoKey, JSON.stringify(nuevo));
      }

      return nuevo;
    });

    if (consumidor && tiendaData) {
      try {
        await fetch('http://localhost:4000/api/carrito/agregar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_consumidor: consumidor.id_consumidor,
            id_comercio: tiendaData.comercio.id_comercio,
            id_producto: producto.id_producto,
            id_variante: variante?.id_variante || null,
            cantidad: 1
          })
        });
      } catch (err) { console.error(err); }
    }
  };

  const quitarDelCarrito = async (itemKey) => {
    const item = carrito.find(i => i.key === itemKey);

    setCarrito(prev => {
      const nuevoCarrito = prev.filter(i => i.key !== itemKey);
      if (!consumidor && tiendaData) {
        const carritoKey = `carrito_${tiendaData.comercio.id_comercio}`;
        localStorage.setItem(carritoKey, JSON.stringify(nuevoCarrito));
      }
      return nuevoCarrito;
    });

    if (consumidor && item?.id_prod_carrito) {
      try {
        await fetch(`http://localhost:4000/api/carrito/eliminar/${item.id_prod_carrito}`, { method: 'DELETE' });
      } catch (err) { console.error(err); }
    }
  };

  const actualizarCantidad = async (itemKey, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      quitarDelCarrito(itemKey);
      return;
    }

    const item = carrito.find(i => i.key === itemKey);

    setCarrito(prev => {
      const nuevoCarrito = prev.map(i => i.key === itemKey ? { ...i, cantidad: nuevaCantidad } : i);
      if (!consumidor && tiendaData) {
        const carritoKey = `carrito_${tiendaData.comercio.id_comercio}`;
        localStorage.setItem(carritoKey, JSON.stringify(nuevoCarrito));
      }
      return nuevoCarrito;
    });

    if (consumidor && item?.id_prod_carrito) {
      try {
        await fetch('http://localhost:4000/api/carrito/actualizar', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_prod_carrito: item.id_prod_carrito, cantidad: nuevaCantidad })
        });
      } catch (err) { console.error(err); }
    }
  };

  const vaciarCarrito = async () => {
    setCarrito([]);
    if (!consumidor && tiendaData) {
      const carritoKey = `carrito_${tiendaData.comercio.id_comercio}`;
      localStorage.removeItem(carritoKey);
    }
    if (consumidor && idCarrito) {
      try {
        await fetch(`http://localhost:4000/api/carrito/vaciar/${idCarrito}`, { method: 'DELETE' });
      } catch (err) { console.error(err); }
    }
  };

  const calcularSubtotal = () => carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  const calcularTotal = () => calcularSubtotal();
  if (loading) return (<div className="tienda-loading"><div className="loader"></div><p>Cargando...</p></div>);
  if (error) return (<div className="tienda-error"><h2>😕 {error}</h2><button onClick={() => navigate(-1)}>Volver</button></div>);
  if (!producto || !tiendaData) return null;

  // Construir storeData como en TiendaPublica
  const { comercio } = tiendaData;
  const storeData = {
    name: comercio.nombre_comercio,
    description: comercio.descripcion || "Bienvenido a nuestra tienda",
    logo: comercio.logo ? (comercio.logo.startsWith('http') ? comercio.logo : `http://localhost:4000${comercio.logo}`) : null,
    logoSize: 60,
    products: tiendaData.productos.map(p => ({
      id: p.id_producto,
      name: p.nombre,
      price: p.precio || 0,
      code: p.codigo,
      description: p.descripcion,
      foto: p.foto ? `http://localhost:4000${p.foto}` : null,
      categorias: p.categorias,
      variantes: p.variantes
    })),
    categorias: tiendaData.categorias,
    comercio
  };

  const tipoDiseño = Number(comercio.tipo_diseño);

  const getCarritoTema = () => {
    switch (tipoDiseño) {
      case 1: return 'carrito-minimal';
      case 2: return 'carrito-colorful';
      case 3: return 'carrito-modern';
      default: return 'carrito-minimal';
    }
  };

  const cantidadTotalItems = carrito.reduce((total, item) => total + item.cantidad, 0);

  const handleLogout = () => {
    localStorage.removeItem('consumidor');
    setConsumidor(null);
    setCarrito([]);
    navigate(`/tienda/${slug}`);
  };

  const templateProps = {
    store: storeData,
    carrito,
    agregarAlCarrito,
    cantidadCarrito: cantidadTotalItems,
    abrirCarrito: () => setCarritoAbierto(true),
    consumidor,
    abrirAuth: () => setAuthModalOpen(true),
    cerrarSesion: handleLogout,
    compact: true
  };

  const hasVariants = producto.variantes && producto.variantes.length > 0;
  const multipleVariants = producto.variantes && producto.variantes.length > 1;
  const singleVariant = producto.variantes && producto.variantes.length === 1 ? producto.variantes[0] : null;

  const productDetail = (
    <div className="producto-detalle">
      <div className="producto-header">
            <button className="btn-volver" onClick={() => navigate(-1)}>← Volver</button>
          </div>

      <div className="producto-body">
        <div className="producto-imagen">
          {producto.foto ? <img src={producto.foto} alt={producto.nombre} /> : <div className="sin-imagen">Sin imagen</div>}
        </div>
        <div className="producto-info">
          <h2 className="producto-nombre">{producto.nombre}</h2>
          <p className="producto-codigo">Código: {producto.codigo}</p>
          <p className="producto-descripcion">{producto.descripcion}</p>

          {multipleVariants ? (
            <div className="producto-variantes">
              <h4>Variantes</h4>
              {producto.variantes.map(v => (
                <div key={v.id_variante} className="variante-item">
                  <div>{v.nombre || `Variante ${v.id_variante}`}</div>
                  <div className="variante-precio">${parseFloat(v.precio).toLocaleString('es-AR', {minimumFractionDigits:2, maximumFractionDigits:2})}</div>
                  <button onClick={() => agregarAlCarrito(producto, v)}>Agregar</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="producto-precio">
              <h3>${(singleVariant ? parseFloat(singleVariant.precio) : (producto.precio || 0)).toLocaleString('es-AR', {minimumFractionDigits:2, maximumFractionDigits:2})}</h3>
              <button onClick={() => agregarAlCarrito(producto, singleVariant)}>{singleVariant ? 'Agregar al carrito' : 'Agregar al carrito'}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  switch (tipoDiseño) {
    case 1:
      return <>
        <TemplateMinimal {...templateProps}>{productDetail}</TemplateMinimal>
        {carritoAbierto && (
          <div className="carrito-modal-overlay" onClick={() => setCarritoAbierto(false)}>
            <div className={`carrito-modal ${getCarritoTema()}`} onClick={(e) => e.stopPropagation()}>
              <div className="carrito-header">
                <h2>🛒 Mi Carrito</h2>
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
                                {item.variante.caracteristicas ? item.variante.caracteristicas.map(c => c.valor).join(' - ') : item.variante.nombre}
                              </p>
                            )}
                            <p className="carrito-item-precio">
                              ${item.precio.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </p>
                          </div>

                          <div className="carrito-item-acciones">
                            <div className="carrito-cantidad-control">
                              <button 
                                onClick={() => actualizarCantidad(item.key, item.cantidad - 1)}
                                className="carrito-btn-cantidad"
                              >
                                -
                              </button>
                              <span className="carrito-cantidad">{item.cantidad}</span>
                              <button 
                                onClick={() => actualizarCantidad(item.key, item.cantidad + 1)}
                                className="carrito-btn-cantidad"
                              >
                                +
                              </button>
                            </div>
                            <button 
                              onClick={() => quitarDelCarrito(item.key)}
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
      </>;
    case 2:
      return <>
        <TemplateColorful {...templateProps}>{productDetail}</TemplateColorful>
        {carritoAbierto && (
          <div className="carrito-modal-overlay" onClick={() => setCarritoAbierto(false)}>
            <div className={`carrito-modal ${getCarritoTema()}`} onClick={(e) => e.stopPropagation()}>
              <div className="carrito-header">
                <h2>🛒 Mi Carrito</h2>
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
                                {item.variante.caracteristicas ? item.variante.caracteristicas.map(c => c.valor).join(' - ') : item.variante.nombre}
                              </p>
                            )}
                            <p className="carrito-item-precio">
                              ${item.precio.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </p>
                          </div>

                          <div className="carrito-item-acciones">
                            <div className="carrito-cantidad-control">
                              <button 
                                onClick={() => actualizarCantidad(item.key, item.cantidad - 1)}
                                className="carrito-btn-cantidad"
                              >
                                -
                              </button>
                              <span className="carrito-cantidad">{item.cantidad}</span>
                              <button 
                                onClick={() => actualizarCantidad(item.key, item.cantidad + 1)}
                                className="carrito-btn-cantidad"
                              >
                                +
                              </button>
                            </div>
                            <button 
                              onClick={() => quitarDelCarrito(item.key)}
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
      </>;
    case 3:
      return <>
        <TemplateModern {...templateProps}>{productDetail}</TemplateModern>
        {carritoAbierto && (
          <div className="carrito-modal-overlay" onClick={() => setCarritoAbierto(false)}>
            <div className={`carrito-modal ${getCarritoTema()}`} onClick={(e) => e.stopPropagation()}>
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
                                {item.variante.caracteristicas ? item.variante.caracteristicas.map(c => c.valor).join(' - ') : item.variante.nombre}
                              </p>
                            )}
                            <p className="carrito-item-precio">
                              ${item.precio.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </p>
                          </div>

                          <div className="carrito-item-acciones">
                            <div className="carrito-cantidad-control">
                              <button 
                                onClick={() => actualizarCantidad(item.key, item.cantidad - 1)}
                                className="carrito-btn-cantidad"
                              >
                                -
                              </button>
                              <span className="carrito-cantidad">{item.cantidad}</span>
                              <button 
                                onClick={() => actualizarCantidad(item.key, item.cantidad + 1)}
                                className="carrito-btn-cantidad"
                              >
                                +
                              </button>
                            </div>
                            <button 
                              onClick={() => quitarDelCarrito(item.key)}
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
      </>;
    default:
      return <TemplateMinimal {...templateProps}>{productDetail}</TemplateMinimal>;
  }
}
