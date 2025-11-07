import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";     // ✅ sin barra inicial
import Footer from "./components/Footer";     // ✅
import Home from "./pages/HomePage";              // ✅
import Login from "./pages/LoginPage";
import Register from "./pages/RegisterPage";
import "./styles/index.css";


export default function App() {
  return (
    <div className="layout">
      {/* 🔹 Navbar global (siempre visible arriba) */}
      <Navbar />

      {/* 🔹 Contenido central que cambia según la ruta */}
      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>

      {/* 🔹 Footer global (siempre visible abajo) */}
      <Footer />
    </div>
  );
}

/*import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'  
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ShopPage from './pages/ShopPage.jsx'
import CartPage from './pages/CartPage.jsx'
import AdminPanel from './pages/AdminPanel.jsx' 

function App() {
  return (
    <div className="layout">
      <Navbar />
      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
*/