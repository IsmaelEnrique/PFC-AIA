import "./preview-modern.css";

export default function PreviewModern({ logo }) {
  return (
    <div className="preview-modern">
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
          <div className="pm-nav-item"></div>
        </div>
      </div>
      <div className="pm-hero">
        <div className="pm-hero-text">
          <div className="pm-title"></div>
          <div className="pm-subtitle"></div>
          <div className="pm-btn"></div>
        </div>
        <div className="pm-hero-image"></div>
      </div>
      <div className="pm-grid">
        <div className="pm-card">
          <div className="pm-img"></div>
          <div className="pm-card-text"></div>
        </div>
        <div className="pm-card">
          <div className="pm-img"></div>
          <div className="pm-card-text"></div>
        </div>
        <div className="pm-card">
          <div className="pm-img"></div>
          <div className="pm-card-text"></div>
        </div>
      </div>
    </div>
  );
}
    