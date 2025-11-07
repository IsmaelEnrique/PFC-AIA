//Imporamos los hooks del react y el componente link de react router
import { useState } from "react";
import { Link } from "react-router-dom";

//componente funcional login
export default function Login() {
  //Estados local del componente
  const [email, setEmail] = useState("");         //Guarda el mail que el usuario ingresa
  const [password, setPassword] = useState("");   //Guarda la contraseña que el usuario ingresa
  const [errors, setErrors] = useState({});       //Guarda los mensajes de error por campo
  const [success, setSuccess] = useState(false);  //Indica si el login fue exitoso

  //Función para validar el formulario

  const validateForm = () => {
    const newErrors = {};

    // Validar email
    if (!email) {
      //Campo Vacio
      newErrors.email = "El correo electrónico es obligatorio.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      //Expresion normal para validad el format
      newErrors.email = "El formato del correo no es válido.";
    }

    // Validar contraseña
    if (!password) {
      newErrors.password = "La contraseña es obligatoria.";
    } else if (password.length < 6) {
      newErrors.password = "Debe tener al menos 6 caracteres.";
    }

    //Guardo los errores en el estado
    setErrors(newErrors);

    //Retornar true si no hay errores
    return Object.keys(newErrors).length === 0; // true si no hay errores
  };

  //Funcion: manejador del envio del formulario

  const handleSubmit = (e) => {
    e.preventDefault();      //Evita el refresh automatico del formulario
    setSuccess(false);       //Resetea el mensaje de exito

    //Si pasa la validacion, simula un login exitoso
    if (validateForm()) {
      console.log("Inicio de sesión correcto ✅", { email, password });
      
      //Muestra mensaje de exito y limpia el formulario
      setSuccess(true);
      setEmail("");
      setPassword("");
      setErrors({});
    }
  };

  //Render: Estructura visual del formulario

  return (
    <section className="auth-page">
      <div className="auth-container">
        {/* Título de la página */}
        <h1 className="auth-title">Iniciar sesión en <span className="accent">Emprendify</span></h1>
         {/* Subtítulo */}
        <p className="auth-subtitle">Accedé a tu cuenta para gestionar tu emprendimiento</p>

    {/* Formulario de login */}
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {/* Campo de correo electrónico */}
        <div className="form-group">
          <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              placeholder="tuemail@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {/* Si hay error en email, lo muestra debajo */}
            {errors.email && <p className="error-text">{errors.email}</p>}
        </div>

        {/* Campo de contraseña */}
        <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {/* Si hay error en contraseña, lo muestra debajo */}
            {errors.password && <p className="error-text">{errors.password}</p>}
        </div>

         {/* Botón de envío */}
        <button type="submit" className="btn btn-primary">Iniciar sesión</button>
        
        {/* Mensaje de éxito si la validación fue correcta */}
          {success && <p className="success-text">Inicio de sesión exitoso 🎉</p>}
    </form>

        {/* Enlace hacia la página de registro */}
        <p className="auth-footer">
          ¿No tenés una cuenta?{" "}
          <Link to="/register" className="accent-text">Registrate</Link>
        </p>
      </div>
    </section>
  );
}
