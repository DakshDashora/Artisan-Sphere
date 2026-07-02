import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; 
import { useLanguage } from "../contexts/LanguageContext";
import { BASE_URL } from "../baseurl";

export default function ArtisanDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [analytics, setAnalytics] = useState({
    total_products: 0,
    orders: 0,
    revenue: 0,
    rating: 4.8,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/api/artisan/analytics`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data);
        }
      } catch (err) {
        console.error("Failed to load artisan analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAnalytics();
    }
  }, [user]);

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
            <Link to="/profile" className="as-btn">
              {t?.viewProfile || "View Profile"}
            </Link>
          </div>
          
          <div className="as-tabs">
            <Link to="/artisan/products" className="as-chip">{t?.products || "My Products"}</Link>
            <Link to="/artisan/manage-orders" className="as-chip">{t?.orders || "Orders"}</Link>
            <Link to="/artisan/assistant" className="as-chip">{t?.aiAssistant || "AI Assistant"}</Link>
          </div>
        </div>

        {/* Analytics Card */}
        <div className="as-card">
          <h3 className="as-subtitle">{t?.analytics || "Analytics Overview"}</h3>
          
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
              <div className="as-spinner"></div>
            </div>
          ) : (
            <div className="as-stats">
              <div className="as-stat">
                <div>📦</div>
                <div>
                  <strong>{analytics.total_products}</strong>
                  <span>{t?.totalProducts || "Total Products"}</span>
                </div>
              </div>
              <div className="as-stat">
                <div>🧾</div>
                <div>
                  <strong>{analytics.orders}</strong>
                  <span>{t?.orders || "Orders"}</span>
                </div>
              </div>
              <div className="as-stat">
                <div>💰</div>
                <div>
                  <strong>₹{analytics.revenue}</strong>
                  <span>{t?.revenue || "Revenue"}</span>
                </div>
              </div>
              <div className="as-stat">
                <div>⭐</div>
                <div>
                  <strong>{analytics.rating}</strong>
                  <span>{t?.rating || "Rating"}</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}