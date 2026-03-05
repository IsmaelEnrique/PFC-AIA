import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

export default function LoginConsumidor({ id_comercio, nombreTienda }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [unverified, setUnverified] = useState(false);

  // 1. Detectar si viene de activar su mail
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("verificado") === "true") {
      Swal.fire("¡Cuenta activada!", "Ya podés comprar en nuestra tienda.", "success");
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setUnverified(false);
    
    if (!email || !password) {
      setErrors({ general: "Completá todos los campos." });
      return;
    }

    setLoading(true);

    try {
      // 🚀 Enviamos mail, password Y EL ID_COMERCIO de la tienda actual
      const response = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          mail: email, 
          contrasena: password,
          tipo: "consumidor", // Especificamos que es un cliente
          id_comercio: id_comercio // 👈 FILTRO CRÍTICO
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          setUnverified(true);
          setErrors({ general: "Tu cuenta no está verificada. Revisá tu email." });
        } else if (response.status === 401) {
          setErrors({ general: "Datos incorrectos o no sos cliente de esta tienda." });
        } else {
          setErrors({ general: data.error || "Error al iniciar sesión." });
        }
        return;
      }

      // LOGIN EXITOSO
      localStorage.setItem("customer_token", data.token); // Guardamos sesión de cliente
      localStorage.setItem("customer_data", JSON.stringify(data.user));

      Swal.fire({
        title: `¡Hola, ${data.user.nombre}!`,
        text: "Iniciando sesión en la tienda...",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });

      // Redirigimos al carrito o al inicio de la tienda
      setTimeout(() => navigate(`/tienda/${id_comercio}/checkout`), 2000);

    } catch (error) {
      setErrors({ general: "Error de conexión con el servidor." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-consumidor-container">
      <h3>Ingresar a <span className="accent">{nombreTienda}</span></h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" />
        </div>

        <div className="form-group">
          <label>Contraseña</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="*******" />
        </div>

        <button type="submit" className="btn-tienda" disabled={loading}>
          {loading ? "Cargando..." : "Entrar a la tienda"}
        </button>

        {errors.general && <p className="error-text">{errors.general}</p>}

        {unverified && (
          <button type="button" className="resend-btn">
            ¿No te llegó el mail? Reenviar activación
          </button>
        )}
      </form>

      <p className="footer-auth">
        ¿No tenés cuenta? <Link to={`/tienda/${id_comercio}/register`}>Registrate acá</Link>
      </p>
    </div>
  );
}