import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import TemplateMinimal from "../templates/Minimal/TemplateMinimal";
import TemplateColorful from "../templates/Colorful/TemplateColorful";
import TemplateModern from "../templates/Modern/TemplateModern";
import "../styles/tienda-publica.css";

export default function TiendaPublica() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tiendaData, setTiendaData] = useState(null);

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

  const renderTemplate = () => {
    switch (tipoDiseño) {
      case 1:
        return <TemplateMinimal store={storeData} />;
      case 2:
        return <TemplateColorful store={storeData} />;
      case 3:
        return <TemplateModern store={storeData} />;
      default:
        return <TemplateMinimal store={storeData} />;
    }
  };

  return (
    <div className="tienda-publica">
      {renderTemplate()}
    </div>
  );
}
