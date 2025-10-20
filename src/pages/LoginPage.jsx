export default function LoginPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Iniciar sesión</h2>
      <form>
        <input type="email" placeholder="Correo electrónico" required /><br /><br />
        <input type="password" placeholder="Contraseña" required /><br /><br />
        <button>Entrar</button>
      </form>
    </div>
  )
}
