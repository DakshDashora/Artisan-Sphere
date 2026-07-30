import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { BASE_URL } from "../baseurl";

export default function ExploreMarketplace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  
  const { t, lang } = useLanguage();
  const nav = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${BASE_URL}/products/getproducts`);
        if (!response.ok) {
          throw new Error("Failed to fetch products.");
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(t?.errorFetchingProducts || "Could not load marketplace items.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [t]);

  // Handle filter clearing
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
  };

  // Perform Client-side filtering and sorting
  const filteredProducts = products.filter((p) => {
    // 1. Text Search
    const titleMatch = lang === "hi" && p.title_hi
      ? p.title_hi.toLowerCase().includes(searchQuery.toLowerCase())
      : p.title.toLowerCase().includes(searchQuery.toLowerCase());
      
    const descMatch = lang === "hi" && p.description_hi
      ? p.description_hi.toLowerCase().includes(searchQuery.toLowerCase())
      : p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (searchQuery && !titleMatch && !descMatch) {
      return false;
    }

    // 2. Category
    if (selectedCategory !== "all" && p.category !== selectedCategory) {
      return false;
    }

    // 3. Min Price
    if (minPrice !== "" && p.price < parseFloat(minPrice)) {
      return false;
    }

    // 4. Max Price
    if (maxPrice !== "" && p.price > parseFloat(maxPrice)) {
      return false;
    }

    return true;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price_asc") {
      return a.price - b.price;
    }
    if (sortBy === "price_desc") {
      return b.price - a.price;
    }
    if (sortBy === "name_asc") {
      const titleA = (lang === "hi" && a.title_hi ? a.title_hi : a.title).toLowerCase();
      const titleB = (lang === "hi" && b.title_hi ? b.title_hi : b.title).toLowerCase();
      return titleA.localeCompare(titleB);
    }
    // newest (default)
    return new Date(b.created_at) - new Date(a.created_at);
  });

  // Available categories
  const availableCategories = ["all", "textile", "pottery", "wood", "metal", "painting", "stone", "other"];

  return (
    <div className="as-container as-page">
      <h1 className="as-section-title">{t?.exploreMarketplace || "Explore Marketplace"}</h1>

      {error && (
        <div style={{ color: "var(--as-danger)", marginBottom: "16px", fontWeight: "600", textAlign: "center" }}>
          {error}
        </div>
      )}

      {/* FILTER CONTROL BAR */}
      <div className="as-card" style={{ marginBottom: "32px", padding: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Row 1: Search and Sort */}
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ flex: 2, minWidth: "250px" }}>
              <input
                type="text"
                className="as-input-field"
                placeholder={t?.searchPlaceholderMarketplace || "Search products by title..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div style={{ flex: 1, minWidth: "180px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="as-strong" style={{ fontSize: "0.9rem", whiteSpace: "nowrap" }}>
                {t?.sortBy || "Sort By"}:
              </span>
              <select
                className="as-input-field"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ padding: "8px 12px" }}
              >
                <option value="newest">{t?.newest || "Newest"}</option>
                <option value="price_asc">{t?.priceLowHigh || "Price: Low to High"}</option>
                <option value="price_desc">{t?.priceHighLow || "Price: High to Low"}</option>
                <option value="name_asc">{t?.nameAZ || "Name: A-Z"}</option>
              </select>
            </div>
          </div>

          {/* Row 2: Price Filters */}
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="as-strong" style={{ fontSize: "0.9rem" }}>₹</span>
              <input
                type="number"
                className="as-input-field"
                placeholder={t?.minPrice || "Min Price"}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                style={{ width: "110px", padding: "8px 12px" }}
              />
              <span className="as-muted">-</span>
              <input
                type="number"
                className="as-input-field"
                placeholder={t?.maxPrice || "Max Price"}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                style={{ width: "110px", padding: "8px 12px" }}
              />
            </div>

            <button 
              className="as-btn" 
              onClick={handleResetFilters} 
              style={{ padding: "8px 16px", fontSize: "0.85rem" }}
            >
              🔄 {t?.cancel || "Reset"}
            </button>
          </div>

          {/* Row 3: Category Chips */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "4px" }}>
            {availableCategories.map((cat) => (
              <button
                key={cat}
                className={`as-chip ${selectedCategory === cat ? "as-btn-primary" : ""}`}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  textTransform: "capitalize",
                  border: selectedCategory === cat ? "none" : "1px solid var(--as-border)",
                  padding: "6px 14px",
                  fontSize: "0.8rem",
                  cursor: "pointer"
                }}
              >
                {cat === "all" ? (t?.allProducts || "All Categories") : (t?.categories?.[cat] || cat)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="as-spinner-container">
          <div className="as-spinner"></div>
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="as-card" style={{ textAlign: "center", padding: "40px", color: "var(--as-muted)" }}>
          {t?.noProductsFound || "No products found matching your criteria."}
        </div>
      ) : (
        <div>
          {/* Main Grid View */}
          <div className="as-grid">
            {sortedProducts.map((p) => (
              <div key={p.id} className="as-card as-product">
                <img src={p.image_url} alt={lang === "hi" && p.title_hi ? p.title_hi : p.title} className="as-img" />
                
                <div className="as-product-body">
                  <div className="as-product-title">{lang === "hi" && p.title_hi ? p.title_hi : p.title}</div>
                  
                  <div className="as-product-meta" style={{ marginBottom: "16px" }}>
                    <span className="as-chip" style={{ fontSize: "0.75rem", padding: "4px 8px" }}>
                      {t?.categories?.[p.category] || p.category}
                    </span>
                    <span className="as-price">₹{p.price}</span>
                  </div>
                  
                  <button
                    className="as-btn"
                    onClick={() => nav(`/product/${p.id}`)}
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    {t?.viewProduct || "View Product"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}