import { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { BASE_URL } from "../baseurl";
import Toast from "../components/Toast";

export default function ManageOrders() {
  const { t, lang } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchIncomingOrders();
  }, []);

  const fetchIncomingOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/orders/artisan`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch incoming orders.");
      }

      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
      setError(t?.failedToLoadIncomingOrders || "Failed to load incoming orders.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to update order status.");
      }

      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
      );
      
      setToast({ message: t?.orderStatusUpdatedSuccess || "Order status updated successfully!", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({ message: err.message || "Failed to update order status.", type: "error" });
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadgeStyle = (status) => {
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
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <h1 className="as-section-title">{t?.manageOrders || "Manage Orders"}</h1>

      {error && (
        <div className="as-card" style={{ color: "var(--as-danger)", marginBottom: "20px", fontWeight: "600", textAlign: "center" }}>
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="as-card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📬</div>
          <p className="as-muted">
            {t?.noIncomingOrders || "You haven't received any orders for your products yet."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {orders.map((order) => {
            const artisanTotal = order.items.reduce((sum, item) => sum + item.price_at_purchase * item.quantity, 0);

            return (
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
                    <div style={{ textAlign: "right" }}>
                      <span className="as-muted" style={{ fontSize: "0.8rem", display: "block" }}>
                        {t?.yourSubtotal || "Your Subtotal"}
                      </span>
                      <span className="as-price" style={{ fontSize: "1.2rem" }}>
                        ₹{artisanTotal}
                      </span>
                    </div>

                    <span
                      className="as-chip"
                      style={{
                        ...getStatusBadgeStyle(order.status),
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

                {/* Items in this order */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
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

                {/* Action Controls to update order status */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    borderTop: "1px solid var(--as-border)",
                    paddingTop: "16px",
                    flexWrap: "wrap",
                  }}
                >
                  <span className="as-strong" style={{ fontSize: "0.9rem" }}>
                    {t?.updateStatus || "Update Order Status"}:
                  </span>

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {["processing", "shipped", "delivered", "cancelled"].map((st) => (
                      <button
                        key={st}
                        className={`as-btn ${order.status === st ? "as-btn-primary" : ""}`}
                        onClick={() => handleStatusChange(order.id, st)}
                        disabled={updatingId === order.id}
                        style={{
                          padding: "6px 12px",
                          fontSize: "0.8rem",
                          borderRadius: "6px",
                          textTransform: "capitalize",
                        }}
                      >
                        {t?.[st] || st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
