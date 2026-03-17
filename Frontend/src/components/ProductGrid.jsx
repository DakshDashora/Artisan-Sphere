import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";

export default function ProductGrid({ products }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const nav = useNavigate();

  const handleUpgradeClick = () => {
    const ok = window.confirm(t?.upgradePrompt || "Upgrade to Artisan and add your first product?");
    if (ok) {
      // ⚠️ Placeholder: We will wire this to an actual backend API call later!
      alert("Upgrade API call goes here!"); 
      nav("/artisan/add-product");
    }
  };

  // Graceful fallback if no products match the filters
  if (!products || products.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "var(--as-muted)" }}>
        {t?.noProductsFound || "No products found matching your criteria."}
      </div>
    );
  }

  return (
    <div className="as-grid">
      {products.map((p) => (
        <div key={p.id} className="as-card as-product">
          
          <img src={p.image_url} alt={p.title} className="as-img" />
          
          <div className="as-product-body">
            <div className="as-product-title">{p.title}</div>
            
            <div className="as-product-meta">
              <span className="as-chip">
                {t?.categories?.[p.category] || p.category}
              </span>
              <span className="as-price">₹{p.price}</span>
            </div>

            <div className="as-row-gap">
              <Link to={`/product/${p.id}`} className="as-btn">
                {t?.buy || "Buy"}
              </Link>
              
              {user?.role === "customer" && (
                <button
                  className="as-btn as-btn-ghost"
                  onClick={handleUpgradeClick}
                >
                  {t?.upgradeToArtisan || "Upgrade to Artisan"}
                </button>
              )}
            </div>
          </div>
          
        </div>
      ))}
    </div>
  );
}