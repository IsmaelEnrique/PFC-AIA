import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav style={{ display: 'flex', justifyContent: 'space-around', padding: '1rem', background: '#eee' }}>
      <Link to="/">Inicio</Link>
      <Link to="/shop">Tienda</Link>
      <Link to="/cart">Carrito</Link>
      <Link to="/login">Iniciar sesión</Link>
    </nav>
  )
}