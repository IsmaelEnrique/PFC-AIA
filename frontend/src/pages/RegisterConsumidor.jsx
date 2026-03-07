import { apiUrl } from "../config/api";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

// Recibimos id_comercio como prop (o podrías sacarlo de un Contexto de la tienda)
export default function RegisterConsumidor({ id_comercio, nombreTienda }) {
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
    if (!nombre) newErrors.nombre = "Tu nombre es obligatorio.";
    if (!apellido) newErrors.apellido = "Tu apellido es obligatorio.";
    if (!email) {
      newErrors.email = "El correo es obligatorio.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "El formato no es válido.";
    }
    if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres.";
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
      const response = await fetch(apiUrl("/api/auth/registrar"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          apellido,
          mail: email,
          password: password,
          tipo: "consumidor", // 👈 Crucial: Esto le dice al backend que use la tabla 'consumidor'
          id_comercio: id_comercio // 👈 Vinculamos al cliente con ESTA tienda
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error || "Hubo un problema al crear tu cuenta." });
        return;
      }

      Swal.fire({
        title: "¡Ya casi!",
        text: `Te enviamos un mail de activación. Confirmalo para poder comprar en ${nombreTienda || 'nuestra tienda'}.`,
        icon: "success",
        confirmButtonColor: "#009EE3"
      }).then(() => navigate("/login-cliente")); // O la ruta que definas para el login de clientes

    } catch (error) {
      setErrors({ general: "No pudimos conectar con el servidor." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-consumidor-container">
      <h2>Crear mi cuenta en <span className="store-name">{nombreTienda}</span></h2>
      <p>Registrate para gestionar tus pedidos y comprar más rápido.</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <div className="form-group">
            <label>Nombre</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            {errors.nombre && <span className="error">{errors.nombre}</span>}
          </div>
          <div className="form-group">
            <label>Apellido</label>
            <input type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} />
            {errors.apellido && <span className="error">{errors.apellido}</span>}
          </div>
        </div>

        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label>Contraseña</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {errors.password && <span className="error">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label>Repetir Contraseña</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
        </div>

        <button type="submit" className="btn-tienda" disabled={loading}>
          {loading ? "Creando cuenta..." : "Registrarme"}
        </button>

        {errors.general && <p className="error-general">{errors.general}</p>}
      </form>
    </div>
  );
}