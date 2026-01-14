// src/pages/Home.jsx
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <main className="home">
      <section className="hero container">
        <div className="hero-inner">
          <div className="hero-copy">
            <h1>
              Crea tu tienda online <span className="accent">gratis</span> y en un instante
            </h1>
            <p className="lead">
              Simple, efectiva y completamente personalizable. Diseñá tu tienda y comenzá a vender hoy.
            </p>

            <div className="hero-ctas">
              <button className="btn btn-primary" onClick={() => navigate("/register")}>
                Comenza ahora
              </button>
              <button className="btn btn-ghost" onClick={() => navigate("/login")}>
                ¿Ya sos parte? Ingresar
              </button>
            </div>

            <ul className="benefits">
              <li><b>Sencillo:</b> interfaz pensada para emprendedores.</li>
              <li><b>Personalizable:</b> elegí colores, tipografía y estructura.</li>
              <li><b>Sin costo inicial:</b> comenzá sin medios de pago obligatorios.</li>
            </ul>
          </div>

          <div className="card-mock">
            <h3>Nombre de tu marca</h3>
            <p>Tu producto destacado aquí</p>
            <div className="product-sample"></div>
          </div>
        </div>
      </section>
    </main>
  );
}
