import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error("404:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="as-container as-page">
      <div className="as-card" style={{ textAlign: "center" }}>
        <h1 className="as-title">404</h1>
        <p className="as-muted">{t?.pageNotFound || "Oops! Page not found"}</p>
        <a href="/" className="as-btn as-btn-primary" style={{ marginTop: "16px", display: "inline-flex" }}>
          {t?.returnToHome || "Return to Home"}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
