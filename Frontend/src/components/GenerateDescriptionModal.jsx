import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { BASE_URL } from "../baseurl";

export default function GenerateDescriptionModal({ product, onClose }) {
  const { t, lang } = useLanguage();
  const [descriptions, setDescriptions] = useState({ en: [], hi: [] });
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [customDescription, setCustomDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Translate English text to Hindi
  const translateDescription = async (text) => {
    try {
      const res = await fetch(`${BASE_URL}/api/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, target_language: "hi" }),
      });
      const data = await res.json();
      return data.translated_text || "";
    } catch (err) {
      console.error("Translation error:", err);
      return "";
    }
  };

  // Fetch AI descriptions and translate
  const fetchDescriptions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/api/generate-description`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: product.title, 
          image_url: product.image_url // 👈 Updated to match FastAPI schema
        }),
      });
      
      if (!res.ok) throw new Error("Failed to generate AI descriptions.");
      
      const data = await res.json();
      const englishDescriptions = data.aiDescription || [];

      // Translate to Hindi
      const hindiDescriptions = await Promise.all(
        englishDescriptions.map((desc) => translateDescription(desc))
      );

      // Save to localStorage to cache it
      const stored = JSON.parse(localStorage.getItem("product_descriptions") || "{}");
      stored[product.id] = { en: englishDescriptions, hi: hindiDescriptions };
      localStorage.setItem("product_descriptions", JSON.stringify(stored));

      setDescriptions({ en: englishDescriptions, hi: hindiDescriptions });
    } catch (err) {
      console.error(err);
      setError("Failed to fetch descriptions. Ensure your AI backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // Save selected/custom description to the custom backend
  const handleSave = async () => {
    let finalDescription = "";

    if (customDescription.trim()) {
      finalDescription = customDescription.trim();
    } else if (selectedIndex !== null) {
      // Always save the English version to the database as the source of truth
      finalDescription = descriptions.en[selectedIndex];
    }

    if (!finalDescription) {
      setError("Select or add a description first!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      
      // 👈 Calling your FastAPI update endpoint
      const res = await fetch(`${BASE_URL}/products/updateproduct/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ description: finalDescription }),
      });

      if (!res.ok) {
        throw new Error("Failed to save description to database.");
      }

      onClose(); // Close the modal on success
      
    } catch (err) {
      console.error(err);
      setError("Failed to save description.");
    } finally {
      setLoading(false);
      localStorage.removeItem("product_descriptions");
    }
  };

  // Get display text based on active language
  const getDisplayText = (idx) =>
    lang === "hi" ? descriptions.hi[idx] : descriptions.en[idx];

  return (
    <div className="as-modal-backdrop" style={backdropStyle}>
      <div className="as-card" style={modalStyle}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 className="as-title" style={{ margin: 0 }}>
            {t?.generateDescription || "Generate Description"} - {product.title}
          </h2>
          <button className="as-icon-btn" onClick={onClose} style={{ width: "32px", height: "32px", fontSize: "1rem" }}>
            ✕
          </button>
        </div>

        {error && (
          <div style={{ color: "var(--as-danger)", marginBottom: "16px", fontWeight: "600" }}>
            {error}
          </div>
        )}

        {!descriptions.en.length && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <button className="as-btn" onClick={fetchDescriptions} disabled={loading}>
              {loading ? (t?.submitting || "Generating...") : "Generate with AI ✨"}
            </button>
          </div>
        )}

        {descriptions.en.length > 0 && (
          <div className="as-row-gap" style={{ flexDirection: "column", alignItems: "stretch", gap: "16px" }}>
            
            {descriptions.en.map((_, idx) => (
              <label 
                key={idx} 
                className="as-card" 
                style={{ 
                  display: "flex", 
                  gap: "12px", 
                  cursor: "pointer", 
                  padding: "12px",
                  border: selectedIndex === idx ? "2px solid var(--as-primary)" : "2px solid transparent"
                }}
              >
                <input
                  type="radio"
                  name="description"
                  checked={selectedIndex === idx}
                  onChange={() => {
                    setSelectedIndex(idx);
                    setCustomDescription(""); // Clear custom if they pick a generated one
                  }}
                  style={{ accentColor: "var(--as-primary)", marginTop: "4px" }}
                />
                <span style={{ color: "var(--as-text)" }}>{getDisplayText(idx)}</span>
              </label>
            ))}

            <div className="as-field" style={{ marginTop: "8px" }}>
              <label className="as-label">Or write your own:</label>
              <textarea
                className="as-input-field"
                rows="3"
                placeholder={lang === "hi" ? "अपना विवरण जोड़ें..." : "Type custom description here..."}
                value={customDescription}
                onChange={(e) => {
                  setCustomDescription(e.target.value);
                  setSelectedIndex(null); // Uncheck radios if they start typing
                }}
                style={{ resize: "vertical" }}
              />
            </div>

            <button 
              className="as-btn" 
              onClick={handleSave} 
              disabled={loading || (!customDescription.trim() && selectedIndex === null)}
              style={{ justifyContent: "center", marginTop: "8px" }}
            >
              {loading ? (t?.submitting || "Saving...") : "Save Description"}
            </button>
            
          </div>
        )}
      </div>
    </div>
  );
}

// Simple inline styles to ensure the modal floats perfectly in the center of the screen
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

const modalStyle = {
  width: "90%",
  maxWidth: "500px",
  maxHeight: "90vh",
  overflowY: "auto",
  padding: "24px",
};