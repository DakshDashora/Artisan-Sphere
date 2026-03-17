import { Link } from "react-router-dom";
// Swapped to our unified AuthContext hook
import { useAuth } from "../contexts/AuthContext"; 
import { useLanguage } from "../contexts/LanguageContext";

export default function ArtisanDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  return (
    <div className="as-container as-page">
      <div className="as-grid-2">
        
        {/* Welcome & Quick Actions Card */}
        <div className="as-card">
          <h2 className="as-title">{t?.welcome || "Welcome"}, {user?.username || "Artisan"}</h2>
          
          <div className="as-row-gap" style={{ marginBottom: "20px" }}>
            <Link className="as-btn" to="/artisan/add-product">
              {t?.addProduct || "Add Product"}
            </Link>
            <Link to="/profile" className="as-btn as-btn-ghost">
              {t?.viewProfile || "View Profile"}
            </Link>
          </div>
          
          <div className="as-tabs">
            <Link to="/artisan/products" className="as-chip">{t?.products || "My Products"}</Link>
            <Link to="/artisan/manage-orders" className="as-chip">{t?.orders || "Orders"}</Link>
            {/* Note: Updated this link path slightly so it doesn't duplicate the products link */}
            <Link to="/artisan/assistant" className="as-chip">{t?.aiAssistant || "AI Assistant"}</Link>
          </div>
        </div>

        {/* Analytics Card */}
        <div className="as-card">
          <h3 className="as-subtitle">{t?.analytics || "Analytics Overview"}</h3>
          
          {/* Note: These are currently hardcoded. When you build the backend endpoint for analytics, 
              we can wrap this in a useEffect to fetch from BASE_URL/analytics! */}
          <div className="as-stats">
            <div className="as-stat">
              <div>📦</div>
              <div>
                <strong>12</strong>
                <span>{t?.totalProducts || "Total Products"}</span>
              </div>
            </div>
            <div className="as-stat">
              <div>🧾</div>
              <div>
                <strong>34</strong>
                <span>{t?.orders || "Orders"}</span>
              </div>
            </div>
            <div className="as-stat">
              <div>💰</div>
              <div>
                <strong>₹2,340</strong>
                <span>{t?.revenue || "Revenue"}</span>
              </div>
            </div>
            <div className="as-stat">
              <div>⭐</div>
              <div>
                <strong>4.8</strong>
                <span>{t?.rating || "Rating"}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}