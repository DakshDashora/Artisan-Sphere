import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="as-footer">
      <div className="as-container as-footer-inner">
        
        {/* Brand Section */}
        <div className="as-footer-brand">
          <div className="as-logo">🟠</div>
          <div>
            <h3 className="as-footer-title">{t?.brand || "ArtisanSphere"}</h3>
            <p className="as-muted">{t?.footerTagline || "Empowering local artisans."}</p>
          </div>
        </div>

        {/* Links Section */}
        <div className="as-footer-links">
          
          <div style={{ flex: 1 }}>
            <h4 className="as-muted">{t?.forArtisans || "For Artisans"}</h4>
            <ul>
              <li>
                <Link to="/artisan/dashboard" className="as-btn">
                  {t?.artisanDashboard || "Dashboard"}
                </Link>
              </li>
              <li>
                <Link to="/artisan/add-product" className="as-btn">
                  {t?.addProduct || "Add Product"}
                </Link>
              </li>
              <li>
                <Link to="/artisan/manage-orders" className="as-btn">
                  {t?.manageOrders || "Manage Orders"}
                </Link>
              </li>
            </ul>
          </div>

          <div style={{ flex: 1 }}>
            <h4 className="as-muted">{t?.forCustomers || "For Customers"}</h4>
            <ul>
              <li>
                <Link to="/" className="as-btn">
                  {t?.browseProducts || "Browse Products"}
                </Link>
              </li>
              <li>
                <Link to="/customer/cart" className="as-btn">
                  {t?.customerCart || "Your Cart"}
                </Link>
              </li>
              <li>
                <Link to="/customer/orders" className="as-btn">
                  {t?.orderHistory || "Order History"}
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </footer>
  );
}