import React, { useState } from 'react';
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
  // Estados para manejar la previsualización y la carga
  const [previewing, setPreviewing] = useState(null);
  const [loading, setLoading] = useState(false);

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
        name: 'Diseño Minimalista', 
        description: 'Diseño limpio y elegante para enfoque minimalista.',
        fullComponent: <Minimal store={mockStore} />,
        previewComponent: <PreviewMinimal logo={logo} />
      },
      { 
        id: 'colorful', 
        name: 'Diseño Colorido', 
        description: 'Uso vibrante de colores para resaltar tu marca.',
        fullComponent: <Colorful store={mockStore} />,
        previewComponent: <PreviewColorful logo={logo} />
      },
      { 
        id: 'model', 
        name: 'Diseño Moderno (Model)', 
        description: 'Estructura sólida y profesional para empresas.',
        fullComponent: <Model store={mockStore} />,
        previewComponent: <PreviewModern logo={logo} />
      }
    ];

  // 2. Función para guardar la elección en el Backend
  const handleSelectDesign = async (templateId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/proyectos/${proyectoId}/diseno`, {
        method: 'PATCH', // O POST según tu API
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: templateId })
      });

      if (response.ok) {
        alert("¡Diseño seleccionado con éxito!");
        // Aquí podrías redirigir al usuario: window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="design-selector-wrapper">
      <div className="container py-5">
        <div className="design-header text-center mb-5">
          <h1 className="design-main-title">Elige la estética de tu sitio</h1>
          <p className="design-subtitle text-muted">Selecciona el diseño que mejor represente tu proyecto y personalízalo después</p>
        </div>

        <div className="design-cards-container">
          {templates.map((t) => (
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
                      <span className="preview-icon">👁️</span>
                      Vista Previa
                    </button>
                  </div>
                </div>
                
                <div className="design-card-body">
                  <h3 className="design-card-title">{t.name}</h3>
                  <p className="design-card-description">{t.description}</p>
                  
                  <button 
                    className="design-select-btn"
                    disabled={loading}
                    onClick={() => handleSelectDesign(t.id)}
                  >
                    <span className="btn-text">{loading ? 'Guardando...' : 'Seleccionar'}</span>
                    <span className="btn-arrow">→</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
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
                  handleSelectDesign(previewing.id);
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
