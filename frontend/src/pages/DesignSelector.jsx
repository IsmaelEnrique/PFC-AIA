import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// 1. Importación de tus plantillas reales
import Minimal from '../templates/Minimal/TemplateMinimal';
import Colorful from '../templates/Colorful/TemplateColorful';
import Model from '../templates/Modern/TemplateModern';
// 2. Importación de los componentes Preview (miniaturas)
import PreviewMinimal from '../previews/PreviewMinimal';
import PreviewColorful from '../previews/PreviewColorful';
import PreviewModern from '../previews/PreviewModern';
// 3. Importación de estilos
import '../styles/design-selector.css';

const DesignSelector = ({ proyectoId, storeLogo }) => {
  const navigate = useNavigate();
  // Estados para manejar la previsualización y la carga
  const [previewing, setPreviewing] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch (err) {
      return null;
    }
  }, []);

  // Obtener el logo del localStorage si no viene en props
  const logo = storeLogo || localStorage.getItem('storeLogo');
  const logoSize = localStorage.getItem('logoSize') || 100;

  // Datos de prueba para que la vista previa no falle
  const mockStore = {
    name: "Mi Tienda de Ejemplo",
    description: "Esta es una descripción breve de cómo se vería tu negocio con este diseño.",
    logo: logo,
    logoSize: logoSize,
    products: [
      { id: 1, name: "Producto Prototipo A", price: 1500 },
      { id: 2, name: "Producto Prototipo B", price: 2500 }
    ]
  };

    const templates = [
      { 
        id: 'minimal', 
        code: 1,
        name: 'Diseño Minimalista', 
        description: 'Diseño limpio y elegante para enfoque minimalista.',
        fullComponent: <Minimal store={mockStore} />,
        previewComponent: <PreviewMinimal logo={logo} />
      },
      { 
        id: 'colorful', 
        code: 2,
        name: 'Diseño Colorido', 
        description: 'Uso vibrante de colores para resaltar tu marca.',
        fullComponent: <Colorful store={mockStore} />,
        previewComponent: <PreviewColorful logo={logo} />
      },
      { 
        id: 'model', 
        code: 3,
        name: 'Diseño Moderno (Model)', 
        description: 'Estructura sólida y profesional para empresas.',
        fullComponent: <Model store={mockStore} />,
        previewComponent: <PreviewModern logo={logo} />
      }
    ];

  useEffect(() => {
    const fetchDiseno = async () => {
      if (!user) {
        setFetching(false);
        return;
      }
      try {
        const res = await fetch(`http://localhost:4000/api/comercio?id_usuario=${user.id_usuario}`);
        const comercio = await res.json();
        const saved = Number(comercio?.["tipo_diseño"]);
        if ([1, 2, 3].includes(saved)) {
          setSelectedDesign(saved);
        }
      } catch (err) {
        console.error('No se pudo cargar el diseño guardado', err);
      } finally {
        setFetching(false);
      }
    };

    fetchDiseno();
  }, [user]);

  // Guardar la elección en el backend con confirmación
  const handleSelectDesign = async (template) => {
    if (!user) {
      alert('Necesitás iniciar sesión para guardar el diseño.');
      return;
    }

    const confirmed = window.confirm('Este diseño reemplazará el actual. ¿Querés continuar?');
    if (!confirmed) return;

    setSavingId(template.id);
    try {
      const response = await fetch('http://localhost:4000/api/comercio/diseno', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario: user.id_usuario, tipo_diseno: template.code })
      });

      if (!response.ok) {
        let msg = 'No se pudo guardar el diseño';
        try {
          const data = await response.json();
          msg = data?.error || msg;
        } catch (parseErr) {
          const text = await response.text();
          msg = text || msg;
        }
        throw new Error(msg);
      }

      setSelectedDesign(template.code);
      alert('¡Diseño guardado!');
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
      alert(error.message || 'Ocurrió un error al guardar el diseño');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="design-selector-wrapper">
      <div className="container py-5">
        <div
          className="design-header mb-5"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}
        >
          <div>
            <h1 className="design-main-title" style={{ marginBottom: '8px' }}>Elige la estética de tu sitio</h1>
            <p className="design-subtitle text-muted" style={{ margin: 0 }}>Selecciona el diseño que mejor represente tu proyecto y personalízalo después</p>
          </div>
          <button
            type="button"
            className="btn btn-back"
            onClick={() => navigate("/admin")}
          >
            ← Volver al panel
          </button>
        </div>

        <div className="design-cards-container">
          {templates.map((t) => {
            const isActive = selectedDesign === t.code;
            const isSaving = savingId === t.id;
            return (
            <div key={t.id} className="design-card-wrapper">
              <div className="design-card-box">
                {/* Thumbnail del componente reducido */}
                <div className="design-preview-box">
                  <div className="preview-content">
                    {t.previewComponent}
                  </div>
                  <div className="preview-overlay">
                    <button 
                      className="preview-btn-live"
                      onClick={() => setPreviewing(t)}
                    >
                      Vista Previa
                    </button>
                  </div>
                </div>
                
                <div className="design-card-body">
                  <h3 className="design-card-title">{t.name}</h3>
                  <p className="design-card-description">{t.description}</p>
                  
                  <button 
                    className="design-select-btn"
                    disabled={fetching || !!savingId}
                    onClick={() => handleSelectDesign(t)}
                    style={isActive ? { background: '#1f2937', color: 'white', borderColor: '#1f2937' } : {}}
                  >
                    <span className="btn-text">{isSaving ? 'Guardando...' : isActive ? 'Seleccionado' : 'Seleccionar'}</span>
                    <span className="btn-arrow">→</span>
                  </button>
                </div>
              </div>
            </div>
          );})}
        </div>
      </div>

      {/* --- MODAL FULLSCREEN PARA VISTA PREVIA --- */}
      {previewing && (
        <div className="modal-preview-overlay">
          <div className="modal-preview-container">
            <div className="modal-preview-header">
              <div className="modal-preview-title">
                <h2>{previewing.name}</h2>
                <p>Vista previa en tiempo real</p>
              </div>
              <button 
                className="modal-close-btn" 
                onClick={() => setPreviewing(null)}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <div className="modal-preview-body">
              <div className="actual-design-render">
                {previewing.fullComponent}
              </div>
            </div>
            <div className="modal-preview-footer">
              <button 
                className="modal-btn modal-btn-secondary" 
                onClick={() => setPreviewing(null)}
              >
                Volver al selector
              </button>
              <button 
                className="modal-btn modal-btn-primary" 
                onClick={() => {
                  handleSelectDesign(previewing);
                  setPreviewing(null);
                }}
              >
                ¡Me encanta, elegir este!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignSelector;
