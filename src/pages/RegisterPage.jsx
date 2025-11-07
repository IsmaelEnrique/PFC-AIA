import { useState } from "react";
import { Link } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // -------------------------
  // ✅ Validar el formulario
  // -------------------------
  const validateForm = () => {
    const newErrors = {};

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

    if (!confirmPassword) {
      newErrors.confirmPassword = "Debés confirmar la contraseña.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // -------------------------
  // 📤 Envío del formulario
  // -------------------------
  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess(false);

    if (validateForm()) {
      console.log("Registro exitoso ✅", { email, password });
      setSuccess(true);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setErrors({});
    }
  };

  // -------------------------
  // 🧱 Estructura visual
  // -------------------------
  return (
    <section className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">
          Crear cuenta en <span className="accent">Emprendify</span>
        </h1>
        <p className="auth-subtitle">
          Registrate para comenzar a gestionar tu emprendimiento
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Campo email */}
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              placeholder="tuemail@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          {/* Campo contraseña */}
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          {/* Campo confirmar contraseña */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="********"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {errors.confirmPassword && (
              <p className="error-text">{errors.confirmPassword}</p>
            )}
          </div>

          <button type="submit" className="btn btn-primary">
            Registrarse
          </button>

          {success && (
            <p className="success-text">Cuenta creada con éxito 🎉</p>
          )}
        </form>

        <p className="auth-footer">
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" className="accent-text">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </section>
  );
}
