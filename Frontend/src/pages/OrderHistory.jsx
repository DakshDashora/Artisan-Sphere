import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { BASE_URL } from "../baseurl";

export default function OrderHistory() {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/orders/buyer`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch order history.");
      }

      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
      setError(t?.failedToLoadOrders || "Failed to load order history.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return { backgroundColor: "var(--as-success)", color: "#ffffff" };
      case "shipped":
        return { backgroundColor: "var(--as-primary)", color: "var(--as-bg)" };
      case "processing":
        return { backgroundColor: "var(--as-muted)", color: "#ffffff" };
      case "cancelled":
        return { backgroundColor: "var(--as-danger)", color: "#ffffff" };
      default:
        return { backgroundColor: "var(--as-border)", color: "var(--as-text)" };
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
    <div className="as-container as-page" style={{ paddingBottom: "120px" }}>
      <h1 className="as-section-title">{t?.customerOrders || "Order History"}</h1>

      {error && (
        <div className="as-card" style={{ color: "var(--as-danger)", marginBottom: "20px", fontWeight: "600", textAlign: "center" }}>
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="as-card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📦</div>
          <p className="as-muted" style={{ marginBottom: "24px" }}>
            {t?.noOrdersYet || "You haven't placed any orders yet."}
          </p>
          <button className="as-btn as-btn-primary" onClick={() => navigate("/marketplace")}>
            {t?.exploreMarketplace || "Explore Marketplace"}
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {orders.map((order) => (
            <div key={order.id} className="as-card" style={{ padding: "24px" }}>
              {/* Order Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "16px",
                  borderBottom: "1px solid var(--as-border)",
                  paddingBottom: "16px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <h3 className="as-strong" style={{ fontSize: "1.1rem", marginBottom: "4px" }}>
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </h3>
                  <span className="as-muted" style={{ fontSize: "0.85rem" }}>
                    {t?.orderedOn || "Ordered on"}: {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <span className="as-price" style={{ fontSize: "1.25rem" }}>
                    ₹{order.total_price}
                  </span>
                  
                  {/* Neumorphic Status Chip */}
                  <span
                    className="as-chip"
                    style={{
                      ...getStatusStyle(order.status),
                      fontWeight: "bold",
                      textTransform: "capitalize",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      boxShadow: "var(--as-shadow-sm)",
                    }}
                  >
                    {t?.[order.status] || order.status}
                  </span>
                </div>
              </div>

              {/* Order Items List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="as-card-flat"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 16px",
                    }}
                  >
                    <div>
                      <div className="as-strong" style={{ fontSize: "0.95rem" }}>
                        {lang === "hi" && item.product_title_hi ? item.product_title_hi : item.product_title}
                      </div>
                      <div className="as-muted" style={{ fontSize: "0.8rem", marginTop: "2px" }}>
                        {t?.qty || "Qty"}: {item.quantity} × ₹{item.price_at_purchase}
                      </div>
                    </div>
                    <div style={{ fontWeight: "600" }}>
                      ₹{item.quantity * item.price_at_purchase}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
