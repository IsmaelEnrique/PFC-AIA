import { useState } from 'react';
import './AuthModal.css';

export default function AuthModal({ isOpen, onClose, onLogin, id_comercio }) {
  const [modo, setModo] = useState('login'); // 'login' o 'registro'
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    mail: '',
    contrasena: '',
    confirmarContrasena: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('🔵 Iniciando submit en modo:', modo);

    try {
      if (modo === 'registro') {
        // Validaciones
        if (formData.contrasena !== formData.confirmarContrasena) {
          console.log('❌ Las contraseñas no coinciden');
          setError('Las contraseñas no coinciden');
          return;
        }

        if (formData.contrasena.length < 6) {
          console.log('❌ Contraseña muy corta');
          setError('La contraseña debe tener al menos 6 caracteres');
          return;
        }

        console.log('📤 Enviando registro:', { nombre: formData.nombre, apellido: formData.apellido, mail: formData.mail, id_comercio });

        // Registro
        const response = await fetch('http://localhost:4000/api/consumidor/registro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: formData.nombre,
            apellido: formData.apellido,
            mail: formData.mail,
            contrasena: formData.contrasena,
            id_comercio: id_comercio
          })
        });

        console.log('📥 Respuesta recibida, status:', response.status);

        const data = await response.json();
        console.log('📄 Datos del servidor:', data);

        if (!response.ok) {
          console.error('❌ Error del servidor:', data);
          setError(data.error || data.detalle || 'Error al registrarse');
          return;
        }

        console.log('✅ Registro exitoso, guardando...');
        // Guardar en localStorage y notificar al padre
        localStorage.setItem('consumidor', JSON.stringify(data));
        onLogin(data);
        onClose();
      } else {
        console.log('📤 Enviando login:', formData.mail, id_comercio);
        // Login
        const response = await fetch('http://localhost:4000/api/consumidor/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mail: formData.mail,
            contrasena: formData.contrasena,
            id_comercio: id_comercio
          })
        });

        console.log('📥 Respuesta login, status:', response.status);

        const data = await response.json();
        console.log('📄 Datos login:', data);

        if (!response.ok) {
          console.error('❌ Error login:', data);
          setError(data.error || 'Error al iniciar sesión');
          return;
        }

        console.log('✅ Login exitoso');
        // Guardar en localStorage y notificar al padre
        localStorage.setItem('consumidor', JSON.stringify(data));
        onLogin(data);
        onClose();
      }
    } catch (error) {
      console.error('💥 Error de conexión:', error);
      setError('Error de conexión con el servidor. ¿Está corriendo el backend?');
    } finally {
      setLoading(false);
    }
  };

  const cambiarModo = () => {
    setModo(modo === 'login' ? 'registro' : 'login');
    setError('');
    setFormData({
      nombre: '',
      apellido: '',
      mail: '',
      contrasena: '',
      confirmarContrasena: ''
    });
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose}>✕</button>
        
        <div className="auth-header">
          <h2>{modo === 'login' ? 'Iniciar Sesión' : 'Registrarse'}</h2>
          <p>{modo === 'login' ? 'Ingresa a tu cuenta' : 'Crea tu cuenta de comprador'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {modo === 'registro' && (
            <>
              <div className="auth-input-group">
                <label>Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  placeholder="Tu nombre"
                />
              </div>

              <div className="auth-input-group">
                <label>Apellido</label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  required
                  placeholder="Tu apellido"
                />
              </div>
            </>
          )}

          <div className="auth-input-group">
            <label>Email</label>
            <input
              type="email"
              name="mail"
              value={formData.mail}
              onChange={handleChange}
              required
              placeholder="tu@email.com"
            />
          </div>

          <div className="auth-input-group">
            <label>Contraseña</label>
            <input
              type="password"
              name="contrasena"
              value={formData.contrasena}
              onChange={handleChange}
              required
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          {modo === 'registro' && (
            <div className="auth-input-group">
              <label>Confirmar Contraseña</label>
              <input
                type="password"
                name="confirmarContrasena"
                value={formData.confirmarContrasena}
                onChange={handleChange}
                required
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          )}

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Cargando...' : (modo === 'login' ? 'Iniciar Sesión' : 'Registrarse')}
          </button>
        </form>

        <div className="auth-switch">
          {modo === 'login' ? (
            <p>
              ¿No tienes cuenta?{' '}
              <button onClick={cambiarModo} className="auth-link">
                Regístrate
              </button>
            </p>
          ) : (
            <p>
              ¿Ya tienes cuenta?{' '}
              <button onClick={cambiarModo} className="auth-link">
                Inicia sesión
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
