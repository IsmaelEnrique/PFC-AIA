/*import { apiUrl } from "../config/api";
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [unverified, setUnverified] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("verificado") === "true") {
      Swal.fire({
        title: "¡Cuenta activada!",
        text: "Ya podés iniciar sesión con tus datos.",
        icon: "success",
        confirmButtonColor: "#009EE3"
      });
      navigate("/login", { replace: true });
    }
  }, [location, navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = "El correo electrónico es obligatorio.";
    if (!password) newErrors.password = "La contraseña es obligatoria.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl("/api/auth/reenviar-verificacion"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mail: email, tipo: "usuario" }), // El vendedor es tipo 'usuario'
      });

      if (response.ok) {
        Swal.fire("¡Enviado!", "Revisá tu casilla de correo para el nuevo enlace.", "success");
        setUnverified(false);
      } else {
        Swal.fire("Error", "No se pudo reenviar. Intentá más tarde.", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Error de conexión.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUnverified(false);
    if (!validateForm()) return;
    setLoading(true);

    try {
      // 1) Intentamos el login por Auth (flujo nuevo)
      const authResponse = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mail: email, contrasena: password }),
      });

      let response = authResponse;
      let data = await authResponse.json();

      // 2) Fallback legacy: cuentas históricas en la tabla usuario
      if (!authResponse.ok && authResponse.status === 401) {
        const legacyResponse = await fetch(apiUrl("/api/usuarios/login"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mail: email, contrasena: password }),
        });

        response = legacyResponse;
        data = await legacyResponse.json();
      }

      if (!response.ok) {
        // Detectar si el error es por falta de verificación (status 403)
        if (response.status === 403 || data.error?.includes("verificar")) {
          setUnverified(true);
          setErrors({ general: "Tu cuenta no ha sido activada aún." });
        } else {
          setErrors({ general: data.error || "Credenciales incorrectas" });
        }
        return;
      }

      // Login exitoso: Guardamos los datos del vendedor
      const usuarioFinal = Array.isArray(data) ? data[0] : data;
      localStorage.setItem("user", JSON.stringify(usuarioFinal));
      
      Swal.fire({
        title: "¡Bienvenido!",
        text: "Entrando al panel de administración...",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });

      setTimeout(() => navigate("/admin"), 1500);

    } catch (error) {
      setErrors({ general: "No se pudo conectar con el servidor" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">Panel <span className="accent">Vendedor</span></h1>
        
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Correo electrónico</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Iniciando..." : "Ingresar al Panel"}
          </button>

          {errors.general && <p className="error-text">{errors.general}</p>}
          
          {unverified && (
            <button type="button" className="btn-resend-link" onClick={handleResendEmail} 
              style={{ marginTop: '10px', color: '#009EE3', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>
              ¿No recibiste el mail? Reenviar activación
            </button>
          )}
        </form>

        <p className="auth-footer">¿No tenés cuenta? <Link to="/register" className="accent-text">Registrate aquí</Link></p>
      </div>
    </section>
  );
}*/
import { apiUrl } from "../config/api";
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [unverified, setUnverified] = useState(false);

  useEffect(() => {
  const params = new URLSearchParams(location.search);

  const token = params.get("token");
  const tipo = params.get("tipo");

  const verificarCuenta = async () => {
    if (token) {
      try {
        await fetch(apiUrl(`/api/auth/verificar/${token}?tipo=${tipo}`));

        Swal.fire({
          title: "¡Cuenta verificada!",
          text: "Ya podés iniciar sesión.",
          icon: "success",
          confirmButtonColor: "#009EE3"
        });

      } catch (error) {
        Swal.fire({
          title: "Error",
          text: "El enlace no es válido o venció.",
          icon: "error"
        });
      }

      navigate("/login", { replace: true });
      return;
    }

    if (params.get("verificado") === "true") {
      Swal.fire({
        title: "¡Cuenta activada!",
        text: "Ya podés iniciar sesión.",
        icon: "success",
        confirmButtonColor: "#009EE3"
      });

      navigate("/login", { replace: true });
    }

  };

  verificarCuenta();

}, [location, navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!email) newErrors.email = "Ingresá tu correo.";
    if (!password) newErrors.password = "Ingresá tu contraseña.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResendEmail = async () => {
    setLoading(true);

    try {
      const response = await fetch(apiUrl("/api/auth/reenviar-verificacion"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mail: email,
          tipo: "usuario",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Swal.fire("Error", data.error || "No se pudo reenviar.", "error");
        return;
      }

      Swal.fire(
        "¡Correo enviado!",
        "Revisá tu casilla de entrada.",
        "success"
      );

      setUnverified(false);
    } catch (error) {
      Swal.fire("Error", "No se pudo conectar al servidor.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setUnverified(false);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch(apiUrl("/api/auth/login"), {
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
        if (response.status === 403) {
          setUnverified(true);
          setErrors({
            general: "Tu cuenta todavía no fue activada.",
          });
        } else {
          setErrors({
            general: data.error || "Credenciales incorrectas.",
          });
        }

        return;
      }

      localStorage.setItem("user", JSON.stringify(data));

      Swal.fire({
        title: "¡Bienvenido!",
        text: "Ingresando al panel...",
        icon: "success",
        timer: 1300,
        showConfirmButton: false,
      });

      setTimeout(() => {
        navigate("/admin");
      }, 1300);

    } catch (error) {
      setErrors({
        general: "No se pudo conectar con el servidor.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-container">

        <h1 className="auth-title">
          Panel <span className="accent">Vendedor</span>
        </h1>

        <p className="auth-subtitle">
          Ingresá para administrar tu tienda
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          <div className="form-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              placeholder="correo@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <p className="error-text">{errors.email}</p>
            )}
          </div>

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

          {errors.general && (
            <p className="error-text">{errors.general}</p>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>

          {unverified && (
            <button
              type="button"
              className="btn-resend-link"
              onClick={handleResendEmail}
            >
              Reenviar correo de activación
            </button>
          )}

        </form>

        <p className="auth-footer">
          ¿No tenés cuenta?{" "}
          <Link to="/register" className="accent-text">
            Registrate acá
          </Link>
        </p>

      </div>
    </section>
  );
}