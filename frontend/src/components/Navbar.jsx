
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
          if (data?.slug) setSlugTienda(data.slug);
        })
        .catch(() => setSlugTienda(null));
    } else {
      setSlugTienda(null);
    }
  }, [user]); 

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          <Logo />
          <span className="brand-text">Emprendify</span>
        </Link>

        <nav className="nav-links">
          {user && slugTienda ? (
            <a 
              href={`/tienda/${slugTienda}`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Ver mi tienda
            </a>
          ) : (
            <Link to="/shop">Tienda</Link>
          )}

          {user ? (
            <>
              <Link to="/admin">Panel</Link>
              <button
                onClick={handleLogout}
                className="btn btn-logout"
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
