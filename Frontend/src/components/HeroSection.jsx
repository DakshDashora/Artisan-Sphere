import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";

export default function HeroSection() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const nav = useNavigate();

  const handleArtisanClick = () => {
    if (user?.role === "artisan") {
      nav("/artisan/dashboard");
    } else if (user?.role === "customer") {
      // If they are already a customer, we probably want to send them 
      // to an upgrade page or profile settings, but for now we'll route to signup 
      // based on your original logic.
      nav("/signup"); 
    } else {
      nav("/signup");
    }
  };

  return (
    <section className="as-hero as-container">
      <div className="as-hero-content as-card">
        
        {/* Main Tagline */}
        <h1 className="as-hero-title">
          {t?.tagline || "Discover Unique Handcrafted Treasures"}
        </h1>
        
        {/* Call to Action Buttons */}
        <div className="as-row-gap">
          <Link className="as-btn" to="/marketplace">
            {t?.explore || "Explore Marketplace"}
          </Link>
          <button
            className="as-btn as-btn-ghost"
            onClick={handleArtisanClick}
          >
            {t?.becomeArtisan || "Become an Artisan"}
          </button>
        </div>
        
        {/* Platform Stats */}
        <div className="as-stats">
          <div className="as-stat">
            <div>👩‍🎨</div>
            <div>
              <strong>480+</strong>
              <span>{t?.statsArtisans || "Artisans"}</span>
            </div>
          </div>
          <div className="as-stat">
            <div>🖼</div>
            <div>
              <strong>2.7k</strong>
              <span>{t?.statsProducts || "Products"}</span>
            </div>
          </div>
          <div className="as-stat">
            <div>🧶</div>
            <div>
              <strong>36</strong>
              <span>{t?.statsCraftTypes || "Craft Types"}</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}