import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BASE_URL } from "../baseurl";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import Toast from "../components/Toast";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [cartAdding, setCartAdding] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const { t, lang } = useLanguage();
  const { user } = useAuth();

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/products/${id}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

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
        await fetchReviews();
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(t?.errorFetchingProducts || "Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const checkFavouriteStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`${BASE_URL}/api/favourites/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          const liked = data.some((p) => p.id === id);
          setIsLiked(liked);
        }
      } catch (err) {
        console.error("Error checking favorite status:", err);
      }
    };

    if (product) {
      checkFavouriteStatus();
    }
  }, [product, id]);

  const handleToggleFavourite = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setToast({ message: t?.noUser || "Please login to manage your favorites.", type: "error" });
      setTimeout(() => {
        navigate("/login");
      }, 1500);
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/api/favourites/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: id }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsLiked(data.liked);
        setToast({ 
          message: data.liked ? (t?.addedToFavourites || "Added to favorites!") : (t?.removeItemFailed || "Removed from favorites."), 
          type: "success" 
        });
      } else {
        throw new Error("Failed to toggle favorite status");
      }
    } catch (err) {
      console.error(err);
      setToast({ message: t?.failedToLoadFavourites || "Failed to toggle favorite status.", type: "error" });
    }
  };

  const handleAddToCart = async (showNotification = true) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setToast({ message: t?.noUser || "Please login to add products to your cart.", type: "error" });
      setTimeout(() => {
        navigate("/login");
      }, 1500);
      return false;
    }
    setCartAdding(true);
    try {
      const res = await fetch(`${BASE_URL}/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: id, quantity: 1 }),
      });
      if (!res.ok) {
        throw new Error("Failed to add to cart");
      }
      if (showNotification) {
        setToast({ message: t?.addedToCart || "Added to cart!", type: "success" });
      }
      return true;
    } catch (err) {
      console.error(err);
      setToast({ message: t?.removeItemFailed || "Failed to add product to cart.", type: "error" });
      return false;
    } finally {
      setCartAdding(false);
    }
  };

  const handleBuyNow = async () => {
    const success = await handleAddToCart(false);
    if (success) {
      navigate("/customer/cart");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    if (reviewRating < 1 || reviewRating > 5) {
      setToast({ message: "Rating must be between 1 and 5", type: "error" });
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`${BASE_URL}/api/products/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment })
      });
      
      if (res.ok) {
        setToast({ message: t?.reviewSuccess || "Review submitted successfully!", type: "success" });
        setReviewComment("");
        setReviewRating(5);
        await fetchReviews();
      } else {
        const errData = await res.json();
        setToast({ message: errData.detail || t?.reviewFailed || "Failed to submit review.", type: "error" });
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      setToast({ message: t?.reviewFailed || "Failed to submit review.", type: "error" });
    } finally {
      setSubmittingReview(false);
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

  if (error || !product) {
    return (
      <div className="as-container as-page">
        <div className="as-card" style={{ textAlign: "center", color: "var(--as-danger)" }}>
          <h2 className="as-title">{error || "Product not found"}</h2>
        </div>
      </div>
    );
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const showReviewForm = user && user.id !== product.artisan_id;

  return (
    <div className="as-container as-page" style={{ paddingBottom: "40px" }}>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* 2-Column Grid */}
      <div className="as-grid-2" style={{ alignItems: "start" }}>
        
        {/* LHS: Image, Details, Description, and Actions */}
        <div className="as-card">
          <img 
            src={product.image_url} 
            alt={lang === "hi" && product.title_hi ? product.title_hi : product.title} 
            className="as-img" 
            style={{ maxHeight: "400px", objectFit: "cover", marginBottom: "20px" }} 
          />
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", gap: "16px", flexWrap: "wrap" }}>
            <h1 className="as-title" style={{ margin: 0 }}>{lang === "hi" && product.title_hi ? product.title_hi : product.title}</h1>
            
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {averageRating && (
                <span className="as-chip" style={{ background: "var(--as-surface)", color: "var(--as-primary)", fontWeight: "bold" }}>
                  ⭐ {averageRating} / 5
                </span>
              )}
              {/* Neumorphic Favorites Toggle Button */}
              <button
                onClick={handleToggleFavourite}
                style={{
                  border: "none",
                  background: "var(--as-surface)",
                  boxShadow: isLiked ? "var(--as-shadow-sm-inset)" : "var(--as-shadow-sm)",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.25rem",
                  transition: "all 0.2s ease"
                }}
                title={isLiked ? "Remove from Favorites" : "Add to Favorites"}
              >
                {isLiked ? "❤️" : "🤍"}
              </button>
              <span className="as-chip">{t?.categories?.[product.category] || product.category}</span>
            </div>
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
              {lang === "hi" && product.description_hi ? product.description_hi : product.description || (t?.noDescription || "No description provided.")}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="as-row-gap">
            <button
              onClick={handleBuyNow}
              className="as-btn"
              disabled={cartAdding}
              style={{ flex: 1, justifyContent: "center" }}
            >
              {t?.buyNow || "Buy Now"}
            </button>
            <button
              onClick={() => handleAddToCart(true)}
              className="as-btn"
              disabled={cartAdding}
              style={{ flex: 1, justifyContent: "center" }}
            >
              {cartAdding ? t?.submitting || "Adding..." : t?.addToCart || "Add to Cart"}
            </button>
          </div>
        </div>

        {/* RHS: The Artisan's Story */}
        <div className="as-card" style={{ height: "100%" }}>
          <h2 className="as-subtitle" style={{ color: "var(--as-primary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>✨</span> {t?.fromArtisan || "From the Artisan..."}
          </h2>
          
          {lang === "hi" && product.story_hi ? (
            <p style={{ lineHeight: "1.8", color: "var(--as-text)", whiteSpace: "pre-line", fontSize: "1.05rem" }}>
              {product.story_hi}
            </p>
          ) : product.story ? (
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

      {/* REVIEWS & RATINGS SECTION */}
      <div className="as-grid-2" style={{ marginTop: "40px", alignItems: "start" }}>
        {/* Left: Review List */}
        <div className="as-card" style={{ height: "100%" }}>
          <h2 className="as-subtitle" style={{ marginBottom: "20px" }}>
            {t?.reviews || "Reviews"} ({reviews.length})
          </h2>
          
          {reviews.length === 0 ? (
            <p className="as-muted" style={{ padding: "20px 0" }}>
              {t?.noReviewsYet || "No reviews yet. Be the first to review!"}
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "500px", overflowY: "auto", paddingRight: "8px" }}>
              {reviews.map((r) => (
                <div key={r.id} className="as-card-flat" style={{ padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span className="as-strong" style={{ fontSize: "0.95rem" }}>{r.user_username}</span>
                    <span className="as-muted" style={{ fontSize: "0.75rem" }}>
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "2px", marginBottom: "8px", color: "gold" }}>
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <span key={idx}>{idx < r.rating ? "⭐" : "☆"}</span>
                    ))}
                  </div>
                  {r.comment && (
                    <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: "1.5", color: "var(--as-text)" }}>
                      {lang === "hi" && r.comment_hi ? r.comment_hi : r.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Review Form */}
        {showReviewForm ? (
          <div className="as-card">
            <h2 className="as-subtitle" style={{ marginBottom: "20px" }}>
              {t?.writeAReview || "Write a Review"}
            </h2>
            <form onSubmit={handleReviewSubmit}>
              <div style={{ marginBottom: "20px" }}>
                <span className="as-label">{t?.selectRating || "Select Rating"}</span>
                {/* Neumorphic Star Picker */}
                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      style={{
                        background: "var(--as-surface)",
                        border: "none",
                        boxShadow: reviewRating >= star ? "var(--as-shadow-sm-inset)" : "var(--as-shadow-sm)",
                        borderRadius: "50%",
                        width: "40px",
                        height: "40px",
                        cursor: "pointer",
                        fontSize: "1.3rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s ease"
                      }}
                    >
                      {reviewRating >= star ? "⭐" : "☆"}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label className="as-label" htmlFor="comment-textarea">
                  {t?.commentPlaceholder || "Share your thoughts about this product..."}
                </label>
                <textarea
                  id="comment-textarea"
                  className="as-input-field"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={t?.commentPlaceholder || "Share your thoughts..."}
                  rows={4}
                  style={{ resize: "none", width: "100%" }}
                  required
                />
              </div>

              <button
                type="submit"
                className="as-btn as-btn-primary"
                disabled={submittingReview}
                style={{ width: "100%" }}
              >
                {submittingReview ? (t?.submitting || "Submitting...") : (t?.submitReview || "Submit Review")}
              </button>
            </form>
          </div>
        ) : user ? (
          // Logged in but owns the product (Artisan)
          <div className="as-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", color: "var(--as-muted)", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "12px" }}>🛡️</div>
            <p style={{ fontSize: "0.95rem" }}>
              {lang === "hi" ? "शिल्पकार अपने स्वयं के उत्पादों की समीक्षा नहीं कर सकते।" : "Artisans cannot review their own products."}
            </p>
          </div>
        ) : (
          // Not logged in
          <div className="as-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", color: "var(--as-muted)", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "12px" }}>🔒</div>
            <p style={{ fontSize: "0.95rem", marginBottom: "16px" }}>
              {lang === "hi" ? "समीक्षा लिखने के लिए कृपया लॉगिन करें।" : "Please login to write a review."}
            </p>
            <button className="as-btn as-btn-primary" onClick={() => navigate("/login")}>
              {t?.login || "Login"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}