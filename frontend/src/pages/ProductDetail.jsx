import { API_BASE_URL, apiUrl } from "../config/api";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AuthModal from "../components/AuthModal";
import CartModal from "../components/CartModal";
import TemplateMinimal from "../templates/Minimal/TemplateMinimal";
import TemplateColorful from "../templates/Colorful/TemplateColorful";
import TemplateModern from "../templates/Modern/TemplateModern";
import "../styles/tienda-publica.css";
import "../styles/product-detail.css";
import useCart from "../hooks/useCart";
import { getConsumidorSession, clearConsumidorSession } from "../utils/consumidorSession";
import { setDocumentBranding } from "../utils/branding";

export default function ProductDetail() {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tiendaData, setTiendaData] = useState(null);
  const [producto, setProducto] = useState(null);
  const [caracteristicasProducto, setCaracteristicasProducto] = useState([]);
  const [seleccionValores, setSeleccionValores] = useState({});
  const [imageLoaded, setImageLoaded] = useState(false);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [consumidor, setConsumidor] = useState(null);
  const { carrito, setCarrito, agregarAlCarrito, quitarDelCarrito, actualizarCantidad, vaciarCarrito, calcularSubtotal, calcularTotal, cantidadTotalItems, syncOnLogin } = useCart({ tiendaData, consumidor });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const comercioId = tiendaData?.comercio?.id_comercio;
  const logoComercio = tiendaData?.comercio?.logo
    ? (tiendaData.comercio.logo.startsWith("http")
        ? tiendaData.comercio.logo
        : `${API_BASE_URL}${tiendaData.comercio.logo}`)
    : null;

  useEffect(() => {
    if (!comercioId) {
      setConsumidor(null);
      return;
    }

    try {
      const consumidorGuardado = getConsumidorSession(comercioId);
      setConsumidor(consumidorGuardado || null);
    } catch (e) {
      console.error(e);
      setConsumidor(null);
    }
  }, [comercioId]);

  const handleLogin = async (consumidorData) => {
    setConsumidor(consumidorData);
    if (tiendaData) await syncOnLogin(consumidorData);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const resT = await fetch(apiUrl(`/api/comercio/tienda/${slug}`));
        if (!resT.ok) return setError('Tienda no encontrada');
        const tienda = await resT.json();
        setTiendaData(tienda);

        const resP = await fetch(apiUrl(`/api/productos/${id}`));
        if (!resP.ok) return setError('Producto no encontrado');
        const prod = await resP.json();
        // Normalizar foto (acepta URL absoluta y relativa)
        prod.foto = prod.foto
          ? (prod.foto.startsWith('http') ? prod.foto : `${API_BASE_URL}${prod.foto}`)
          : null;

        // Obtener variantes con sus valores (nombre de cada valor)
        try {
          const resV = await fetch(apiUrl(`/api/productos/${id}/variantes`));
          if (resV.ok) {
            const variantesRaw = await resV.json();
            const variantes = variantesRaw.map(v => {
              // 'valores' viene del backend como array de { id_valor, id_caracteristica, nombre_valor }
              const caracteristicas = (v.valores || []).map(val => ({
                id_caracteristica: val.id_caracteristica,
                id_valor: val.id_valor,
                valor: val.nombre_valor,
              }));
              const nombre = caracteristicas.length > 0 ? caracteristicas.map(c => c.valor).join(' - ') : (`Variante ${v.id_variante}`);
              return {
                ...v,
                nombre,
                caracteristicas
              };
            });
            prod.variantes = variantes;
          }

          const resC = await fetch(apiUrl(`/api/productos/${id}/caracteristicas`));
          if (resC.ok) {
            const caracteristicasRaw = await resC.json();
            const caracteristicasUnicas = Array.isArray(caracteristicasRaw)
              ? caracteristicasRaw.map((carac) => {
                  const seen = new Set();
                  const valoresUnicos = (carac.valores || []).filter((valor) => {
                    const key = String(valor.id_valor ?? valor.nombre_valor ?? '');
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                  });

                  return {
                    ...carac,
                    valores: valoresUnicos,
                  };
                })
              : [];

            setCaracteristicasProducto(caracteristicasUnicas);
          } else {
            setCaracteristicasProducto([]);
          }
        } catch (e) {
          console.error('Error cargando variantes:', e);
          setCaracteristicasProducto([]);
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
    const nombreComercio = tiendaData?.comercio?.nombre_comercio;
    if (nombreComercio) {
      setDocumentBranding({
        title: nombreComercio,
        favicon: logoComercio,
      });
    }
  }, [tiendaData?.comercio?.nombre_comercio, logoComercio]);

  useEffect(() => {
    setImageLoaded(false);
    if (!producto?.foto) return;

    // En navegacion SPA la imagen puede venir del cache y no disparar onLoad siempre.
    const probe = new Image();
    probe.src = producto.foto;

    if (probe.complete) {
      setImageLoaded(true);
      return;
    }

    const handleReady = () => setImageLoaded(true);
    probe.addEventListener('load', handleReady);
    probe.addEventListener('error', handleReady);

    return () => {
      probe.removeEventListener('load', handleReady);
      probe.removeEventListener('error', handleReady);
    };
  }, [producto?.foto]);

  useEffect(() => {
    setSeleccionValores({});
  }, [id]);

  // cart load handled by useCart

  
  if (loading) return (<div className="tienda-loading"><div className="loader"></div><p>Cargando...</p></div>);
  if (error) return (<div className="tienda-error"><h2>{error}</h2><button onClick={() => navigate(-1)}>Volver</button></div>);
  if (!producto || !tiendaData) return null;

  // Construir storeData como en TiendaPublica
  const { comercio } = tiendaData;
  const storeData = {
    name: comercio.nombre_comercio,
    description: comercio.descripcion || "Bienvenido a nuestra tienda",
    logo: comercio.logo ? (comercio.logo.startsWith('http') ? comercio.logo : `${API_BASE_URL}${comercio.logo}`) : null,
    logoSize: 60,
    products: tiendaData.productos.map(p => ({
      id: p.id_producto,
      name: p.nombre,
      price: p.precio || 0,
      code: p.codigo,
      description: p.descripcion,
      foto: p.foto ? `${API_BASE_URL}${p.foto}` : null,
      categorias: p.categorias,
      variantes: p.variantes
    })),
    categorias: tiendaData.categorias,
    comercio
  };

  const tipoDiseño = Number(comercio.tipo_diseño);

  const handleLogout = () => {
    clearConsumidorSession(comercio?.id_comercio);
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
    onShowAll: () => navigate(`/tienda/${slug}/productos`),
    onSelectCategory: (id) => {
      const base = `/tienda/${slug}`;
      if (id == null) navigate(base, { replace: true });
      else navigate(`${base}?cat=${encodeURIComponent(id)}`, { replace: true });
    },
    compact: true
  };

  const addBtnClass = 'detalle-add-btn';

  const backBtnClass = tipoDiseño === 1 ? 'minimal-back-btn' : (tipoDiseño === 2 ? 'colorful-back-btn' : 'modern-back-btn');

  const multipleVariants = producto.variantes && producto.variantes.length > 1;
  const singleVariant = producto.variantes && producto.variantes.length === 1 ? producto.variantes[0] : null;

  const totalCaracteristicas = caracteristicasProducto.length;
  const totalSeleccionadas = Object.keys(seleccionValores).length;
  const seleccionCompleta = totalCaracteristicas > 0 && totalSeleccionadas === totalCaracteristicas;

  const varianteSeleccionada = multipleVariants
    ? producto.variantes.find((v) => {
        const valoresByCarac = new Map((v.valores || []).map((val) => [String(val.id_caracteristica), String(val.id_valor)]));
        return Object.entries(seleccionValores).every(([idCarac, idValor]) => valoresByCarac.get(String(idCarac)) === String(idValor));
      })
    : null;

  const setValorCaracteristica = (idCaracteristica, idValor) => {
    setSeleccionValores((prev) => ({
      ...prev,
      [idCaracteristica]: idValor,
    }));
  };

  const imageThemeClass = tipoDiseño === 1 ? 'minimal' : (tipoDiseño === 2 ? 'colorful' : 'modern');

  const productDetail = (
    <div className="producto-detalle">
      <div className="producto-header">
        <button className={backBtnClass} onClick={() => navigate(-1)}>← Volver</button>
          </div>

      <div className="producto-body">
        <div className={`producto-imagen ${imageThemeClass}`}>
          {producto.foto ? (
            <>
              {!imageLoaded && <div className={`imagen-skeleton ${imageThemeClass}`}></div>}
              <img src={producto.foto} alt={producto.nombre} onLoad={() => setImageLoaded(true)} className={imageLoaded ? 'loaded' : 'loading'} />
            </>
          ) : <div className="sin-imagen">Sin imagen</div>}
        </div>
        <div className="producto-info">
          <h2 className="producto-nombre">{producto.nombre}</h2>
          {singleVariant && (
            <p className="producto-unico">Producto único</p>
          )}
          <p className="producto-codigo">Código: {producto.codigo}</p>
          <p className="producto-descripcion">{producto.descripcion}</p>

          {multipleVariants ? (
            <div className="producto-variantes">
              <h4>Elegi las opciones</h4>

              {caracteristicasProducto.map((carac) => (
                <div key={carac.id_caracteristica} className="carac-selector">
                  <p className="carac-label">{carac.nombre_caracteristica}</p>
                  <div className="carac-options">
                    {(carac.valores || []).map((valor) => {
                      const active = String(seleccionValores[carac.id_caracteristica] || '') === String(valor.id_valor);
                      return (
                        <button
                          key={valor.id_valor}
                          type="button"
                          className={`carac-option-btn ${active ? 'active' : ''}`}
                          onClick={() => setValorCaracteristica(carac.id_caracteristica, valor.id_valor)}
                        >
                          {active ? '✓ ' : ''}{valor.nombre_valor}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {!seleccionCompleta && (
                <p className="variante-hint">Selecciona una opción de cada característica para ver precio y stock.</p>
              )}

              {seleccionCompleta && !varianteSeleccionada && (
                <p className="variante-hint error">No existe esa combinación. Probá con otra selección.</p>
              )}

              {varianteSeleccionada && (
                <div className="variante-item resumen-seleccion">
                  <div>{varianteSeleccionada.nombre || `Variante ${varianteSeleccionada.id_variante}`}</div>
                  <div className="variante-precio">${parseFloat(varianteSeleccionada.precio).toLocaleString('es-AR', {minimumFractionDigits:2, maximumFractionDigits:2})}</div>
                  {Number(varianteSeleccionada.stock) > 0 ? (
                    <button className={addBtnClass} onClick={() => agregarAlCarrito(producto, varianteSeleccionada)}>Agregar al carrito</button>
                  ) : (
                    <button className={`${addBtnClass} disabled`} disabled>No hay stock disponible</button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="producto-precio">
              <h3>${(singleVariant ? parseFloat(singleVariant.precio) : (producto.precio || 0)).toLocaleString('es-AR', {minimumFractionDigits:2, maximumFractionDigits:2})}</h3>
              {singleVariant && Number(singleVariant.stock) <= 0 ? (
                <button className={`${addBtnClass} disabled`} disabled>No hay stock disponible</button>
              ) : (
                <button className={addBtnClass} onClick={() => agregarAlCarrito(producto, singleVariant)}>{singleVariant ? 'Agregar al carrito' : 'Agregar al carrito'}</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  switch (tipoDiseño) {
    case 1:
      return <>
        <TemplateMinimal {...templateProps} hideHero={true} hideProducts={true}>{productDetail}</TemplateMinimal>
        <CartModal
          isOpen={carritoAbierto}
          onClose={() => setCarritoAbierto(false)}
          carrito={carrito}
          cantidadTotalItems={cantidadTotalItems}
          calcularSubtotal={calcularSubtotal}
          calcularTotal={calcularTotal}
          actualizarCantidad={actualizarCantidad}
          quitarDelCarrito={quitarDelCarrito}
          vaciarCarrito={vaciarCarrito}
          tipoDiseño={tipoDiseño}
          onCheckout={() => navigate(`/tienda/${slug}/checkout`)}
        />
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} onLogin={handleLogin} id_comercio={comercio?.id_comercio} />
      </>;
    case 2:
      return <>
        <TemplateColorful {...templateProps} hideHero={true} hideProducts={true}>{productDetail}</TemplateColorful>
        <CartModal
          isOpen={carritoAbierto}
          onClose={() => setCarritoAbierto(false)}
          carrito={carrito}
          cantidadTotalItems={cantidadTotalItems}
          calcularSubtotal={calcularSubtotal}
          calcularTotal={calcularTotal}
          actualizarCantidad={actualizarCantidad}
          quitarDelCarrito={quitarDelCarrito}
          vaciarCarrito={vaciarCarrito}
          tipoDiseño={tipoDiseño}
          onCheckout={() => navigate(`/tienda/${slug}/checkout`)}
        />
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} onLogin={handleLogin} id_comercio={comercio?.id_comercio} />
      </>;
    case 3:
      return <>
        <TemplateModern {...templateProps} hideHero={true} hideProducts={true}>{productDetail}</TemplateModern>
        <CartModal
          isOpen={carritoAbierto}
          onClose={() => setCarritoAbierto(false)}
          carrito={carrito}
          cantidadTotalItems={cantidadTotalItems}
          calcularSubtotal={calcularSubtotal}
          calcularTotal={calcularTotal}
          actualizarCantidad={actualizarCantidad}
          quitarDelCarrito={quitarDelCarrito}
          vaciarCarrito={vaciarCarrito}
          tipoDiseño={tipoDiseño}
          onCheckout={() => navigate(`/tienda/${slug}/checkout`)}
        />
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} onLogin={handleLogin} id_comercio={comercio?.id_comercio} />
      </>;
    default:
      return <>
        <TemplateMinimal {...templateProps} hideHero={true} hideProducts={true}>{productDetail}</TemplateMinimal>
        <CartModal
          isOpen={carritoAbierto}
          onClose={() => setCarritoAbierto(false)}
          carrito={carrito}
          cantidadTotalItems={cantidadTotalItems}
          calcularSubtotal={calcularSubtotal}
          calcularTotal={calcularTotal}
          actualizarCantidad={actualizarCantidad}
          quitarDelCarrito={quitarDelCarrito}
          vaciarCarrito={vaciarCarrito}
          tipoDiseño={tipoDiseño}
          onCheckout={() => navigate(`/tienda/${slug}/checkout`)}
        />
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} onLogin={handleLogin} id_comercio={comercio?.id_comercio} />
      </>;
  }
}
