import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { BASE_URL } from "../baseurl"; 

export default function AddProduct() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const nav = useNavigate();

  // Only the core product details
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("textile");
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async () => {
    setError(""); 

    if (!title || !price || !file) {
      return setError(t?.fillAllFields || "Please fill all required fields and upload an image.");
    }
    
    if (!user) {
      alert(t?.userNotLoggedIn || "You must be logged in.");
      nav("/login");
      return;
    }

    if (user.role !== "artisan") {
      return setError("Only artisans can add products. Please upgrade your account.");
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const formData = new FormData();
      
      // Append the file
      formData.append("image", file);

      // Append only the text fields needed, matching FastAPI Form(...) parameters
      // By omitting 'description' and 'story', your database will keep them empty/null
      formData.append("title", title);
      formData.append("price", price);
      formData.append("category", category);

      const response = await fetch(`${BASE_URL}/products/addproduct`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
          // Fetch automatically handles the Content-Type for FormData
        },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to add product.");
      }

      alert(t?.productAddedSuccess || "Product added successfully!");
      
      // Reset form
      setTitle("");
      setPrice("");
      setCategory("textile");
      setFile(null);
      setPreview("");
      
      nav("/artisan/dashboard");

    } catch (err) {
      console.error("Upload Error:", err);
      setError(err.message || t?.imageUploadFailed || "Image upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="as-container as-dashboard">
      <h1 className="as-section-title">{t?.addProduct || "Add Product"}</h1>
      
      <div className="as-card as-form">

        {error && (
          <div style={{ color: "var(--as-danger)", marginBottom: "16px", fontWeight: "600", textAlign: "center" }}>
            {error}
          </div>
        )}

        <div className="as-field">
          <label className="as-label">{t?.productTitle || "Title"} *</label>
          <input
            className="as-input-field"
            placeholder={t?.productTitle || "Product Title"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="as-field">
          <label className="as-label">{t?.productPrice || "Price (₹)"} *</label>
          <input
            className="as-input-field"
            type="number"
            placeholder={t?.productPrice || "e.g. 500"}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div className="as-field">
          <label className="as-label">{t?.category || "Category"} *</label>
          <select
            className="as-input-field"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="textile">{t?.categories?.textile || "Textile"}</option>
            <option value="pottery">{t?.categories?.pottery || "Pottery"}</option>
            <option value="wood">{t?.categories?.wood || "Woodwork"}</option>
            <option value="metal">{t?.categories?.metal || "Metal Art"}</option>
            <option value="painting">{t?.categories?.painting || "Painting"}</option>
            <option value="stone">{t?.categories?.stone || "Stone Carving"}</option>
            <option value="other">{t?.categories?.other || "Other"}</option>
          </select>
        </div>

        <div className="as-field">
          <label className="as-label">{t?.uploadImage || "Upload Image"} *</label>
          <input
            className="as-input-field"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ padding: "9px" }}
          />
        </div>

        {preview && (
          <div className="as-preview">
            <img src={preview} alt="preview" style={{ borderRadius: "12px", maxHeight: "200px", objectFit: "cover" }} />
            <div className="as-muted" style={{ marginTop: "8px" }}>{t?.preview || "Image Preview"}</div>
          </div>
        )}

        <div className="as-row-gap" style={{ marginTop: "24px" }}>
          <button
            className="as-btn"
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {loading ? (t?.submitting || "Uploading...") : (t?.submit || "Add Product")}
          </button>
        </div>

      </div>
    </div>
  );
}