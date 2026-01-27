import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AgregarProducto() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idProducto = searchParams.get("id");
  
  const [comercio, setComercio] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    descripcion: "",
    activo: true,
  });

  const [imagen, setImagen] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);

  const [categorias, setCategorias] = useState([]);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);

  const [caracteristicas, setCaracteristicas] = useState([]);
  const [caracteristicasProducto, setCaracteristicasProducto] = useState([]);

  const [variantes, setVariantes] = useState([]);
  const [showVariantes, setShowVariantes] = useState(false);
  const [productoUnico, setProductoUnico] = useState(false);

  const [showCrearCaracteristica, setShowCrearCaracteristica] = useState(false);
  const [nuevaCaracteristica, setNuevaCaracteristica] = useState({ nombre: "", valores: [""] });
  const [valoresNuevosPorCarac, setValoresNuevosPorCarac] = useState({});

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) return;

    const user = JSON.parse(userData);

    fetch(`http://localhost:4000/api/comercio/${user.id_usuario}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.id_comercio) {
          setComercio(data);
        }
      })
      .catch(err => console.error(err));
  }, []);

  // Cargar datos iniciales cuando comercio esté disponible
  useEffect(() => {
    if (!comercio) return;

    // Cargar categorías
    fetch(`http://localhost:4000/api/categorias?id_comercio=${comercio.id_comercio}`)
      .then(r => r.json())
      .then(data => setCategorias(Array.isArray(data) ? data : []))
      .catch(() => {});

    // Cargar características
    fetch(`http://localhost:4000/api/caracteristicas?id_comercio=${comercio.id_comercio}`)
      .then(r => r.json())
      .then(async (data) => {
        console.log("📦 Características recibidas:", data);
        const caracteristicasArray = Array.isArray(data) ? data : [];
        
        // Cargar los valores de cada característica
        const caracteristicasConValores = await Promise.all(
          caracteristicasArray.map(async (carac) => {
            try {
              console.log(`🔍 Cargando valores para característica ${carac.id_caracteristica}...`);
              const valoresRes = await fetch(`http://localhost:4000/api/caracteristicas/valores?id_caracteristica=${carac.id_caracteristica}`);
              console.log(`📡 Status HTTP: ${valoresRes.status} ${valoresRes.statusText}`);
              
              if (!valoresRes.ok) {
                const errorText = await valoresRes.text();
                console.error(`❌ Error HTTP ${valoresRes.status}:`, errorText);
                return { ...carac, valores: [] };
              }
              
              const valores = await valoresRes.json();
              console.log(`✅ Valores recibidos para ${carac.nombre_caracteristica}:`, valores);
              return { ...carac, valores: Array.isArray(valores) ? valores : [] };
            } catch (error) {
              console.error(`❌ Error cargando valores para característica ${carac.id_caracteristica}:`, error);
              return { ...carac, valores: [] };
            }
          })
        );
        
        console.log("🎯 Características finales con valores:", caracteristicasConValores);
        setCaracteristicas(caracteristicasConValores);
      })
      .catch((error) => {
        console.error("❌ Error cargando características:", error);
      });

    // Si es edición, cargar producto
    if (idProducto) {
      fetch(`http://localhost:4000/api/productos/${idProducto}`)
        .then(r => r.json())
        .then(producto => {
          setFormData({
            nombre: producto.nombre,
            codigo: producto.codigo,
            descripcion: producto.descripcion || "",
            activo: producto.activo,
          });
          if (producto.foto) {
            setImagenPreview(`http://localhost:4000${producto.foto}`);
          }
          // Extraer solo los IDs de las categorías
          const categoriasIds = producto.categorias ? producto.categorias.map(c => c.id_categoria) : [];
          setCategoriasSeleccionadas(categoriasIds);
        });

      // Cargar características del producto
      fetch(`http://localhost:4000/api/productos/${idProducto}/caracteristicas`)
        .then(r => r.json())
        .then(data => {
          console.log("📋 Características del producto:", data);
          if (Array.isArray(data) && data.length > 0) {
            const caracProducto = data.map(carac => ({
              id_caracteristica: carac.id_caracteristica,
              valores: carac.valores.map(v => v.id_valor)
            }));
            setCaracteristicasProducto(caracProducto);
          }
        })
        .catch(error => console.error("Error cargando características del producto:", error));

      // Cargar variantes
      fetch(`http://localhost:4000/api/productos/${idProducto}/variantes`)
        .then(r => r.json())
        .then(data => {
          console.log("📦 Variantes recibidas del backend:", data);
          
          if (Array.isArray(data) && data.length > 0) {
            // Mapear las variantes del formato backend al formato frontend
            const variantesMapeadas = data.map(v => {
              // Si valores es null o viene como array de objetos, extraer solo los IDs
              const valoresIds = Array.isArray(v.valores) && v.valores[0] !== null
                ? v.valores.map(val => val.id_valor)
                : [];
              
              return {
                valores: valoresIds,
                precio: v.precio || 0,
                stock: v.stock || 0,
                activo: true,
                esUnico: valoresIds.length === 0 // Si no tiene valores, es producto único
              };
            });
            
            console.log("✅ Variantes mapeadas:", variantesMapeadas);
            setVariantes(variantesMapeadas);
            setProductoUnico(variantesMapeadas.some(v => v.esUnico));
            setShowVariantes(true);
          }
        })
        .catch(error => console.error("Error cargando variantes:", error));
    }
  }, [comercio, idProducto]);

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagen(file);
      setImagenPreview(URL.createObjectURL(file));
    }
  };

  const toggleCategoria = (id) => {
    if (categoriasSeleccionadas.includes(id)) {
      setCategoriasSeleccionadas(categoriasSeleccionadas.filter(c => c !== id));
    } else {
      setCategoriasSeleccionadas([...categoriasSeleccionadas, id]);
    }
  };

  const agregarCaracteristica = () => {
    setCaracteristicasProducto([
      ...caracteristicasProducto,
      { id_caracteristica: "", valores: [] }
    ]);
  };

  const actualizarCaracteristica = (index, id_caracteristica) => {
    // Verificar si la característica ya está seleccionada en otro índice
    const yaExiste = caracteristicasProducto.some((cp, i) => 
      i !== index && cp.id_caracteristica === id_caracteristica
    );

    if (yaExiste) {
      alert("Esta característica ya está agregada al producto");
      return;
    }

    const nuevas = [...caracteristicasProducto];
    nuevas[index] = { id_caracteristica, valores: [] };
    setCaracteristicasProducto(nuevas);
  };

  const crearNuevaCaracteristica = async () => {
    if (!comercio) {
      alert("No tienes comercio creado");
      return;
    }

    if (!nuevaCaracteristica.nombre.trim()) {
      alert("Ingresa el nombre de la característica");
      return;
    }

    const valoresValidos = nuevaCaracteristica.valores.filter(v => v.trim());
    if (valoresValidos.length === 0) {
      alert("Agrega al menos un valor");
      return;
    }

    try {
      // Crear la característica
      const caracResponse = await fetch("http://localhost:4000/api/caracteristicas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_comercio: comercio.id_comercio,
          nombre_caracteristica: nuevaCaracteristica.nombre
        }),
      });

      if (!caracResponse.ok) throw new Error("Error al crear característica");

      const caracCreada = await caracResponse.json();

      // Crear los valores
      const valoresCreados = [];
      for (const valorNombre of valoresValidos) {
        const valorResponse = await fetch("http://localhost:4000/api/caracteristicas/valores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_caracteristica: caracCreada.id_caracteristica,
            nombre_valor: valorNombre
          }),
        });

        if (valorResponse.ok) {
          const valorCreado = await valorResponse.json();
          valoresCreados.push(valorCreado);
        } else {
          console.error("Error al crear valor:", await valorResponse.text());
        }
      }

      // Actualizar la lista de características
      const caracteristicaCompleta = {
        ...caracCreada,
        valores: valoresCreados
      };

      setCaracteristicas([...caracteristicas, caracteristicaCompleta]);
      
      // Resetear y cerrar formulario
      setNuevaCaracteristica({ nombre: "", valores: [""] });
      setShowCrearCaracteristica(false);
      
      alert("Característica creada exitosamente");
    } catch (error) {
      alert("Error al crear característica: " + error.message);
    }
  };

  const agregarValorANuevaCarac = () => {
    setNuevaCaracteristica({
      ...nuevaCaracteristica,
      valores: [...nuevaCaracteristica.valores, ""]
    });
  };

  const actualizarValorNuevaCarac = (index, valor) => {
    const nuevosValores = [...nuevaCaracteristica.valores];
    nuevosValores[index] = valor;
    setNuevaCaracteristica({ ...nuevaCaracteristica, valores: nuevosValores });
  };

  const eliminarValorNuevaCarac = (index) => {
    const nuevosValores = nuevaCaracteristica.valores.filter((_, i) => i !== index);
    setNuevaCaracteristica({ ...nuevaCaracteristica, valores: nuevosValores });
  };

  const agregarValorACaracExistente = (indexCarac) => {
    const nuevosValores = { ...valoresNuevosPorCarac };
    const caracId = caracteristicasProducto[indexCarac].id_caracteristica;
    if (!nuevosValores[caracId]) {
      nuevosValores[caracId] = [""];
    } else {
      nuevosValores[caracId].push("");
    }
    setValoresNuevosPorCarac(nuevosValores);
  };

  const actualizarValorCaracExistente = (caracId, indexValor, valor) => {
    const nuevosValores = { ...valoresNuevosPorCarac };
    nuevosValores[caracId][indexValor] = valor;
    setValoresNuevosPorCarac(nuevosValores);
  };

  const eliminarValorCaracExistente = (caracId, indexValor) => {
    const nuevosValores = { ...valoresNuevosPorCarac };
    nuevosValores[caracId] = nuevosValores[caracId].filter((_, i) => i !== indexValor);
    setValoresNuevosPorCarac(nuevosValores);
  };

  const guardarValoresNuevos = async (indexCarac) => {
    const caracId = caracteristicasProducto[indexCarac].id_caracteristica;
    const valoresNuevos = valoresNuevosPorCarac[caracId] || [];
    const valoresValidos = valoresNuevos.filter(v => v.trim());

    if (valoresValidos.length === 0) {
      alert("Agrega al menos un valor");
      return;
    }

    try {
      const valoresCreados = [];
      for (const valorNombre of valoresValidos) {
        const valorResponse = await fetch("http://localhost:4000/api/caracteristicas/valores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_caracteristica: caracId,
            nombre_valor: valorNombre
          }),
        });

        if (valorResponse.ok) {
          const valorCreado = await valorResponse.json();
          valoresCreados.push(valorCreado);
        }
      }

      // Actualizar la característica en el estado
      const nuevasCaracs = caracteristicas.map(c => {
        if (c.id_caracteristica === caracId) {
          return { ...c, valores: [...c.valores, ...valoresCreados] };
        }
        return c;
      });

      setCaracteristicas(nuevasCaracs);

      // Limpiar valores nuevos
      const nuevosValores = { ...valoresNuevosPorCarac };
      delete nuevosValores[caracId];
      setValoresNuevosPorCarac(nuevosValores);

      alert("Valores agregados exitosamente");
    } catch (error) {
      alert("Error al guardar valores: " + error.message);
    }
  };

  const toggleValor = (indexCarac, idValor) => {
    const nuevas = [...caracteristicasProducto];
    const valores = nuevas[indexCarac].valores;
    
    if (valores.includes(idValor)) {
      nuevas[indexCarac].valores = valores.filter(v => v !== idValor);
    } else {
      nuevas[indexCarac].valores = [...valores, idValor];
    }
    
    setCaracteristicasProducto(nuevas);
  };

  const eliminarCaracteristica = (index) => {
    setCaracteristicasProducto(caracteristicasProducto.filter((_, i) => i !== index));
  };

  const generarVariantes = () => {
    setProductoUnico(false);
    const caracteristicasConValores = caracteristicasProducto.filter(c => c.valores.length > 0);
    
    if (caracteristicasConValores.length === 0) {
      alert("Selecciona al menos una característica con valores");
      return;
    }

    // Generar combinaciones
    const combinaciones = generarCombinaciones(caracteristicasConValores);
    
    const nuevasVariantes = combinaciones.map(combo => ({
      valores: combo,
      precio: 0,
      stock: 0,
      activo: true,
    }));

    setVariantes(nuevasVariantes);
    setShowVariantes(true);
  };

  const generarCombinaciones = (caracteristicasConValores) => {
    if (caracteristicasConValores.length === 0) return [[]];
    
    const [primera, ...resto] = caracteristicasConValores;
    const combinacionesResto = generarCombinaciones(resto);
    
    const resultado = [];
    for (const valor of primera.valores) {
      for (const combo of combinacionesResto) {
        resultado.push([valor, ...combo]);
      }
    }
    
    return resultado;
  };

  const actualizarVariante = (index, campo, valor) => {
    const nuevas = [...variantes];
    nuevas[index][campo] = valor;
    setVariantes(nuevas);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comercio) {
      alert("No tienes comercio creado");
      return;
    }

    if (!formData.nombre.trim() || !formData.codigo.trim()) {
      alert("Nombre y código son obligatorios");
      return;
    }

    setLoading(true);

    try {
      let fotoUrl = null;

      // Subir imagen si hay una nueva
      if (imagen) {
        const formDataImg = new FormData();
        formDataImg.append("imagen", imagen);

        const imgResponse = await fetch("http://localhost:4000/api/upload", {
          method: "POST",
          body: formDataImg,
        });

        if (imgResponse.ok) {
          const imgData = await imgResponse.json();
          fotoUrl = imgData.url;
        } else {
          console.error("Error en upload:", await imgResponse.text());
        }
      }

      // Crear o actualizar producto
      const productoData = {
        ...formData,
        id_comercio: comercio.id_comercio,
        categorias: categoriasSeleccionadas,
        ...(fotoUrl && { foto: fotoUrl }),
      };

      const url = idProducto
        ? `http://localhost:4000/api/productos/${idProducto}`
        : "http://localhost:4000/api/productos";

      const method = idProducto ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productoData),
      });

      if (!response.ok) throw new Error("Error al guardar producto");

      const productoGuardado = await response.json();
      const idProductoFinal = idProducto || productoGuardado.id_producto;

      // Guardar variantes si existen
      if (showVariantes && variantes.length > 0) {
        // Si es edición, primero eliminar variantes anteriores
        if (idProducto) {
          const variantesAnteriores = await fetch(
            `http://localhost:4000/api/productos/${idProductoFinal}/variantes`
          ).then(r => r.json()).catch(() => []);

          for (const varianteAnterior of variantesAnteriores) {
            await fetch(`http://localhost:4000/api/productos/variantes/${varianteAnterior.id_variante}`, {
              method: "DELETE"
            }).catch(err => console.error("Error eliminando variante:", err));
          }
        }

        // Crear las nuevas variantes
        for (const variante of variantes) {
          const varianteData = {
            id_producto: idProductoFinal,
            valores: variante.valores || [],
            precio: parseFloat(variante.precio) || 0,
            stock: parseInt(variante.stock) || 0,
          };

          await fetch(`http://localhost:4000/api/productos/${idProductoFinal}/variantes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(varianteData),
          });
        }
      }

      alert(idProducto ? "Producto actualizado" : "Producto creado");
      navigate("/gestion-productos");

    } catch (error) {
      alert("Error al guardar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getValorNombre = (idValor) => {
    for (const carac of caracteristicas) {
      const valor = carac.valores?.find(v => v.id_valor === idValor);
      if (valor) return valor.nombre_valor;
    }
    return idValor;
  };

  return (
    <section className="panel-page">
      <div className="panel-container">
        <h1 className="panel-title">
          {idProducto ? "Editar" : "Agregar"} <span className="accent">Producto</span>
        </h1>

        <div className="panel-content">
          <button 
            className="btn btn-back" 
            onClick={() => navigate("/gestion-productos")}
          >
            ← Volver
          </button>

          <form onSubmit={handleSubmit}>
            {/* Datos Básicos */}
            <div className="form-section">
              <h2>Datos del producto</h2>
              
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Código *</label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows="3"
                  placeholder="Incluya información detallada sobre el producto: medidas, peso, materiales, características principales y especificaciones técnicas."
                />
              </div>
            </div>

            {/* Imagen */}
            <div className="form-section">
              <h2>Imagen</h2>
              <div className="form-group">
                <input type="file" accept="image/*" onChange={handleImagenChange} />
                {imagenPreview && (
                  <div className="image-preview">
                    <img src={imagenPreview} alt="Preview" />
                  </div>
                )}
              </div>
            </div>

            {/* Categorías */}
            <div className="form-section">
              <h2>Categorías</h2>
              <div className="categorias-grid">
                {categorias.map(cat => (
                  <label key={cat.id_categoria} className="checkbox-card">
                    <input
                      type="checkbox"
                      checked={categoriasSeleccionadas.includes(cat.id_categoria)}
                      onChange={() => toggleCategoria(cat.id_categoria)}
                    />
                    {" "}{cat.nombre_cat}
                  </label>
                ))}
              </div>
            </div>

            {/* Características */}
            <div className="form-section">
              <h2>Características</h2>

              {/* Formulario para crear nueva característica */}
              {showCrearCaracteristica && (
                <div className="crear-caracteristica-form">
                  <h3>Nueva Característica</h3>
                  
                  <div className="form-group">
                    <label>Nombre de la característica *</label>
                    <input
                      type="text"
                      placeholder="Ej: Color, Talla, Material"
                      value={nuevaCaracteristica.nombre}
                      onChange={(e) => setNuevaCaracteristica({ ...nuevaCaracteristica, nombre: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Valores posibles *</label>
                    {nuevaCaracteristica.valores.map((valor, index) => (
                      <div key={index} className="valor-nuevo-item">
                        <input
                          type="text"
                          placeholder={`Valor ${index + 1} (Ej: Rojo, M, Algodón)`}
                          value={valor}
                          onChange={(e) => actualizarValorNuevaCarac(index, e.target.value)}
                          style={{ flex: 1 }}
                        />
                        {nuevaCaracteristica.valores.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-danger btn-small"
                            onClick={() => eliminarValorNuevaCarac(index)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-secondary btn-small"
                      onClick={agregarValorANuevaCarac}
                      style={{ marginTop: "10px" }}
                    >
                      + Agregar Valor
                    </button>
                  </div>

                  <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={crearNuevaCaracteristica}
                    >
                      Guardar Característica
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowCrearCaracteristica(false);
                        setNuevaCaracteristica({ nombre: "", valores: [""] });
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Botón para mostrar formulario */}
              {!showCrearCaracteristica && (
                <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => setShowCrearCaracteristica(true)}
                  >
                    + Nueva Característica
                  </button>
                  <button
                    type="button"
                    className={`btn ${productoUnico ? "btn-primary active" : "btn-primary"}`}
                    onClick={() => {
                      // Producto único sin variantes - permitir ingreso directo de precio y stock
                      setProductoUnico(true);
                      setVariantes([{
                        valores: [],
                        precio: 0,
                        stock: 0,
                        activo: true,
                        esUnico: true
                      }]);
                      setShowVariantes(true);
                    }}
                    style={productoUnico ? {
                      background: "#ffd54f",
                      border: "2px solid #f4b400",
                      color: "#1f1f1f",
                      boxShadow: "0 0 0 3px rgba(244, 180, 0, 0.35)"
                    } : {}}
                  >
                    📦 Producto Único (sin variantes)
                  </button>
                </div>
              )}
              
              {/* Lista de características seleccionadas para el producto */}
              {caracteristicasProducto.map((cp, index) => {
                const caracSeleccionada = caracteristicas.find(c => c.id_caracteristica === cp.id_caracteristica);
                
                return (
                  <div key={index} className="caracteristica-item">
                    <div className="caracteristica-header">
                      <select
                        value={cp.id_caracteristica}
                        onChange={(e) => actualizarCaracteristica(index, parseInt(e.target.value))}
                      >
                        <option value="">Seleccionar característica</option>
                        {caracteristicas.map(c => (
                          <option key={c.id_caracteristica} value={c.id_caracteristica}>
                            {c.nombre_caracteristica}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="btn btn-danger btn-small"
                        onClick={() => eliminarCaracteristica(index)}
                      >
                        Eliminar
                      </button>
                    </div>

                    {caracSeleccionada && (
                      <div>
                        {/* Valores existentes para seleccionar */}
                        <div style={{ marginBottom: "15px" }}>
                          <h4 style={{ margin: "0 0 10px", color: "#667eea", fontSize: "16px" }}>
                            Valores disponibles - Selecciona los que aplican:
                          </h4>
                          {caracSeleccionada.valores && caracSeleccionada.valores.length > 0 ? (
                            <div className="valores-grid">
                              {caracSeleccionada.valores.map(v => (
                                <label key={v.id_valor} className="checkbox-card">
                                  <input
                                    type="checkbox"
                                    checked={cp.valores.includes(v.id_valor)}
                                    onChange={() => toggleValor(index, v.id_valor)}
                                  />
                                  {" "}{v.nombre_valor}
                                </label>
                              ))}
                            </div>
                          ) : (
                            <p style={{ color: "#999", fontStyle: "italic", margin: "10px 0" }}>
                              No hay valores creados aún. Agrega el primero abajo.
                            </p>
                          )}
                        </div>

                        {/* Separador visual */}
                        <hr style={{ margin: "20px 0", border: "none", borderTop: "2px dashed #e0e0e0" }} />

                        {/* Formulario para agregar nuevos valores */}
                        <div>
                          <h4 style={{ margin: "0 0 10px", color: "#ffa726", fontSize: "16px" }}>
                            ¿Necesitas más valores? Agrégalos aquí:
                          </h4>
                          <button
                            type="button"
                            className="btn btn-secondary btn-small"
                            onClick={() => agregarValorACaracExistente(index)}
                          >
                            + Nuevo Valor
                          </button>

                          {valoresNuevosPorCarac[cp.id_caracteristica] && valoresNuevosPorCarac[cp.id_caracteristica].length > 0 && (
                            <div className="valores-nuevos-container" style={{ marginTop: "10px" }}>
                              {valoresNuevosPorCarac[cp.id_caracteristica].map((valor, vIndex) => (
                                <div key={vIndex} className="valor-nuevo-item">
                                  <input
                                    type="text"
                                    placeholder={`Nuevo valor (Ej: Verde, XL)`}
                                    value={valor}
                                    onChange={(e) => actualizarValorCaracExistente(cp.id_caracteristica, vIndex, e.target.value)}
                                    style={{ flex: 1 }}
                                  />
                                  <button
                                    type="button"
                                    className="btn btn-danger btn-small"
                                    onClick={() => eliminarValorCaracExistente(cp.id_caracteristica, vIndex)}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                className="btn btn-success btn-small"
                                onClick={() => guardarValoresNuevos(index)}
                                style={{ marginTop: "10px" }}
                              >
                                💾 Guardar Valores Nuevos
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={agregarCaracteristica}
                >
                  + Agregar Característica al Producto
                </button>

                {caracteristicasProducto.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={generarVariantes}
                  >
                    Generar Variantes
                  </button>
                )}
              </div>
            </div>

            {/* Variantes */}
            {showVariantes && (
              <div className="form-section">
                <h2>
                  {variantes[0]?.esUnico ? "Información del Producto" : `Variantes (${variantes.length})`}
                </h2>
                <div className="variantes-table">
                  <table>
                    <thead>
                      <tr>
                        {!variantes[0]?.esUnico && <th>Combinación</th>}
                        <th>Precio</th>
                        <th>Stock</th>
                        {!variantes[0]?.esUnico && <th>Activo</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {variantes.map((v, index) => (
                        <tr key={index}>
                          {!v.esUnico && (
                            <td>
                              {v.valores.map(idValor => getValorNombre(idValor)).join(" / ")}
                            </td>
                          )}
                          <td>
                            <input
                              type="number"
                              step="0.01"
                              value={v.precio}
                              onChange={(e) => actualizarVariante(index, "precio", e.target.value)}
                              style={{ width: "100px" }}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={v.stock}
                              onChange={(e) => actualizarVariante(index, "stock", e.target.value)}
                              style={{ width: "80px" }}
                            />
                          </td>
                          {!v.esUnico && (
                            <td>
                              <input
                                type="checkbox"
                                checked={v.activo}
                                onChange={(e) => actualizarVariante(index, "activo", e.target.checked)}
                              />
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Guardando..." : (idProducto ? "Actualizar" : "Crear")} Producto
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/gestion-productos")}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .panel-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 20px;
        }

        .panel-container {
          max-width: 1000px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .panel-title {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }

        .panel-title .accent {
          color: #ffd700;
        }

        .panel-content {
          padding: 30px;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s;
          font-size: 14px;
        }

        .btn-back {
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
          margin-bottom: 20px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          font-size: 14px;
        }

        .btn-back:hover {
          background: #667eea;
          color: white;
          transform: translateX(-3px);
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-secondary {
          background: #e0e0e0;
          color: #333;
        }

        .btn-secondary:hover {
          background: #d0d0d0;
        }

        .btn-danger {
          background: #ff6b6b;
          color: white;
        }

        .btn-danger:hover {
          background: #ff5252;
        }

        .btn-success {
          background: #4caf50;
          color: white;
        }

        .btn-success:hover {
          background: #45a049;
        }

        .btn-small {
          padding: 6px 12px;
          font-size: 12px;
        }
        .form-group textarea {
          width: 100%;
          padding: 10px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.3s;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .form-group input[type="file"] {
          padding: 8px;
          border: 2px dashed #e0e0e0;
          border-radius: 6px;
          width: 100%;
        }

        .image-preview {
          margin-top: 15px;
          max-width: 300px;
        }

        .image-preview img {
          width: 100%;
          border-radius: 8px;
          border: 2px solid #e0e0e0;
        }

        .categorias-grid,
        .valores-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 10px;
        }

        .checkbox-card {
          padding: 10px 12px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          font-size: 15px;
          font-weight: 500;
          color: #333;
          user-select: none;
        }

        .checkbox-card:hover {
          border-color: #667eea;
          background: #f5f7ff;
          color: #667eea;
        }

        .checkbox-card input[type="checkbox"] {
          margin-right: 10px;
          cursor: pointer;
          flex-shrink: 0;
        }

        .caracteristica-item {
          margin-bottom: 20px;
          padding: 15px;
          background: #f9f9f9;
          border-radius: 6px;
        }

        .caracteristica-header {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }

        .caracteristica-header select {
          flex: 1;
          padding: 10px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          font-size: 14px;
        }

        .crear-caracteristica-form {
          background: #f0f9ff;
          padding: 20px;
          border-radius: 8px;
          border: 2px solid #667eea;
          margin-bottom: 20px;
        }

        .crear-caracteristica-form h3 {
          margin: 0 0 15px;
          color: #667eea;
          font-size: 18px;
        }

        .valor-nuevo-item {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }

        .valor-nuevo-item input {
          padding: 10px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          font-size: 14px;
        }

        .valor-nuevo-item input:focus {
          outline: none;
          border-color: #667eea;
        }

        .valores-nuevos-container {
          background: #fff9e6;
          padding: 15px;
          border-radius: 6px;
          border: 2px dashed #ffa726;
        }

        .variantes-table {
          overflow-x: auto;
        }

        .variantes-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .variantes-table th,
        .variantes-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e0e0e0;
        }

        .variantes-table th {
          background: #f5f5f5;
          font-weight: 600;
          color: #333;
        }

        .variantes-table input[type="number"] {
          padding: 6px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
        }

        .form-actions {
          margin-top: 30px;
          display: flex;
          gap: 15px;
        }

        @media (max-width: 768px) {
          .categorias-grid,
          .valores-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
