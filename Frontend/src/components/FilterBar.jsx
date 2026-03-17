import React from "react";
import { useLanguage } from "../contexts/LanguageContext";

export default function FilterBar({ 
  searchQuery, 
  setSearchQuery, 
  category, 
  setCategory, 
  maxPrice, 
  setMaxPrice,
  onApplyFilters // 👈 New prop to trigger the backend fetch
}) {
  const { t } = useLanguage();

  return (
    <div className="as-card as-filterbar">
      <div className="as-filter-title">
        {t?.filters || "Filters"}
      </div>
      
      <div className="as-filter-controls" style={{ alignItems: "flex-end" }}>
        
        {/* Search Input (Filters locally, instant update) */}
        {/* <div style={{ flex: 1 }}>
          <label className="as-label">{t?.search || "Search"}</label>
          <input
            className="as-input-field"
            placeholder={t?.searchPlaceholder || "Search artworks..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
         */}
        {/* Category Dropdown */}
        <div style={{ flex: 1 }}>
          <label className="as-label">{t?.category || "Category"}</label>
          <select
            className="as-input-field"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ cursor: "pointer" }}
          >
            <option value="All">{t?.allProducts || "All Categories"}</option>
            <option value="textile">{t?.categories?.textile || "Textile"}</option>
            <option value="pottery">{t?.categories?.pottery || "Pottery"}</option>
            <option value="wood">{t?.categories?.wood || "Woodwork"}</option>
            <option value="metal">{t?.categories?.metal || "Metal Art"}</option>
            <option value="painting">{t?.categories?.painting || "Painting"}</option>
            <option value="stone">{t?.categories?.stone || "Stone Carving"}</option>
            <option value="other">{t?.categories?.other || "Other"}</option>
          </select>
        </div>

        {/* Price Range Slider */}
        <div className="as-range" style={{ flex: 1 }}>
          <label className="as-label">
            {t?.price || "Max Price"}: <strong style={{ color: "var(--as-primary)" }}>₹{maxPrice}</strong>
          </label>
          <input
            type="range"
            min="10"
            max="20000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            style={{ width: "100%", cursor: "pointer", accentColor: "var(--as-primary)" }}
          />
        </div>

        {/* 👈 New Submit Button */}
        <button 
          className="as-btn" 
          onClick={onApplyFilters}
          style={{ height: "46px" }}
        >
          {t?.applyFilters || "Apply Filters"}
        </button>

      </div>
    </div>
  );
}