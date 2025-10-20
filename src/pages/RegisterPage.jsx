export default function RegisterPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Registro de usuario</h2>
      <form>
        <input type="text" placeholder="Nombre" required /><br /><br />
        <input type="text" placeholder="Apellido" required /><br /><br />
        <input type="email" placeholder="Correo electrónico" required /><br /><br />
        <input type="password" placeholder="Contraseña" required /><br /><br />
        <button>Registrarse</button>
      </form>
    </div>
  )
}
