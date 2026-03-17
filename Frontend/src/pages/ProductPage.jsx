import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BASE_URL } from "../baseurl";
import { useLanguage } from "../contexts/LanguageContext";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const { t } = useLanguage();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${BASE_URL}/products/getproduct/${id}`);
        
        if (!res.ok) {
          throw new Error("Product not found");
        }
        
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="as-container as-page" style={{ display: "flex", justifyContent: "center" }}>
        <div className="as-spinner-container">
          <div className="as-spinner"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="as-container as-page">
        <div className="as-card" style={{ textAlign: "center", color: "var(--as-danger)" }}>
          <h2 className="as-title">{error || "Product not found"}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="as-container as-page">
      
      {/* 2-Column Grid */}
      <div className="as-grid-2" style={{ alignItems: "start" }}>
        
        {/* LHS: Image, Details, Description, and Actions */}
        <div className="as-card">
          <img 
            src={product.image_url} 
            alt={product.title} 
            className="as-img" 
            style={{ maxHeight: "400px", objectFit: "cover", marginBottom: "20px" }} 
          />
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <h1 className="as-title" style={{ margin: 0 }}>{product.title}</h1>
            <span className="as-chip">{t?.categories?.[product.category] || product.category}</span>
          </div>
          
          <p className="as-price" style={{ fontSize: "1.5rem", marginBottom: "20px" }}>
            ₹{product.price}
          </p>
          
          {/* Description Section */}
          <div style={{ marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px solid var(--as-surface)" }}>
            <h3 className="as-strong" style={{ marginBottom: "8px", color: "var(--as-primary)" }}>
              {t?.description || "Description"}
            </h3>
            <p className="as-muted" style={{ lineHeight: "1.6", whiteSpace: "pre-line" }}>
              {product.description || (t?.noDescription || "No description provided.")}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="as-row-gap">
            <button
              onClick={() => console.log("Buy Now:", product.title)}
              className="as-btn"
              style={{ flex: 1, justifyContent: "center" }}
            >
              {t?.buyNow || "Buy Now"}
            </button>
            <button
              onClick={() => console.log("Add to Cart:", product.title)}
              className="as-btn as-btn-ghost"
              style={{ flex: 1, justifyContent: "center" }}
            >
              {t?.addToCart || "Add to Cart"}
            </button>
          </div>
        </div>

        {/* RHS: The Artisan's Story */}
        <div className="as-card" style={{ height: "100%" }}>
          <h2 className="as-subtitle" style={{ color: "var(--as-primary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>✨</span> {t?.fromArtisan || "From the Artisan..."}
          </h2>
          
          {product.story ? (
            <p style={{ lineHeight: "1.8", color: "var(--as-text)", whiteSpace: "pre-line", fontSize: "1.05rem" }}>
              {product.story}
            </p>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--as-muted)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>✍️</div>
              <p>{t?.noStoryYet || "The artisan hasn't shared the story behind this piece yet. Check back soon!"}</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}