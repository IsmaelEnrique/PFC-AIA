import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Logo from "../components/Logo.jsx";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [slugTienda, setSlugTienda] = useState(null);

  // 🔄 se ejecuta cada vez que cambia la ruta
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setUser(storedUser ? JSON.parse(storedUser) : null);
  }, [location.pathname]); 

  // 🔍 Obtener slug si el usuario está logueado
  useEffect(() => {
    if (user?.id_usuario) {
      fetch(`http://localhost:4000/api/comercio/${user.id_usuario}`)
        .then(res => res.json())
        .then(data => {
          console.log("Datos del comercio:", data); // ← LOG PARA DEBUG
          if (data && data.slug && data.activo) {
            console.log("Comercio activo con slug:", data.slug); // ← LOG PARA DEBUG
            setSlugTienda(data.slug);
          } else {
            console.log("Comercio no activo o sin slug"); // ← LOG PARA DEBUG
            setSlugTienda(null);
          }
        })
        .catch((err) => {
          console.error("Error al obtener comercio:", err); // ← LOG PARA DEBUG
          setSlugTienda(null);
        });
    } else {
      setSlugTienda(null);
    }
  }, [user, location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const handleVerTienda = (e) => {
    e.preventDefault();
    console.log("Slug actual:", slugTienda); // ← LOG PARA DEBUG
    if (!slugTienda) {
      alert("Todavía no está activado tu comercio");
      return;
    }
    window.open(`/tienda/${slugTienda}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          <Logo />
          <span className="brand-text">Emprendify</span>
        </Link>

        <nav className="nav-links">
          {user ? (
            <>
              <a 
                href="#" 
                onClick={handleVerTienda}
                style={{ cursor: 'pointer' }}
              >
                Ver mi tienda
              </a>
              <Link to="/admin">Panel</Link>
              <button
                onClick={handleLogout}
                className="btn btn-logout"
                style={{ fontWeight: 'normal' }}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Ingresar
              </Link>
              <Link to="/register" className="btn btn-primary">
                Registrarse
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}