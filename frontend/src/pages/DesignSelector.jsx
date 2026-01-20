import React, { useState } from 'react';
// 1. Importación de tus plantillas reales
import Minimal from '../templates/Minimal/TemplateMinimal';
import Colorful from '../templates/Colorful/TemplateColorful';
import Model from '../templates/Modern/TemplateModern';

const DesignSelector = ({ proyectoId }) => {
  // Estados para manejar la previsualización y la carga
  const [previewing, setPreviewing] = useState(null);
  const [loading, setLoading] = useState(false);

  // Datos de prueba para que la vista previa no falle
  const mockStore = {
    name: "Mi Tienda de Ejemplo",
    description: "Esta es una descripción breve de cómo se vería tu negocio con este diseño.",
    products: [
      { id: 1, name: "Producto Prototipo A", price: 1500 },
      { id: 2, name: "Producto Prototipo B", price: 2500 }
    ]
  };

    const templates = [
      { 
        id: 'minimal', 
        name: 'Diseño Minimalista', 
        // PASAMOS LAS PROPS AQUÍ
        component: <Minimal store={mockStore} />, 
        color: '#f8f9fa' 
      },
  // ... haz lo mismo para Colorful y Model
    { 
        id: 'colorful', 
        name: 'Diseño Colorido', 
        description: 'Uso vibrante de colores para resaltar tu marca.',
        component: <Colorful store={mockStore}  />,
        color: '#ffefef' 
    },
    { 
        id: 'model', 
        name: 'Diseño Moderno (Model)', 
        description: 'Estructura sólida y profesional para empresas.',
        component: <Model store={mockStore} />,
        color: '#eef2ff' 
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
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold">Elige la estética de tu sitio</h1>
        <p className="lead text-muted">Selecciona el diseño que mejor represente tu proyecto.</p>
      </div>

      <div className="row g-4">
        {templates.map((t) => (
          <div key={t.id} className="col-lg-4">
            <div className="card h-100 shadow-sm border-0 transition-hover">
              {/* Representación visual simple antes de la "vista previa" */}
              <div 
                className="card-img-top d-flex align-items-center justify-content-center" 
                style={{ height: '220px', backgroundColor: t.color, fontSize: '0.9rem' }}
              >
                <span className="text-muted text-uppercase fw-bold">Vista previa de {t.name}</span>
              </div>
              
              <div className="card-body d-flex flex-column">
                <h4 className="card-title">{t.name}</h4>
                <p className="card-text text-muted flex-grow-1">{t.description}</p>
                
                <div className="d-grid gap-2 mt-3">
                  <button 
                    className="btn btn-outline-dark"
                    onClick={() => setPreviewing(t)}
                  >
                    🔍 Vista Previa en Vivo
                  </button>
                  <button 
                    className="btn btn-primary"
                    disabled={loading}
                    onClick={() => handleSelectDesign(t.id)}
                  >
                    {loading ? 'Guardando...' : 'Seleccionar este diseño'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL FULLSCREEN PARA VISTA PREVIA --- */}
      {previewing && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
          <div className="modal-dialog modal-fullscreen">
            <div className="modal-content">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title">Estas viendo: {previewing.name}</h5>
                <button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={() => setPreviewing(null)}
                ></button>
              </div>
              <div className="modal-body p-0 bg-white shadow-inner">
                {/* Aquí se renderiza tu componente de diseño real */}
                <div className="actual-design-render">
                    {previewing.component}
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button className="btn btn-secondary px-4" onClick={() => setPreviewing(null)}>
                  Volver al selector
                </button>
                <button 
                    className="btn btn-success px-5" 
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
        </div>
      )}
    </div>
  );
};

export default DesignSelector;

/*import { useState } from "react";
import { useNavigate } from "react-router-dom";
import templates from "../data/templates";

import PreviewModern from "../previews/PreviewModern";
import PreviewColorful from "../previews/PreviewColorful";
import PreviewMinimal from "../previews/PreviewMinimal";

import "../styles/design-selector.css";

export default function DesignSelector() {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate(); // ✅ ACÁ

  const renderPreview = (id) => {
    switch (id) {
      case "modern":
        return <PreviewModern />;
      case "colorful":
        return <PreviewColorful />;
      case "minimal":
        return <PreviewMinimal />;
      default:
        return null;
    }
  };

  return (
    <section className="design-page">
      <h1 className="design-title">Elegí el diseño de tu tienda</h1>
      <p className="design-subtitle">
        Podés cambiar el estilo cuando quieras
      </p>

      <div className="design-grid">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className={`design-card ${
              selected === tpl.id ? "selected" : ""
            }`}
            onClick={() => setSelected(tpl.id)}
          >
            <div className="preview-wrapper">
              {renderPreview(tpl.id)}
            </div>

            <div className="design-info">
              <h3>{tpl.name}</h3>
              <p>{tpl.description}</p>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <button
          className="btn btn-primary design-btn"
          onClick={() => {
            localStorage.setItem("selectedTemplate", selected);
            navigate("/store-preview");
          }}
        >
          Usar este diseño
        </button>
      )}
    </section>
  );
}*/
