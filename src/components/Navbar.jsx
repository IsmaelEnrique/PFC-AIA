import { Link } from 'react-router-dom'
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
          <Link to="/register" className="btn btn-primary">Crear</Link>
        </nav>
      </div>
    </header>
  )
}
