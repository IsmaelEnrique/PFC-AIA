import { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import { CartProvider } from "./context/CartContext";
import Footer from "./components/Footer";
import Home from "./pages/HomePage";
import Login from "./pages/LoginPage";
import Register from "./pages/RegisterPage";
import LogoUpload from "./pages/LogoUpload";
import Perfil from "./pages/Perfil";
import "./styles/index.css";
import DesignSelector from "./pages/DesignSelector";
import StorePreview from "./pages/StorePreview";
import AdminPanel from "./pages/AdminPanel";
import ActivarComercio from "./pages/ActivarComercio";
import GestionProductos from "./pages/GestionProductos";
import AgregarProducto from "./pages/AgregarProducto";
import GestionCategorias from "./pages/GestionCategorias";
import TiendaPublica from "./pages/TiendaPublica";
import ProductDetail from "./pages/ProductDetail";


// Componente para proteger rutas
function ProtectedRoute({ element }) {
  const user = localStorage.getItem("user");
  return user ? element : <Navigate to="/login" replace />;
}

// Componente para rutas públicas que redirijen si hay sesión
function PublicRoute({ element }) {
  const user = localStorage.getItem("user");
  return user ? <Navigate to="/admin" replace /> : element;
}

export default function App() {
  const [storeLogo, setStoreLogo] = useState(null);
  const location = useLocation();
  
  // Detectar si estamos en la ruta de tienda pública
  const esTiendaPublica = location.pathname.startsWith('/tienda/');

  const handleLogoUpload = (logo) => {
    setStoreLogo(logo);
  };

  return (
    <>
      {esTiendaPublica ? (
        // Rutas públicas SIN navbar/footer (tienda y detalle)
        <Routes>
          <Route path="/tienda/:slug" element={<TiendaPublica />} />
          <Route path="/tienda/:slug/producto/:id" element={<ProductDetail />} />
        </Routes>
      ) : (
        // TODAS las rutas (incluyendo demo-template-colorful) bajo CartProvider
        <CartProvider>
          <Routes>
            <Route
              path="*"
              element={
                <div className="layout">
                  <Navbar />
                  <main className="content">
                    <Routes>
                      <Route path="/" element={<PublicRoute element={<Home />} />} />
                      <Route path="/login" element={<PublicRoute element={<Login />} />} />
                      <Route path="/register" element={<PublicRoute element={<Register />} />} />
                      <Route path="/admin" element={<ProtectedRoute element={<AdminPanel />} />} />
                      <Route path="/cargar-logo" element={<LogoUpload onLogoUpload={handleLogoUpload} />} />
                      <Route path="/disenar-pagina" element={<ProtectedRoute element={<DesignSelector storeLogo={storeLogo} />} />} />
                      <Route path="/store-preview" element={<ProtectedRoute element={<StorePreview />} />} />
                      <Route path="/activar-comercio" element={<ProtectedRoute element={<ActivarComercio />} />} />
                      <Route path="/gestion-productos" element={<ProtectedRoute element={<GestionProductos />} />} />
                      <Route path="/agregar-producto" element={<ProtectedRoute element={<AgregarProducto />} />} />
                      <Route path="/gestion-categorias" element={<ProtectedRoute element={<GestionCategorias />} />} />
                      <Route path="/perfil" element={<ProtectedRoute element={<Perfil />} />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              }
            />
          </Routes>
        </CartProvider>
      )}
    </>
  );
}