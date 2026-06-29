import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { BASE_URL } from "../baseurl";
import Toast from "../components/Toast";

export default function Cart() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Custom Confirmation Dialog State
  const [itemToRemove, setItemToRemove] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/cart/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch cart items.");
      }

      const data = await res.json();
      setCartItems(data);
    } catch (err) {
      console.error(err);
      setError(t?.failedToLoadCart || "Failed to load shopping cart.");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQty) => {
    if (newQty < 1) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/cart/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: newQty }),
      });

      if (!res.ok) {
        throw new Error("Failed to update quantity.");
      }

      setCartItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, quantity: newQty } : item))
      );
    } catch (err) {
      console.error(err);
      setToast({ message: t?.updateQtyFailed || "Failed to update quantity.", type: "error" });
    }
  };

  const confirmRemoveItem = async (itemId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/cart/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to remove item.");
      }

      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
      setToast({ message: "Item removed from cart.", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({ message: t?.removeItemFailed || "Failed to remove item.", type: "error" });
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/orders/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to place order.");
      }

      setToast({ message: t?.orderPlacedSuccess || "Order placed successfully! Thank you for supporting local artisans.", type: "success" });
      setTimeout(() => {
        navigate("/customer/orders");
      }, 2000);
    } catch (err) {
      console.error(err);
      setToast({ message: err.message || "Checkout failed. Please try again.", type: "error" });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
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

      {/* Reusable custom confirm popup */}
      {itemToRemove && (
        <div className="as-modal-backdrop" style={backdropStyle}>
          <div className="as-card" style={{ maxWidth: "400px", padding: "24px" }}>
            <h3 className="as-title" style={{ marginTop: 0 }}>
              {t?.confirmRemoveItem || "Remove Item?"}
            </h3>
            <p className="as-muted" style={{ marginBottom: "20px" }}>
              {t?.confirmRemoveItemText || "Are you sure you want to remove this item from your cart?"}
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button className="as-btn" onClick={() => setItemToRemove(null)}>
                {t?.cancel || "Cancel"}
              </button>
              <button
                className="as-btn as-btn-danger"
                onClick={() => {
                  confirmRemoveItem(itemToRemove);
                  setItemToRemove(null);
                }}
              >
                {t?.remove || "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="as-section-title">{t?.customerCart || "Shopping Cart"}</h1>

      {error && (
        <div className="as-card" style={{ color: "var(--as-danger)", marginBottom: "20px", fontWeight: "600", textAlign: "center" }}>
          {error}
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="as-card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🛒</div>
          <p className="as-muted" style={{ marginBottom: "24px" }}>
            {t?.cartEmpty || "Your cart is currently empty."}
          </p>
          <button className="as-btn as-btn-primary" onClick={() => navigate("/marketplace")}>
            {t?.exploreMarketplace || "Explore Marketplace"}
          </button>
        </div>
      ) : (
        <div className="as-grid-2" style={{ alignItems: "start", gap: "32px" }}>
          {/* Cart Items List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {cartItems.map((item) => (
              <div key={item.id} className="as-card" style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                <img
                  src={item.product.image_url}
                  alt={lang === "hi" && item.product.title_hi ? item.product.title_hi : item.product.title}
                  className="as-img"
                  style={{ width: "90px", height: "90px", objectFit: "cover", borderRadius: "0.75rem" }}
                />
                
                <div style={{ flex: 1 }}>
                  <h3 className="as-strong" style={{ fontSize: "1.1rem", marginBottom: "4px" }}>
                    {lang === "hi" && item.product.title_hi ? item.product.title_hi : item.product.title}
                  </h3>
                  <p className="as-muted" style={{ fontSize: "0.85rem", marginBottom: "8px" }}>
                    {t?.categories?.[item.product.category] || item.product.category}
                  </p>
                  <p className="as-price" style={{ fontSize: "1.1rem" }}>
                    ₹{item.product.price}
                  </p>
                </div>

                {/* Quantity Editor Controls */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button
                    className="as-btn"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    style={{ padding: "6px 12px", borderRadius: "6px", minWidth: "32px" }}
                  >
                    -
                  </button>
                  <span style={{ fontWeight: "bold", fontSize: "1rem", minWidth: "24px", textAlign: "center" }}>
                    {item.quantity}
                  </span>
                  <button
                    className="as-btn"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    style={{ padding: "6px 12px", borderRadius: "6px", minWidth: "32px" }}
                  >
                    +
                  </button>
                </div>

                {/* Remove button */}
                <button
                  className="as-btn as-btn-danger"
                  onClick={() => setItemToRemove(item.id)}
                  style={{ padding: "8px 12px", borderRadius: "8px" }}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          {/* Cart Summary Card */}
          <div className="as-card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h2 className="as-subtitle" style={{ borderBottom: "1px solid var(--as-border)", paddingBottom: "12px", marginBottom: 0 }}>
              {t?.orderSummary || "Order Summary"}
            </h2>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.05rem" }}>
              <span className="as-muted">{t?.subtotal || "Subtotal"}</span>
              <span style={{ fontWeight: "600" }}>₹{calculateTotal()}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.05rem" }}>
              <span className="as-muted">{t?.delivery || "Delivery"}</span>
              <span style={{ color: "var(--as-success)", fontWeight: "600" }}>{t?.free || "FREE"}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.25rem", borderTop: "1px solid var(--as-border)", paddingTop: "16px", marginTop: "8px" }}>
              <span className="as-strong">{t?.total || "Total"}</span>
              <span className="as-price">₹{calculateTotal()}</span>
            </div>

            <button
              className="as-btn as-btn-primary"
              onClick={handleCheckout}
              disabled={checkoutLoading}
              style={{ width: "100%", justifyContent: "center", marginTop: "12px", height: "48px" }}
            >
              {checkoutLoading ? t?.submitting || "Placing Order..." : t?.checkout || "Place Order"}
            </button>
          </div>
        </div>
      )}
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
