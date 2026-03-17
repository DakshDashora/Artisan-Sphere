import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { BASE_URL } from "../baseurl";

export default function ExploreMarketplace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const { t } = useLanguage();
  const nav = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch all products from your FastAPI backend
        const response = await fetch(`${BASE_URL}/products/getproducts`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch products.");
        }

        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Could not load marketplace items.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Group products by category
  const grouped = products.reduce((acc, p) => {
    const cat = p.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  return (
    <div className="as-container as-page">
      <h1 className="as-section-title">{t?.exploreMarketplace || "Explore Marketplace"}</h1>

      {error && (
        <div style={{ color: "var(--as-danger)", marginBottom: "16px", fontWeight: "600", textAlign: "center" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="as-spinner-container">
          <div className="as-spinner"></div>
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="as-card" style={{ textAlign: "center", padding: "40px", color: "var(--as-muted)" }}>
          {t?.noProductsFound || "No products available in the marketplace right now."}
        </div>
      ) : (
        Object.keys(grouped).map((cat) => (
          <div key={cat} className="as-category-section" style={{ marginBottom: "40px" }}>
            
            <h2 className="as-title" style={{ marginBottom: "20px", color: "var(--as-primary)", textTransform: "capitalize" }}>
              {t?.categories?.[cat] || cat}
            </h2>
            
            {/* Swapped to our standard as-grid for perfect responsive card layouts */}
            <div className="as-grid">
              {grouped[cat].map((p) => (
                <div key={p.id} className="as-card as-product">
                  {/* Updated to image_url */}
                  <img src={p.image_url} alt={p.title} className="as-img" />
                  
                  <div className="as-product-body">
                    <div className="as-product-title">{p.title}</div>
                    
                    <div className="as-product-meta" style={{ marginBottom: "16px" }}>
                      <span className="as-price">₹{p.price}</span>
                    </div>
                    
                    <button
                      className="as-btn"
                      onClick={() => nav(`/product/${p.id}`)}
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      {t?.viewProduct || "View Product"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        ))
      )}
    </div>
  );
}