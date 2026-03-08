import { API_BASE_URL, apiUrl } from "../config/api";
import { useState, useEffect } from "react";
import useCart from "../hooks/useCart";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import TemplateMinimal from "../templates/Minimal/TemplateMinimal";
import TemplateColorful from "../templates/Colorful/TemplateColorful";
import TemplateModern from "../templates/Modern/TemplateModern";
import AuthModal from "../components/AuthModal";
import "../styles/tienda-publica.css";
import { getConsumidorSession, clearConsumidorSession } from "../utils/consumidorSession";

export default function TiendaPublica() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tiendaData, setTiendaData] = useState(null);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [consumidor, setConsumidor] = useState(null);
  const { carrito, setCarrito, agregarAlCarrito, quitarDelCarrito, actualizarCantidad, vaciarCarrito, calcularSubtotal, calcularTotal, cantidadTotalItems, syncOnLogin } = useCart({ tiendaData, consumidor });
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const location = useLocation();
  const isFaqPage = location.pathname.endsWith('/preguntas-frecuentes');

  // Initialize category from URL query `?cat=` when visiting main store
  useEffect(() => {
    if (!location) return;
    const params = new URLSearchParams(location.search);
    const cat = params.get('cat');
    if (cat) {
      const parsed = Number(cat);
      setCategoriaSeleccionada(Number.isNaN(parsed) ? cat : parsed);
    } else {
      setCategoriaSeleccionada(null);
    }
  }, [location]);

  const comercioId = tiendaData?.comercio?.id_comercio;

  // Cargar consumidor de la sesion del comercio actual.
  useEffect(() => {
    if (!comercioId) {
      setConsumidor(null);
      return;
    }

    try {
      const consumidorGuardado = getConsumidorSession(comercioId);
      setConsumidor(consumidorGuardado || null);
    } catch (error) {
      console.error('Error al cargar consumidor:', error);
      setConsumidor(null);
    }
  }, [comercioId]);

  useEffect(() => {
    const fetchTienda = async () => {
      try {
        setLoading(true);
        const response = await fetch(apiUrl(`/api/comercio/tienda/${slug}`));
        
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

  // Cart initialization and sync handled by `useCart`

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

  const filteredProducts = categoriaSeleccionada
    ? productos.filter(
        (p) =>
          Array.isArray(p.categorias) &&
          p.categorias.some(
            (c) =>
              String(c.id_categoria ?? c.id ?? c) === String(categoriaSeleccionada)
          )
      )
    : productos;

  const logoUrl = comercio.logo 
    ? comercio.logo.startsWith('http') 
      ? comercio.logo 
      : `${API_BASE_URL}${comercio.logo}`
    : null;

  const bannerUrl = comercio.banner
    ? (comercio.banner.startsWith('http') ? comercio.banner : `${API_BASE_URL}${comercio.banner}`)
    : null;

  const storeData = {
    name: comercio.nombre_comercio,
    description: comercio.descripcion || "Bienvenido a nuestra tienda",
    faqText: comercio.preguntas_frecuentes || "",
    logo: logoUrl,
    banner: bannerUrl,
    logoSize: 60,
    products: filteredProducts.map(p => {
      // Normalizar variantes para asegurar `nombre` y `caracteristicas`
      const variantesNorm = Array.isArray(p.variantes) ? p.variantes.map(v => {
        const caracteristicas = v.caracteristicas && Array.isArray(v.caracteristicas)
          ? v.caracteristicas.map(c => ({ id_caracteristica: c.id_caracteristica || c.id, valor: c.valor || c.nombre_valor || c.nombre || '' }))
          : (v.valores && Array.isArray(v.valores) ? v.valores.map(val => ({ id_caracteristica: val.id_caracteristica || val.id, valor: val.nombre_valor || val.valor || val.nombre || '' })) : []);
        const nombre = v.nombre || v.nombre_variante || (caracteristicas.length ? caracteristicas.map(c => c.valor).join(' - ') : (`Variante ${v.id_variante || v.id || ''}`));
        return { ...v, nombre, caracteristicas };
      }) : [];

      const variantPrices = Array.isArray(p.variantes)
        ? p.variantes.map(v => {
            const n = parseFloat(v.precio);
            return Number.isFinite(n) ? n : null;
          }).filter(x => x != null)
        : [];

      const minVariantPrice = variantPrices.length ? Math.min(...variantPrices) : null;
      const effectivePrice = (p.precio || 0) > 0 ? Number(p.precio) : (minVariantPrice != null ? minVariantPrice : 0);

      return {
        id: p.id_producto,
        name: p.nombre,
        price: p.precio || 0,
        effectivePrice,
        minVariantPrice,
        code: p.codigo,
        description: p.descripcion,
        foto: p.foto ? `${API_BASE_URL}${p.foto}` : null,
        categorias: p.categorias,
        variantes: variantesNorm
      };
    }),
    categorias: categorias,
    comercio: comercio
  };

  const tipoDiseño = Number(comercio.tipo_diseño);

  // Manejar login/registro de consumidor
  const handleLogin = async (consumidorData) => {
    console.log('handleLogin (TiendaPublica) invoked with', consumidorData);
    setConsumidor(consumidorData);
    // Use hook to migrate local cart and fetch backend cart
    if (tiendaData) await syncOnLogin(consumidorData);
  };

  // Cerrar sesión
  const handleLogout = () => {
    clearConsumidorSession(comercio?.id_comercio);
    setConsumidor(null);
    setCarrito([]);
    window.location.reload();
  };

  
  // useCart proporciona las funciones y cálculos del carrito

  const variantLabel = (variante) => {
    if (!variante) return '';
    if (variante.caracteristicas && variante.caracteristicas.length) return variante.caracteristicas.map(c => c.valor).join(' - ');
    if (variante.nombre) return variante.nombre;
    if (variante.nombre_variante) return variante.nombre_variante;
    if (variante.valores && variante.valores.length) return variante.valores.map(v => v.nombre_valor || v.valor || '').filter(Boolean).join(' - ');
    return `Variante ${variante.id_variante || variante.id || ''}`;
  };

  const displayProductName = (item) => {
    const vtext = item.variante ? variantLabel(item.variante) : '';
    let name = item.producto?.name || '';
    const suffix = vtext ? ` — ${vtext}` : '';
    if (suffix && name.endsWith(suffix)) {
      return name.slice(0, -suffix.length);
    }
    return name;
  };

  const renderTemplate = () => {
    const templateProps = {
      store: storeData,
      carrito,
      agregarAlCarrito,
      cantidadCarrito: cantidadTotalItems,
      abrirCarrito: () => setCarritoAbierto(true),
      consumidor,
      abrirAuth: () => setAuthModalOpen(true),
      cerrarSesion: handleLogout,
      onSelectCategory: (id) => { 
        setCategoriaSeleccionada(id);
        // update URL query param so selection is shareable
        const base = `/tienda/${slug}`;
        if (id == null) {
          navigate(base, { replace: true });
        } else {
          navigate(`${base}?cat=${encodeURIComponent(id)}`, { replace: true });
        }
      },
      selectedCategory: categoriaSeleccionada,
      onShowAll: () => navigate(`/tienda/${slug}/productos`),
      showAll: false
    };

    if (isFaqPage) {
      templateProps.onShowAll = () => navigate(`/tienda/${slug}`);
      templateProps.hideHero = true;
      templateProps.hideProducts = true;
      templateProps.children = (
        <section style={{ padding: '32px 20px' }}>
          <div style={{ maxWidth: '980px', margin: '0 auto', background: '#fff', border: '1px solid #eceff3', borderRadius: '14px', padding: '24px' }}>
            <h2 style={{ marginTop: 0, marginBottom: '14px' }}>Preguntas frecuentes</h2>
            {storeData.faqText ? (
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.65, margin: 0 }}>
                {storeData.faqText}
              </p>
            ) : (
              <p style={{ margin: 0, color: '#6b7280' }}>
                Este comercio todavia no cargó información de preguntas frecuentes.
              </p>
            )}
          </div>
        </section>
      );
    }

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
                          <h4>{displayProductName(item)}</h4>
                          {item.variante && (
                            <p className="carrito-item-variante">
                              {variantLabel(item.variante)}
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
                    <button className="carrito-btn-finalizar" onClick={() => navigate(`/tienda/${slug}/checkout`)}>
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
