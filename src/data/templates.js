//definicion de estilos
const templates = [
  // =========================
  // 🟦 TEMPLATE MODERN
  // =========================
  {
    id: "modern",
    name: "Modern",
    description: "Diseño moderno con cards y sombras suaves",
    previewColor: "#6366f1",
    style: {
      colors: {
        background: "#f8fafc",
        text: "#1f2937",
        primary: "#6366f1",
        secondary: "#e0e7ff"
      },
      fontFamily: "'Poppins', sans-serif",
      borderRadius: "16px",
      shadow: "0 10px 25px rgba(0,0,0,0.08)",
      animation: "fade-in"
    }
  },

  // =========================
  // 🎨 TEMPLATE COLORFUL
  // =========================
  {
    id: "colorful",
    name: "Colorful",
    description: "Colores vibrantes y estilo llamativo",
    previewColor: "#ec4899",
    style: {
      colors: {
        background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
        text: "#ffffff",
        primary: "#facc15",
        secondary: "#ffffff33"
      },
      fontFamily: "'Montserrat', sans-serif",
      borderRadius: "20px",
      shadow: "0 15px 30px rgba(0,0,0,0.25)",
      animation: "slide-up"
    }
  },

  // =========================
  // 🧘 TEMPLATE MINIMAL
  // =========================
  {
    id: "minimal",
    name: "Minimal",
    description: "Diseño limpio, elegante y profesional",
    previewColor: "#ffffff",
    style: {
      colors: {
        background: "#ffffff",
        text: "#111111",
        primary: "#000000",
        secondary: "#e5e5e5"
      },
      fontFamily: "'Inter', sans-serif",
      borderRadius: "0px",
      shadow: "none",
      animation: "fade-in"
    }
  }
];

export default templates;
