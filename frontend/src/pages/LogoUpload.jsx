import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/logo-upload.css';

const LogoUpload = ({ onLogoUpload }) => {
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [logoSize, setLogoSize] = useState(100); // Porcentaje del tamaño
  const navigate = useNavigate();

  const removeWhiteBackground = (dataUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        // Dibujar imagen
        ctx.drawImage(img, 0, 0);
        
        // Obtener datos de píxeles
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Remover píxeles blancos/muy claros (convertir a transparentes)
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Si el píxel es muy claro (blanco, gris claro), lo hacemos transparente
          if (r > 240 && g > 240 && b > 240) {
            data[i + 3] = 0; // Transparencia total
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = dataUrl;
    });
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const processedLogo = await removeWhiteBackground(event.target.result);
        setLogoPreview(processedLogo);
        setLogoFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const processedLogo = await removeWhiteBackground(event.target.result);
          setLogoPreview(processedLogo);
          setLogoFile(file);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleContinue = () => {
    if (logoPreview && logoFile) {
      // Guardamos el logo y su tamaño en localStorage
      localStorage.setItem('storeLogo', logoPreview);
      localStorage.setItem('logoSize', logoSize);
      onLogoUpload(logoPreview);
      navigate('/disenar-pagina');
    }
  };

  const handleSkip = () => {
    localStorage.removeItem('storeLogo');
    localStorage.removeItem('logoSize');
    onLogoUpload(null);
    navigate('/disenar-pagina');
  };

  const removeLogo = () => {
    setLogoPreview(null);
    setLogoFile(null);
  };

  return (
    <div className="logo-upload-container">
      <div className="logo-upload-wrapper">
        <div className="logo-upload-header">
          <h1>Sube tu logo</h1>
          <p>Agrega el logo de tu emprendimiento para que aparezca en la vista previa de tus diseños</p>
        </div>

        {!logoPreview ? (
          <div
            className={`logo-upload-dropzone ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="logo-upload-content">
              <div className="logo-upload-icon">🎨</div>
              <h2>Arrastra tu logo aquí</h2>
              <p>o haz clic para seleccionar un archivo</p>
              <p className="logo-upload-formats">Formatos: PNG, JPG, GIF (máx. 5MB)</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="logo-upload-input"
                id="logo-input"
              />
              <label htmlFor="logo-input" className="logo-upload-label">
                Seleccionar archivo
              </label>
            </div>
          </div>
        ) : (
          <div className="logo-preview-container">
            <div className="logo-size-control">
              <label htmlFor="logo-size-slider">Tamaño del logo:</label>
              <input
                id="logo-size-slider"
                type="range"
                min="30"
                max="120"
                value={logoSize}
                onChange={(e) => setLogoSize(Number(e.target.value))}
                className="logo-size-slider"
              />
              <span className="logo-size-value">{logoSize}px</span>
            </div>

            <div className="logo-preview-section">
              <div className="logo-standalone">
                <h3>Logo solo</h3>
                <div className="logo-preview-box">
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    className="logo-preview-image"
                    style={{ maxHeight: `${logoSize}px` }}
                  />
                </div>
              </div>

              <div className="logo-in-header">
                <h3>Vista previa en header</h3>
                <div className="header-preview" style={{ height: '80px' }}>
                  <div className="header-preview-content">
                    <img 
                      src={logoPreview} 
                      alt="Logo in header" 
                      className="header-preview-logo"
                      style={{ maxHeight: `${logoSize}px` }}
                    />
                    <nav className="header-preview-nav">
                      <span>Productos</span>
                      <span>Sobre</span>
                      <span>Contacto</span>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="logo-actions">
              <button className="btn-remove" onClick={removeLogo}>
                ✕ Cambiar logo
              </button>
            </div>
          </div>
        )}

        <div className="logo-upload-footer">
          <button className="btn-skip" onClick={handleSkip}>
            Saltar por ahora
          </button>
          <button
            className="btn-continue"
            onClick={handleContinue}
            disabled={!logoPreview}
          >
            Continuar →
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoUpload;
