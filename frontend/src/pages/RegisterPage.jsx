import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";



export default function Register() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);

    if (!validateForm()) return;

    try {
      const response = await fetch("http://localhost:4000/api/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          apellido,
          mail: email,
          contrasena: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error || "Error al registrarse" });
        return;
      }

      // ✅ Registro OK - Guardar sesión
      localStorage.setItem("user", JSON.stringify(data));
      console.log("Registro correcto ✅", data);

      setSuccess(true);
      setErrors({});

      // Esperar para mostrar el mensaje de éxito y luego redirigir
      setTimeout(() => {
        navigate("/admin");
      }, 1000);
    } catch (error) {
      console.error(error);
      setErrors({ general: "Error de conexión con el servidor" });
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
          {/* Nombre */}
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
            {errors.nombre && <p className="error-text">{errors.nombre}</p>}
          </div>

          {/* Apellido */}
          <div className="form-group">
            <label>Apellido</label>
            <input
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
            />
            {errors.apellido && (
              <p className="error-text">{errors.apellido}</p>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              placeholder="tuemail@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          {/* Contraseña */}
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && (
              <p className="error-text">{errors.password}</p>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div className="form-group">
            <label>Confirmar contraseña</label>
            <input
              type="password"
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

          {errors.general && (
            <p className="error-text">{errors.general}</p>
          )}

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