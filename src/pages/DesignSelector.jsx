import { useState } from "react";
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
}
