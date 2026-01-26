import "./preview-minimal.css";

export default function PreviewMinimal({ logo }) {
  return (
    <div className="preview-minimal">
      <div className="pm-header">
        {logo ? (
          <img src={logo} alt="Logo" className="pm-logo-img" />
        ) : (
          <div className="pm-logo"></div>
        )}
        <div className="pm-nav">
          <div className="pm-nav-item"></div>
          <div className="pm-nav-item"></div>
          <div className="pm-nav-item"></div>
        </div>
      </div>
      <div className="pm-hero">
        <div className="pm-hero-text">
          <div className="pm-title"></div>
          <div className="pm-subtitle"></div>
        </div>
        <div className="pm-btn"></div>
      </div>
      <div className="pm-products">
        <div className="pm-product">
          <div className="pm-img"></div>
          <div className="pm-text"></div>
        </div>
        <div className="pm-product">
          <div className="pm-img"></div>
          <div className="pm-text"></div>
        </div>
      </div>
    </div>
  );
}
