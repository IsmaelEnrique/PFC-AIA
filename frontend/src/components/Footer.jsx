import { useState, useEffect } from "react";

export default function Footer() {
  const [modal, setModal] = useState(null);

  useEffect(() => {
    document.body.style.overflow = modal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [modal]);

  return (
    <>
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-left">
            <span>© 2026 Emprendify</span>
          </div>
          <div className="footer-right">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setModal("terms");
              }}
            >
              Términos y Privacidad
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setModal("contact");
              }}
            >
              Contacto
            </a>
          </div>
        </div>
      </footer>

      {modal === "terms" && (
        <div className="terms-overlay" onClick={() => setModal(null)}>
          <div className="terms-card" onClick={(e) => e.stopPropagation()}>
            <button className="terms-close" onClick={() => setModal(null)}>
              ✕
            </button>
            <h1>Términos y Condiciones de Uso</h1>
            <h2>1. Aceptación de los términos</h2>
            <p>Al acceder y utilizar este sitio web, el usuario acepta los presentes Términos y Condiciones. Si no está de acuerdo con alguno de ellos, deberá abstenerse de utilizar la plataforma.</p>
            <h2>2. Uso de la plataforma</h2>
            <p>La plataforma tiene como finalidad permitir la compra y venta de productos de manera online. El usuario se compromete a utilizar el sitio de forma responsable, respetando la legislación vigente y sin realizar actividades que puedan afectar el normal funcionamiento del servicio.</p>
            <h2>3. Información de la cuenta</h2>
            <p>El usuario es responsable de la veracidad de la información proporcionada al registrarse y de mantener la confidencialidad de sus credenciales de acceso.</p>
            <h2>4. Pedidos y disponibilidad</h2>
            <p>Todos los pedidos realizados quedan sujetos a la disponibilidad de stock y a la confirmación por parte del vendedor. La recepción de un pedido no implica su aceptación automática.</p>
            <h2>5. Precios</h2>
            <p>Los precios publicados son los vigentes al momento de la compra y podrán modificarse sin previo aviso. Los cambios no afectarán a los pedidos que ya hayan sido confirmados.</p>
            <h2>6. Responsabilidad</h2>
            <p>La plataforma realiza sus mejores esfuerzos para mantener la información actualizada y el servicio disponible. Sin embargo, no garantiza la ausencia de errores técnicos, interrupciones temporales o imprecisiones en la información publicada.</p>
            <h2>7. Protección de datos</h2>
            <p>Los datos personales proporcionados por los usuarios serán utilizados únicamente para la gestión de la cuenta, el procesamiento de pedidos y las comunicaciones relacionadas con el servicio, de acuerdo con la normativa aplicable.</p>
            <h2>8. Modificaciones</h2>
            <p>La plataforma podrá actualizar estos Términos y Condiciones cuando resulte necesario. Las modificaciones entrarán en vigencia desde su publicación en el sitio web.</p>
            <h2>9. Contacto</h2>
            <p>Ante cualquier consulta relacionada con estos Términos y Condiciones, el usuario podrá comunicarse a través de los medios de contacto disponibles en la plataforma.</p>
          </div>
        </div>
      )}

      {modal === "contact" && (
        <div className="terms-overlay" onClick={() => setModal(null)}>
          <div className="terms-card" onClick={(e) => e.stopPropagation()}>
            <button className="terms-close" onClick={() => setModal(null)}>
              ✕
            </button>
            <h1>Contacto</h1>
            <p>Si querés comunicarte con nosotros, podés usar los siguientes medios:</p>
            <ul>
              <li>Email: ayuda@emprendify.com</li>
              <li>Teléfono: +54 342 1111-2222</li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

