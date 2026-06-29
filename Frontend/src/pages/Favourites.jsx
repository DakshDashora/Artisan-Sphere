import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { BASE_URL } from "../baseurl";
import Toast from "../components/Toast";

export default function Favourites() {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchFavourites();
  }, []);

  const fetchFavourites = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/favourites/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch favorites.");
      }

      const data = await res.json();
      setFavourites(data);
    } catch (err) {
      console.error(err);
      setError(t?.failedToLoadFavourites || "Failed to load favorites.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavourite = async (productId, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/favourites/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId }),
      });

      if (!res.ok) {
        throw new Error("Failed to update favorites.");
      }

      // Remove from list
      setFavourites((prev) => prev.filter((p) => p.id !== productId));
      setToast({ message: "Removed from favorites.", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to update favorites.", type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="as-container as-page" style={{ display: "flex", justifyContent: "center" }}>
        <div className="as-spinner-container">
          <div className="as-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="as-container as-page" style={{ paddingBottom: "40px" }}>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <h1 className="as-section-title">{t?.favorites || "Favorites"}</h1>

      {error && (
        <div className="as-card" style={{ color: "var(--as-danger)", marginBottom: "20px", fontWeight: "600", textAlign: "center" }}>
          {error}
        </div>
      )}

      {favourites.length === 0 ? (
        <div className="as-card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>❤️</div>
          <p className="as-muted" style={{ marginBottom: "24px" }}>
            {t?.noFavouritesYet || "You haven't added any products to your favorites list yet."}
          </p>
          <button className="as-btn as-btn-primary" onClick={() => navigate("/marketplace")}>
            {t?.exploreMarketplace || "Explore Marketplace"}
          </button>
        </div>
      ) : (
        <div className="as-grid">
          {favourites.map((p) => (
            <div key={p.id} className="as-card as-product" style={{ position: "relative" }}>
              
              {/* Floating Heart Icon Button to Remove */}
              <button
                onClick={(e) => handleToggleFavourite(p.id, e)}
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  border: "none",
                  background: "var(--as-surface)",
                  boxShadow: "var(--as-shadow-sm)",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.1rem",
                  zIndex: 2,
                  transition: "transform 0.2s ease",
                }}
                className="as-heart-btn"
                title="Remove from favorites"
              >
                ❤️
              </button>

              <img src={p.image_url} alt={lang === "hi" && p.title_hi ? p.title_hi : p.title} className="as-img" />
              
              <div className="as-product-body">
                <div className="as-product-title">{lang === "hi" && p.title_hi ? p.title_hi : p.title}</div>
                
                <div className="as-product-meta" style={{ marginBottom: "16px" }}>
                  <span className="as-price">₹{p.price}</span>
                </div>
                
                <button
                  className="as-btn"
                  onClick={() => navigate(`/product/${p.id}`)}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {t?.viewProduct || "View Product"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
