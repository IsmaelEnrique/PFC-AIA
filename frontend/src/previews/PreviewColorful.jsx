import "./preview-colorful.css";

export default function PreviewColorful({ logo }) {
  return (
    <div className="preview-colorful">
      <div className="pc-header">
        {logo ? (
          <img src={logo} alt="Logo" className="pc-logo-img" />
        ) : (
          <div className="pc-logo"></div>
        )}
        <div className="pc-title"></div>
      </div>
      <div className="pc-description">Aquí se verá tu descripción</div>
      <div className="pc-products">
        <div className="pc-product">
          <div className="pc-product-img"></div>
          <div className="pc-product-text"></div>
        </div>
        <div className="pc-product">
          <div className="pc-product-img"></div>
          <div className="pc-product-text"></div>
        </div>
      </div>
    </div>
  );
}