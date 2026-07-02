import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext"; 
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(""); 
  
  const { user, logout } = useAuth(); 
  const { t, lang, setLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const nav = useNavigate();

  const handleLogout = () => {
    logout();
    nav("/"); 
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim() === "") return;
    nav(`/search?query=${encodeURIComponent(search)}`);
    setSearch(""); 
  };

  // Unified Language Toggle Action
  const toggleLanguage = () => {
    setLang(lang === "en" ? "hi" : "en");
  };

  return (
    <header className="as-nav">
      <div className="as-container as-nav-inner">
        
        {/* ==================== DESKTOP LAYOUT (2 ROWS) ==================== */}
        
        {/* ROW 1: Logo + Search + User Utilities */}
        <div className="as-nav-line1">
          {/* Logo */}
          <Link to="/" className="as-brand">
            <span className="as-logo-sphere"></span>
            <span className="as-brand-text">{t.brand}</span>
          </Link>

          {/* Search form */}
          <form onSubmit={handleSearch} className="as-search-wrap">
            <input
              className="as-input"
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)} 
            />
            <button type="submit" className="as-search-btn">🔍</button>
          </form>

          {/* User Utilities & Auth Links */}
          <div className="as-icon-links">
            <Link to="/favourites" data-tooltip={t.favorites || "Favorites"} aria-label="favorites" className="as-icon-btn">❤</Link>
            <button
              aria-label="profile"
              data-tooltip={t.profile || "Profile"}
              className="as-icon-btn"
              onClick={() => nav(user ? "/profile" : "/login")}
            >
              👤
            </button>
            <Link aria-label="cart" data-tooltip={t.cart || "Cart"} to="/customer/cart" className="as-icon-btn">🛒</Link>
            
            <div className="as-nav-auth" style={{ marginLeft: '0.5rem' }}>
              {!user ? (
                <>
                  <Link to="/login" className="as-btn">{t.login}</Link>
                  <Link to="/signup" className="as-btn">{t.signup}</Link>
                </>
              ) : (
                <button className="as-btn" onClick={handleLogout}>{t.logout}</button>
              )}
            </div>
          </div>
        </div>

        {/* ROW 2: Primary Nav Links + System Settings */}
        <div className="as-nav-line2">
          {/* Left/Center: Nav Links */}
          <nav className="as-nav-links">
            <NavLink to="/" className="as-nav-link">{t.home}</NavLink>
            <NavLink to="/marketplace" className="as-nav-link">{t.marketplace}</NavLink>
            {user && user.role !== "artisan" && (
              <NavLink to="/customer/orders" className="as-nav-link">{t.customerOrders || "Order History"}</NavLink>
            )}
            {user?.role === "artisan" && (
              <>
                <NavLink to="/artisan/dashboard" className="as-nav-link">{t.artisanDashboard}</NavLink>
                <NavLink to="/artisan/manage-orders" className="as-nav-link">{t.manageOrders || "Manage Orders"}</NavLink>
              </>
            )}
          </nav>

          {/* Right: Language and Theme Toggles */}
          <div className="as-desktop-toggles">
            <button className="as-chip" onClick={toggleLanguage}>
              {lang === "en" ? "हिंदी" : "English"}
            </button>
            <button className="as-chip" onClick={toggleTheme} aria-label="Toggle Theme">
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* ==================== MOBILE LAYOUT (HEADER + DRAWER) ==================== */}
        
        {/* Mobile Header Bar */}
        <div className="as-nav-header">
          <Link to="/" className="as-brand">
            <span className="as-logo-sphere"></span>
            <span className="as-brand-text">{t.brand}</span>
          </Link>
          
          <div className="as-nav-mobile-controls">
            <button className="as-nav-toggle-icon" onClick={toggleTheme} aria-label="Toggle Theme">
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <button className="as-nav-toggle-btn" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Menu">
              {isOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Collapsible Mobile Menu Drawer */}
        <div className={`as-nav-content ${isOpen ? "is-open" : ""}`}>
          
          {/* Search bar */}
          <form onSubmit={handleSearch} className="as-search-wrap">
            <input
              className="as-input"
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)} 
            />
            <button type="submit" className="as-search-btn">🔍</button>
          </form>

          {/* Nav Links */}
          <nav className="as-nav-links">
            <NavLink to="/" className="as-nav-link" onClick={() => setIsOpen(false)}>{t.home}</NavLink>
            <NavLink to="/marketplace" className="as-nav-link" onClick={() => setIsOpen(false)}>{t.marketplace}</NavLink>
            {user && user.role !== "artisan" && (
              <NavLink to="/customer/orders" className="as-nav-link" onClick={() => setIsOpen(false)}>{t.customerOrders || "Order History"}</NavLink>
            )}
            {user?.role === "artisan" && (
              <>
                <NavLink to="/artisan/dashboard" className="as-nav-link" onClick={() => setIsOpen(false)}>{t.artisanDashboard}</NavLink>
                <NavLink to="/artisan/manage-orders" className="as-nav-link" onClick={() => setIsOpen(false)}>{t.manageOrders || "Manage Orders"}</NavLink>
              </>
            )}
          </nav>

          {/* Utilities & Controls */}
          <div className="as-nav-utils">
            {/* Unified Language Toggle for Mobile */}
            <button className="as-chip" onClick={() => { toggleLanguage(); setIsOpen(false); }}>
              {lang === "en" ? "हिंदी" : "English"}
            </button>

            {/* Icons */}
            <div className="as-icon-links">
              <Link to="/favourites" data-tooltip={t.favorites || "Favorites"} aria-label="favorites" className="as-icon-btn" onClick={() => setIsOpen(false)}>❤</Link>
              <button
                aria-label="profile"
                data-tooltip={t.profile || "Profile"}
                className="as-icon-btn"
                onClick={() => { nav(user ? "/profile" : "/login"); setIsOpen(false); }}
              >
                👤
              </button>
              <Link aria-label="cart" data-tooltip={t.cart || "Cart"} to="/customer/cart" className="as-icon-btn" onClick={() => setIsOpen(false)}>🛒</Link>
            </div>

            {/* Auth Buttons */}
            <div className="as-nav-auth">
              {!user ? (
                <>
                  <Link to="/login" className="as-btn" onClick={() => setIsOpen(false)}>{t.login}</Link>
                  <Link to="/signup" className="as-btn" onClick={() => setIsOpen(false)}>{t.signup}</Link>
                </>
              ) : (
                <button className="as-btn" onClick={() => { handleLogout(); setIsOpen(false); }}>
                  {t.logout}
                </button>
              )}
            </div>
          </div>

        </div>

      </div>
    </header>
  );
}