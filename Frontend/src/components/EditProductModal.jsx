import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { BASE_URL } from "../baseurl";
import Toast from "./Toast";

export default function EditProductModal({ product, onClose, onSave }) {
  const { t } = useLanguage();
  const [title, setTitle] = useState(product.title || "");
  const [titleHi, setTitleHi] = useState(product.title_hi || "");
  const [price, setPrice] = useState(product.price || "");
  const [category, setCategory] = useState(product.category || "other");
  const [description, setDescription] = useState(product.description || "");
  const [descriptionHi, setDescriptionHi] = useState(product.description_hi || "");
  const [story, setStory] = useState(product.story || "");
  const [storyHi, setStoryHi] = useState(product.story_hi || "");
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !price) {
      setToast({ message: t?.fillAllFields || "Please fill in all required fields.", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/products/updateproduct/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          title_hi: titleHi || null,
          price: parseFloat(price),
          category,
          description,
          description_hi: descriptionHi || null,
          story,
          story_hi: storyHi || null,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update product details.");
      }

      const updatedProduct = await res.json();
      onSave(updatedProduct);
      setToast({ message: t?.productUpdatedSuccess || "Product updated successfully!", type: "success" });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to save product changes.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="as-modal-backdrop" style={backdropStyle}>
      <div className="as-card" style={modalStyle}>
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 className="as-title" style={{ margin: 0 }}>
            {t?.editProduct || "Edit Product"}
          </h2>
          <button className="as-icon-btn" onClick={onClose} style={{ width: "32px", height: "32px", fontSize: "1rem" }}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Title */}
          <div className="as-field" style={{ margin: 0 }}>
            <label className="as-label">{t?.productTitle || "Product Title (EN)"} *</label>
            <input
              type="text"
              className="as-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: "100%", background: "var(--as-bg)", border: "1px solid var(--as-border)" }}
              required
            />
          </div>

          {/* Title Hindi */}
          <div className="as-field" style={{ margin: 0 }}>
            <label className="as-label">{t?.productTitleHindi || "Product Title (Hindi)"}</label>
            <input
              type="text"
              className="as-input"
              value={titleHi}
              onChange={(e) => setTitleHi(e.target.value)}
              placeholder="छोड़ दें (Auto-translate on save)"
              style={{ width: "100%", background: "var(--as-bg)", border: "1px solid var(--as-border)" }}
            />
          </div>

          <div style={{ display: "flex", gap: "16px", width: "100%" }}>
            {/* Price */}
            <div className="as-field" style={{ margin: 0, flex: 1 }}>
              <label className="as-label">{t?.productPrice || "Price (₹)"} *</label>
              <input
                type="number"
                step="0.01"
                className="as-input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={{ width: "100%", background: "var(--as-bg)", border: "1px solid var(--as-border)" }}
                required
              />
            </div>

            {/* Category */}
            <div className="as-field" style={{ margin: 0, flex: 1 }}>
              <label className="as-label">{t?.filtersCategory || "Category"}</label>
              <select
                className="as-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ 
                  width: "100%", 
                  background: "var(--as-bg)", 
                  border: "1px solid var(--as-border)",
                  height: "44px",
                  padding: "0 12px",
                  borderRadius: "0.875rem",
                  fontFamily: "inherit"
                }}
              >
                {["textile", "pottery", "wood", "metal", "painting", "stone", "other"].map((cat) => (
                  <option key={cat} value={cat}>
                    {t?.categories?.[cat] || cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="as-field" style={{ margin: 0 }}>
            <label className="as-label">{t?.productDescription || "Description (EN)"}</label>
            <textarea
              className="as-input"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: "100%", background: "var(--as-bg)", border: "1px solid var(--as-border)" }}
            />
          </div>

          {/* Description Hindi */}
          <div className="as-field" style={{ margin: 0 }}>
            <label className="as-label">{t?.productDescriptionHindi || "Description (Hindi)"}</label>
            <textarea
              className="as-input"
              rows="3"
              value={descriptionHi}
              onChange={(e) => setDescriptionHi(e.target.value)}
              placeholder="छोड़ दें (Auto-translate on save)"
              style={{ width: "100%", background: "var(--as-bg)", border: "1px solid var(--as-border)" }}
            />
          </div>

          {/* Story */}
          <div className="as-field" style={{ margin: 0 }}>
            <label className="as-label">{t?.story || "Story behind the craft (EN)"}</label>
            <textarea
              className="as-input"
              rows="3"
              value={story}
              onChange={(e) => setStory(e.target.value)}
              style={{ width: "100%", background: "var(--as-bg)", border: "1px solid var(--as-border)" }}
            />
          </div>

          {/* Story Hindi */}
          <div className="as-field" style={{ margin: 0 }}>
            <label className="as-label">{t?.storyHindi || "Story behind the craft (Hindi)"}</label>
            <textarea
              className="as-input"
              rows="3"
              value={storyHi}
              onChange={(e) => setStoryHi(e.target.value)}
              placeholder="छोड़ दें (Auto-translate on save)"
              style={{ width: "100%", background: "var(--as-bg)", border: "1px solid var(--as-border)" }}
            />
          </div>

          <button
            type="submit"
            className="as-btn as-btn-primary"
            disabled={loading}
            style={{ width: "100%", justifyContent: "center", marginTop: "12px", height: "46px" }}
          >
            {loading ? t?.submitting || "Saving..." : t?.save || "Save Changes"}
          </button>
        </form>
      </div>
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

const modalStyle = {
  width: "90%",
  maxWidth: "500px",
  maxHeight: "90vh",
  overflowY: "auto",
  padding: "24px",
};
