import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);

    if (!validateForm()) return;

    try {
      const response = await fetch("http://localhost:4000/api/usuarios/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mail: email,
          contrasena: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error || "Credenciales inválidas" });
        return;
      }

      // ✅ LOGIN OK - Corregido el error de paréntesis
      // Usamos una lógica que detecte si el usuario viene solo o en una lista
      const usuarioFinal = Array.isArray(data) ? data[0] : data;
      localStorage.setItem("user", JSON.stringify(usuarioFinal));

      console.log("Login correcto ✅", usuarioFinal);
      setSuccess(true);
      setErrors({});
      
      // Pequeña espera para que se guarde bien antes de navegar
      setTimeout(() => {
        navigate("/admin");
      }, 500);

    } catch (error) {
      setErrors({ general: "No se pudo conectar con el servidor" });
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">Iniciar sesión en <span className="accent">Emprendify</span></h1>
        <p className="auth-subtitle">Accedé a tu cuenta para gestionar tu emprendimiento</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
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

          <button type="submit" className="btn btn-primary">
            Iniciar sesión
          </button>

          {errors.general && <p className="error-text">{errors.general}</p>}
          {success && <p className="success-text">Inicio de sesión exitoso 🎉</p>}
        </form>

        <p className="auth-footer">
          ¿No tenés una cuenta?{" "}
          <Link to="/register" className="accent-text">Registrate</Link>
        </p>
      </div>
    </section>
  );
}