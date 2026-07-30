import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BASE_URL } from "../baseurl";
import { useLanguage } from "../contexts/LanguageContext";

export default function SearchResults() {
  const location = useLocation();
  const nav = useNavigate();
  const { t } = useLanguage();
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Extract query from URL
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("query")?.toLowerCase() || "";

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      
      try {
        const response = await fetch(`${BASE_URL}/products/getproducts`);
        if (!response.ok) throw new Error("Failed to fetch products");
        
        const allProducts = await response.json();

        // Simple filter by title or category locally
        const filtered = allProducts.filter(
          (p) =>
            p.title?.toLowerCase().includes(searchQuery) ||
            p.category?.toLowerCase().includes(searchQuery)
        );

        setResults(filtered);
      } catch (err) {
        setError(t?.errorFetchingProducts || "Failed to load search results.");
      } finally {
        setLoading(false);
      }
    };

    if (searchQuery) fetchProducts();
  }, [searchQuery, t]);

  // Handle empty search query gracefully
  if (!searchQuery) {
    return (
      <div className="as-container as-page" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div className="as-card" style={{ textAlign: "center" }}>
          <h1 className="as-section-title" style={{ marginBottom: "12px" }}>
            {t?.searchResults || "Search Results"}
          </h1>
          <p className="as-muted">{t?.noQuery || "Please enter a search query."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="as-container as-page">
      <h1 className="as-section-title">
        {t?.searchResults || "Search Results"}: "{searchQuery}"
      </h1>

      {error && (
        <div style={{ color: "var(--as-danger)", marginBottom: "16px", fontWeight: "600", textAlign: "center" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="as-spinner-container">
          <div className="as-spinner"></div>
        </div>
      ) : results.length === 0 ? (
        <div className="as-card" style={{ textAlign: "center", padding: "40px", color: "var(--as-muted)" }}>
          <p>{t?.noResults || "No products found matching your search."}</p>
        </div>
      ) : (
        <div className="as-grid">
          {results.map((p) => (
            <div key={p.id} className="as-card as-product">
              {/* Updated to match backend schema */}
              <img src={p.image_url} alt={p.title} className="as-img" />
              
              <div className="as-product-body">
                <div className="as-product-title">{p.title}</div>
                
                <div className="as-product-meta" style={{ marginBottom: "16px" }}>
                  <span className="as-chip">{t?.categories?.[p.category] || p.category}</span>
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
      )}
    </div>
  );
}