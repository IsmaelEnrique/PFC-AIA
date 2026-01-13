import templates from "../data/templates";

import TemplateModern from "../templates/Modern/TemplateModern";
import TemplateColorful from "../templates/Colorful/TemplateColorful";
import TemplateMinimal from "../templates/Minimal/TemplateMinimal";

export default function StorePreview() {
  const selectedTemplate =
    localStorage.getItem("selectedTemplate") || "modern";

  const store = {
    name: "Emprendify Demo",
    description: "Una tienda creada con Emprendify",
    templateId: selectedTemplate,
    products: [
      { id: 1, name: "Producto A", price: 1200 },
      { id: 2, name: "Producto B", price: 1800 },
      { id: 3, name: "Producto C", price: 2400 }
    ]
  };

  const template = templates.find(t => t.id === store.templateId);

  if (!template) return <p>Template no encontrado</p>;

  switch (store.templateId) {
    case "modern":
      return <TemplateModern store={store} template={template} />;

    case "colorful":
      return <TemplateColorful store={store} template={template} />;

    case "minimal":
      return <TemplateMinimal store={store} template={template} />;

    default:
      return <TemplateModern store={store} template={template} />;
  }
}
