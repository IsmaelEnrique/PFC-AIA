import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!nombre) newErrors.nombre = "El nombre es obligatorio.";
    if (!apellido) newErrors.apellido = "El apellido es obligatorio.";
    if (!email) {
      newErrors.email = "El correo electrónico es obligatorio.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "El formato del correo no es válido.";
    }
    if (!password) {
      newErrors.password = "La contraseña es obligatoria.";
    } else if (password.length < 6) {
      newErrors.password = "Debe tener al menos 6 caracteres.";
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      // 🚀 Apuntamos a la nueva ruta de auth unificada
      const response = await fetch("http://localhost:4000/api/auth/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: `${nombre} ${apellido}`,
          mail: email,
          password: password,
          tipo: "usuario" // Siempre 'usuario' para el vendedor
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error || "Error al registrarse" });
        return;
      }

      Swal.fire({
        title: "¡Casi listo! 📧",
        text: "Te enviamos un correo de verificación. Por favor, confirmá tu cuenta para poder ingresar a tu panel.",
        icon: "info",
        confirmButtonText: "Ir al Login",
        confirmButtonColor: "#009EE3"
      }).then(() => navigate("/login"));

    } catch (error) {
      setErrors({ general: "Error de conexión con el servidor" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">Crear cuenta en <span className="accent">Emprendify</span></h1>
        <p className="auth-subtitle">Registrate para comenzar a gestionar tu emprendimiento</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Nombre</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            {errors.nombre && <p className="error-text">{errors.nombre}</p>}
          </div>

          <div className="form-group">
            <label>Apellido</label>
            <input type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} />
            {errors.apellido && <p className="error-text">{errors.apellido}</p>}
          </div>

          <div className="form-group">
            <label>Correo electrónico</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tuemail@ejemplo.com" />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          <div className="form-group">
            <label>Confirmar contraseña</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Procesando..." : "Registrarse"}
          </button>

          {errors.general && <p className="error-text">{errors.general}</p>}
        </form>

        <p className="auth-footer">¿Ya tenés cuenta? <Link to="/login" className="accent-text">Iniciá sesión</Link></p>
      </div>
    </section>
  );
}