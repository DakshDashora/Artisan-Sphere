import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getStyle = () => {
    const isError = type === "error";
    return {
      position: "fixed",
      bottom: "24px",
      right: "24px",
      backgroundColor: isError ? "var(--as-danger)" : "var(--as-success)",
      color: "#ffffff",
      padding: "12px 20px",
      borderRadius: "10px",
      boxShadow: "var(--as-shadow-main)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      gap: "12px",
      fontWeight: "600",
      fontSize: "0.95rem",
      animation: "as-fade-in 0.3s ease forwards"
    };
  };

  return (
    <div className={`as-toast as-toast-${type}`} style={getStyle()}>
      <span>{type === "error" ? "❌" : "✨"}</span>
      <span>{message}</span>
      <button 
        onClick={onClose} 
        style={{
          background: "none",
          border: "none",
          color: "#ffffff",
          cursor: "pointer",
          fontSize: "1.1rem",
          marginLeft: "8px",
          fontWeight: "bold",
          display: "inline-flex"
        }}
      >
        ✕
      </button>
    </div>
  );
}
