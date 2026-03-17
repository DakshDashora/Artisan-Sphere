import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";

export default function Profile() {
  const { user } = useAuth(); // 👈 Updated to useAuth
  const { t } = useLanguage();

  if (!user) {
    return (
      <div className="as-container as-page" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="as-card" style={{ textAlign: "center" }}>
          <h1 className="as-section-title">{t?.profile || "Profile"}</h1>
          <p className="as-muted">{t?.noUser || "No user data found. Please login."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="as-container as-profile-c">
      <h1 className="as-section-title">{t?.profile || "My Profile"}</h1>

      <div className="as-card as-profile">
        
        {/* Added a Neumorphic Avatar Placeholder */}
        <div 
          className="as-logo" 
          style={{ width: "80px", height: "80px", fontSize: "2.5rem", margin: "0 auto 20px auto" }}
        >
          👤
        </div>

        <div className="as-profile-body">
          {/* Swapped to our established typography classes */}
          <h2 className="as-title">
            {user.username || t?.noName || "No Name"}
          </h2>
          
          <p className="as-muted" style={{ marginBottom: "16px" }}>
            {user.email}
          </p>
          
          <div className="as-chip">
            <span className="as-strong" style={{ marginRight: "8px" }}>
              {t?.role || "Role"}:
            </span> 
            <span style={{ textTransform: "capitalize" }}>
              {user.role || "Customer"}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}