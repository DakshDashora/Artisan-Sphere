import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="as-container as-page">
      <div className="as-card" style={{ textAlign: "center" }}>
        <h1 className="as-title">404</h1>
        <p className="as-muted">Oops! Page not found</p>
        <a href="/" className="as-link">Return to Home</a>
      </div>
    </div>
  );
};

export default NotFound;
