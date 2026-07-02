import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { BASE_URL } from "../baseurl";

export default function HeroSection() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const nav = useNavigate();

  const [stats, setStats] = useState({
    artisans: 480,
    products: 2700,
    categories: 36,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/stats`);
        if (res.ok) {
          const data = await res.json();
          setStats({
            artisans: data.artisans,
            products: data.products,
            categories: data.categories,
          });
        }
      } catch (err) {
        console.error("Failed to load hero section stats:", err);
      }
    };
    fetchStats();
  }, []);

  const handleArtisanClick = () => {
    if (user?.role === "artisan") {
      nav("/artisan/dashboard");
    } else if (user?.role === "customer") {
      nav("/signup"); 
    } else {
      nav("/signup");
    }
  };

  // Format helper to display clean counts
  const formatCount = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    }
    return num;
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
            className="as-btn"
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
              <strong>{formatCount(stats.artisans)}+</strong>
              <span>{t?.statsArtisans || "Artisans"}</span>
            </div>
          </div>
          <div className="as-stat">
            <div>🖼</div>
            <div>
              <strong>{formatCount(stats.products)}</strong>
              <span>{t?.statsProducts || "Products"}</span>
            </div>
          </div>
          <div className="as-stat">
            <div>🧶</div>
            <div>
              <strong>{stats.categories}</strong>
              <span>{t?.statsCraftTypes || "Craft Types"}</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}