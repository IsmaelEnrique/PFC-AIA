import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import TemplateMinimal from "../templates/Minimal/TemplateMinimal";
import TemplateColorful from "../templates/Colorful/TemplateColorful";
import TemplateModern from "../templates/Modern/TemplateModern";
import AuthModal from "../components/AuthModal";
import "../styles/tienda-publica.css";

export default function TiendaPublica() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tiendaData, setTiendaData] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [idCarrito, setIdCarrito] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [consumidor, setConsumidor] = useState(null);

  // Cargar consumidor del localStorage al montar
  useEffect(() => {
    const consumidorGuardado = localStorage.getItem('consumidor');
    if (consumidorGuardado) {
      try {
        setConsumidor(JSON.parse(consumidorGuardado));
      } catch (error) {
        console.error('Error al cargar consumidor:', error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchTienda = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:4000/api/comercio/tienda/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("Tienda no encontrada");
          } else {
            setError("Error al cargar la tienda");
          }
          return;
        }

        const data = await response.json();
        setTiendaData(data);
      } catch (err) {
        console.error("Error:", err);
        setError("No se pudo conectar con el servidor");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchTienda();
    }
  }, [slug]);

  // Cargar carrito desde localStorage (modo invitado) o backend (si hay consumidor)
  useEffect(() => {
    const cargarCarrito = async () => {
      if (!tiendaData) return;

      const carritoKey = `carrito_${tiendaData.comercio.id_comercio}`;

      // Si NO hay consumidor logueado, usar localStorage
      if (!consumidor) {
        const carritoLocal = localStorage.getItem(carritoKey);
        if (carritoLocal) {
          try {
            const carritoGuardado = JSON.parse(carritoLocal);
            setCarrito(carritoGuardado);
          } catch (error) {
            console.error('Error al cargar carrito local:', error);
          }
        }
        return;
      }

      // Si HAY consumidor, cargar desde backend
      try {
        const response = await fetch(
          `http://localhost:4000/api/carrito?id_consumidor=${consumidor.id_consumidor}&id_comercio=${tiendaData.comercio.id_comercio}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setIdCarrito(data.carrito.id_carrito);
          
          // Convertir items del backend al formato del frontend
          const itemsFormateados = data.items.map(item => {
            const producto = tiendaData.productos.find(p => p.id_producto === item.id_producto);
            const variante = item.id_variante 
              ? producto?.variantes.find(v => v.id_variante === item.id_variante)
              : null;

            return {
              key: variante ? `${item.id_producto}-${item.id_variante}` : `${item.id_producto}`,
              id_prod_carrito: item.id_prod_carrito,
              producto: {
                id: producto?.id_producto,
                name: producto?.nombre,
                foto: producto?.foto ? `http://localhost:4000${producto.foto}` : null,
                price: item.precio_variante
              },
              variante: variante ? {
                ...variante,
                caracteristicas: variante.caracteristicas || []
              } : null,
              cantidad: item.cantidad,
              precio: parseFloat(item.precio_actual)
            };
          });

          setCarrito(itemsFormateados);
        }
      } catch (error) {
        console.error('Error al cargar carrito:', error);
      }
    };

    cargarCarrito();
  }, [consumidor, tiendaData]);

  if (loading) {
    return (
      <div className="tienda-loading">
        <div className="loader"></div>
        <p>Cargando tienda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tienda-error">
        <h2>😕 {error}</h2>
        <p>La tienda que buscás no está disponible en este momento.</p>
        <a href="/" className="btn-volver">Volver al inicio</a>
      </div>
    );
  }

  if (!tiendaData) {
    return null;
  }

  const { comercio, categorias, productos } = tiendaData;

  const logoUrl = comercio.logo 
    ? comercio.logo.startsWith('http') 
      ? comercio.logo 
      : `http://localhost:4000${comercio.logo}`
    : null;

  const storeData = {
    name: comercio.nombre_comercio,
    description: comercio.descripcion || "Bienvenido a nuestra tienda",
    logo: logoUrl,
    logoSize: 60,
    products: productos.map(p => ({
      id: p.id_producto,
      name: p.nombre,
      price: p.precio || 0,
      code: p.codigo,
      description: p.descripcion,
      foto: p.foto ? `http://localhost:4000${p.foto}` : null,
      categorias: p.categorias,
      variantes: p.variantes
    })),
    categorias: categorias,
    comercio: comercio
  };

  const tipoDiseño = Number(comercio.tipo_diseño);

  // Manejar login/registro de consumidor
  const handleLogin = async (consumidorData) => {
    setConsumidor(consumidorData);
    
    // Migrar carrito de localStorage a BD
    if (carrito.length > 0 && tiendaData) {
      try {
        const items = carrito.map(item => ({
          id_producto: item.producto.id,
          id_variante: item.variante?.id_variante || null,
          cantidad: item.cantidad
        }));

        const response = await fetch('http://localhost:4000/api/consumidor/migrar-carrito', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_consumidor: consumidorData.id_consumidor,
            id_comercio: comercio.id_comercio,
            items
          })
        });

        if (response.ok) {
          console.log('✅ Carrito migrado exitosamente');
          // Limpiar localStorage
          const carritoKey = `carrito_${comercio.id_comercio}`;
          localStorage.removeItem(carritoKey);
          
          // Recargar carrito desde BD
          window.location.reload();
        }
      } catch (error) {
        console.error('Error al migrar carrito:', error);
      }
    }
  };

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('consumidor');
    setConsumidor(null);
    setCarrito([]);
    window.location.reload();
  };

  // Funciones del carrito
  const agregarAlCarrito = async (producto, variante = null) => {
    const itemKey = variante ? `${producto.id}-${variante.id_variante}` : `${producto.id}`;
    
    // Actualizar estado local
    setCarrito(prev => {
      const existente = prev.find(item => item.key === itemKey);
      
      let nuevoCarrito;
      if (existente) {
        nuevoCarrito = prev.map(item =>
          item.key === itemKey
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      } else {
        nuevoCarrito = [...prev, {
          key: itemKey,
          producto,
          variante,
          cantidad: 1,
          precio: variante ? parseFloat(variante.precio) : (producto.price || 0)
        }];
      }

      // Guardar en localStorage si no hay consumidor
      if (!consumidor && tiendaData) {
        const carritoKey = `carrito_${tiendaData.comercio.id_comercio}`;
        localStorage.setItem(carritoKey, JSON.stringify(nuevoCarrito));
      }

      return nuevoCarrito;
    });

    // Si hay consumidor, sincronizar con backend
    if (consumidor && tiendaData) {
      try {
        await fetch('http://localhost:4000/api/carrito/agregar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_consumidor: consumidor.id_consumidor,
            id_comercio: comercio.id_comercio,
            id_producto: producto.id,
            id_variante: variante?.id_variante || null,
            cantidad: 1
          })
        });
      } catch (error) {
        console.error('Error al sincronizar con backend:', error);
      }
    }
  };

  const quitarDelCarrito = async (itemKey) => {
    const item = carrito.find(i => i.key === itemKey);
    
    // Actualizar estado local
    setCarrito(prev => {
      const nuevoCarrito = prev.filter(item => item.key !== itemKey);
      
      // Guardar en localStorage si no hay consumidor
      if (!consumidor && tiendaData) {
        const carritoKey = `carrito_${tiendaData.comercio.id_comercio}`;
        localStorage.setItem(carritoKey, JSON.stringify(nuevoCarrito));
      }
      
      return nuevoCarrito;
    });

    // Si hay consumidor y el item tiene id, sincronizar con backend
    if (consumidor && item?.id_prod_carrito) {
      try {
        await fetch(
          `http://localhost:4000/api/carrito/eliminar/${item.id_prod_carrito}`,
          { method: 'DELETE' }
        );
      } catch (error) {
        console.error('Error al sincronizar con backend:', error);
      }
    }
  };

  const actualizarCantidad = async (itemKey, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      quitarDelCarrito(itemKey);
      return;
    }

    const item = carrito.find(i => i.key === itemKey);
    
    // Actualizar estado local
    setCarrito(prev => {
      const nuevoCarrito = prev.map(item =>
        item.key === itemKey
          ? { ...item, cantidad: nuevaCantidad }
          : item
      );

      // Guardar en localStorage si no hay consumidor
      if (!consumidor && tiendaData) {
        const carritoKey = `carrito_${tiendaData.comercio.id_comercio}`;
        localStorage.setItem(carritoKey, JSON.stringify(nuevoCarrito));
      }

      return nuevoCarrito;
    });

    // Si hay consumidor y el item tiene id, sincronizar con backend
    if (consumidor && item?.id_prod_carrito) {
      try {
        await fetch('http://localhost:4000/api/carrito/actualizar', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_prod_carrito: item.id_prod_carrito,
            cantidad: nuevaCantidad
          })
        });
      } catch (error) {
        console.error('Error al sincronizar con backend:', error);
      }
    }
  };

  const vaciarCarrito = async () => {
    // Actualizar estado local
    setCarrito([]);

    // Limpiar localStorage si no hay consumidor
    if (!consumidor && tiendaData) {
      const carritoKey = `carrito_${tiendaData.comercio.id_comercio}`;
      localStorage.removeItem(carritoKey);
    }

    // Si hay consumidor, sincronizar con backend
    if (consumidor && idCarrito) {
      try {
        await fetch(
          `http://localhost:4000/api/carrito/vaciar/${idCarrito}`,
          { method: 'DELETE' }
        );
      } catch (error) {
        console.error('Error al sincronizar con backend:', error);
      }
    }
  };

  const calcularSubtotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const calcularTotal = () => {
    return calcularSubtotal(); // Por ahora igual al subtotal, luego se pueden agregar impuestos/descuentos
  };

  const cantidadTotalItems = carrito.reduce((total, item) => total + item.cantidad, 0);

  const renderTemplate = () => {
    const templateProps = {
      store: storeData,
      carrito,
      agregarAlCarrito,
      cantidadCarrito: cantidadTotalItems,
      abrirCarrito: () => setCarritoAbierto(true),
      consumidor,
      abrirAuth: () => setAuthModalOpen(true),
      cerrarSesion: handleLogout
    };

    switch (tipoDiseño) {
      case 1:
        return <TemplateMinimal {...templateProps} />;
      case 2:
        return <TemplateColorful {...templateProps} />;
      case 3:
        return <TemplateModern {...templateProps} />;
      default:
        return <TemplateMinimal {...templateProps} />;
    }
  };

  // Determinar clase de tema del carrito según el diseño
  const getCarritoTema = () => {
    switch (tipoDiseño) {
      case 1: return 'carrito-minimal';
      case 2: return 'carrito-colorful';
      case 3: return 'carrito-modern';
      default: return 'carrito-minimal';
    }
  };

  return (
    <div className="tienda-publica">
      {renderTemplate()}
      
      {/* Modal del Carrito */}
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
                              {item.variante.caracteristicas.map(c => c.valor).join(' - ')}
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

      {/* Modal de Autenticación */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        onLogin={handleLogin}
        id_comercio={comercio?.id_comercio}
      />
    </div>
  );
}
