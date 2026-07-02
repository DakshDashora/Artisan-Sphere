import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { BASE_URL } from "../baseurl";
import Toast from "./Toast";

export default function ProductGrid({ products }) {
  const { t, lang } = useLanguage();
  const { user, login } = useAuth();
  const nav = useNavigate();

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleUpgradeClick = () => {
    setShowUpgradeModal(true);
  };

  const handleUpgradeConfirm = async () => {
    setUpgradeLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/auth/upgrade`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error("Failed to upgrade to Artisan.");
      }
      const data = await res.json();
      login(data, token);
      setToast({ message: t?.upgradeSuccess || "Successfully upgraded to Artisan! Welcome! ✨", type: "success" });
      setShowUpgradeModal(false);
      setTimeout(() => {
        nav("/artisan/add-product");
      }, 1500);
    } catch (err) {
      console.error(err);
      setToast({ message: err.message || "Failed to upgrade profile.", type: "error" });
    } finally {
      setUpgradeLoading(false);
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
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {showUpgradeModal && (
        <div className="as-modal-backdrop" style={backdropStyle}>
          <div className="as-card" style={{ maxWidth: "450px", padding: "24px", textAlign: "center" }}>
            <h3 className="as-title" style={{ marginTop: 0 }}>
              {t?.becomeArtisan || "Become an Artisan"}
            </h3>
            <p className="as-muted" style={{ marginBottom: "24px", lineHeight: "1.5" }}>
              {t?.upgradePrompt || "Are you sure you want to upgrade your account to Artisan status? This will allow you to add products, modify details, craft stories, and manage customer orders."}
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button className="as-btn" onClick={() => setShowUpgradeModal(false)} disabled={upgradeLoading}>
                {t?.cancel || "Cancel"}
              </button>
              <button
                className="as-btn as-btn-primary"
                onClick={handleUpgradeConfirm}
                disabled={upgradeLoading}
              >
                {upgradeLoading ? (t?.saving || "Upgrading...") : (t?.submit || "Upgrade")}
              </button>
            </div>
          </div>
        </div>
      )}

      {products.map((p) => (
        <div key={p.id} className="as-card as-product">
          
          <img src={p.image_url} alt={lang === "hi" && p.title_hi ? p.title_hi : p.title} className="as-img" />
          
          <div className="as-product-body">
            <div className="as-product-title">{lang === "hi" && p.title_hi ? p.title_hi : p.title}</div>
            
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
                  className="as-btn"
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

const backdropStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};