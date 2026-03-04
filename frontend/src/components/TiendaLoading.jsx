import React from 'react';
import '../styles/tienda-publica.css';

export default function TiendaLoading() {
  return (
    <div className="tienda-loading">
      <div className="loader"></div>
      <p>Cargando tienda...</p>
    </div>
  );
}
