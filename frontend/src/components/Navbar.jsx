/*import { Link } from 'react-router-dom'
import Logo from '../components/Logo.jsx'

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          <Logo />
          <span className="brand-text">Emprendify</span>
        </Link>

        <nav className="nav-links">
          <Link to="/shop">Tienda</Link>
          <Link to="/admin">Panel</Link>
          <Link to="/login" className="btn btn-ghost">Ingresar</Link>
          <Link to="/register" className="btn btn-primary">Registrarse</Link>
        </nav>
      </div>
    </header>
  )
}*/
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Logo from "../components/Logo.jsx";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  // 🔄 se ejecuta cada vez que cambia la ruta
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setUser(storedUser ? JSON.parse(storedUser) : null);
  }, [location.pathname]); 

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
          <Link to="/shop">Tienda</Link>

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
