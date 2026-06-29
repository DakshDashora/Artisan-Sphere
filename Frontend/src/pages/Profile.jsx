import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { BASE_URL } from "../baseurl";
import Toast from "../components/Toast";

export default function Profile() {
  const { user, login } = useAuth();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    bio: "",
    location: "",
    contact_info: "",
    store_picture: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (user) {
      fetchLatestProfile();
    }
  }, [user?.email]);

  const fetchLatestProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch profile details.");
      }

      const data = await res.json();
      setProfile({
        bio: data.bio || "",
        location: data.location || "",
        contact_info: data.contact_info || "",
        store_picture: data.store_picture || "",
      });
      
      login(data, token);
    } catch (err) {
      console.error(err);
      setError("Failed to sync profile details.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSaveLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${BASE_URL}/auth/profile/upload-picture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload image.");
      }

      const data = await res.json();
      setProfile((prev) => ({ ...prev, store_picture: data.store_picture }));
      login(data, token);
      setToast({ message: "Profile picture uploaded successfully!", type: "success" });
    } catch (err) {
      console.error(err);
      setError("Failed to upload profile picture.");
      setToast({ message: "Failed to upload image.", type: "error" });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile.");
      }

      const data = await res.json();
      login(data, token);
      setIsEditing(false);
      setToast({ message: t?.profileUpdatedSuccess || "Profile updated successfully!", type: "success" });
    } catch (err) {
      console.error(err);
      setError("Failed to update profile details.");
      setToast({ message: "Failed to update profile details.", type: "error" });
    } finally {
      setSaveLoading(false);
    }
  };

  const isArtisan = user?.role === "artisan";

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

  if (loading) {
    return (
      <div className="as-container as-page" style={{ display: "flex", justifyContent: "center" }}>
        <div className="as-spinner-container">
          <div className="as-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="as-container as-page" style={{ maxWidth: "800px" }}>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <h1 className="as-section-title">{t?.profilePage || "My Profile"}</h1>

      {error && (
        <div className="as-card" style={{ color: "var(--as-danger)", marginBottom: "20px", fontWeight: "600", textAlign: "center" }}>
          {error}
        </div>
      )}

      <div className="as-card" style={{ padding: "32px" }}>
        
        {/* Profile Header Block */}
        <div style={{ display: "flex", gap: "24px", alignItems: "center", marginBottom: "32px", flexWrap: "wrap" }}>
          <div 
            className="as-logo" 
            style={{ 
              width: "100px", 
              height: "100px", 
              fontSize: "3rem", 
              margin: 0,
              overflow: "hidden",
              borderRadius: "50%",
              boxShadow: "var(--as-shadow-main)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--as-surface)"
            }}
          >
            {isArtisan && profile.store_picture ? (
              <img src={profile.store_picture} alt={user.username} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              "👤"
            )}
          </div>

          <div style={{ flex: 1 }}>
            <h2 className="as-title" style={{ margin: "0 0 4px 0", fontSize: "1.75rem" }}>
              {user.username}
            </h2>
            <p className="as-muted" style={{ marginBottom: "12px", fontSize: "0.95rem" }}>
              {user.email}
            </p>
            <span className="as-chip" style={{ textTransform: "capitalize", fontWeight: "600" }}>
              {t?.[user.role] || user.role}
            </span>
          </div>

          <div>
            {!isEditing && (
              <button className="as-btn as-btn-primary" onClick={() => setIsEditing(true)}>
                {t?.editProfile || "Edit Profile"}
              </button>
            )}
          </div>
        </div>

        {/* View / Edit Mode Form */}
        {isEditing ? (
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Store Picture Upload - Artisan Only */}
            {isArtisan && (
              <div className="as-field" style={{ margin: 0 }}>
                <label className="as-label">{t?.storePicture || "Profile / Store Picture (File Upload)"}</label>
                <input
                  type="file"
                  accept="image/*"
                  className="as-input"
                  onChange={handleImageUpload}
                  style={{ width: "100%", background: "var(--as-bg)", border: "1px solid var(--as-border)", paddingTop: "8px" }}
                  disabled={saveLoading}
                />
              </div>
            )}

            {/* Location */}
            <div className="as-field" style={{ margin: 0 }}>
              <label className="as-label">{t?.location || "Location"}</label>
              <input
                type="text"
                className="as-input"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                placeholder="e.g. Jaipur, India"
                style={{ width: "100%", background: "var(--as-bg)", border: "1px solid var(--as-border)" }}
              />
            </div>

            {/* Contact Info */}
            <div className="as-field" style={{ margin: 0 }}>
              <label className="as-label">{t?.contactInfo || "Contact Info"}</label>
              <input
                type="text"
                className="as-input"
                value={profile.contact_info}
                onChange={(e) => setProfile({ ...profile, contact_info: e.target.value })}
                placeholder="e.g. +91 9876543210 or contact@artisan.com"
                style={{ width: "100%", background: "var(--as-bg)", border: "1px solid var(--as-border)" }}
              />
            </div>

            {/* Bio - Artisan Only */}
            {isArtisan && (
              <div className="as-field" style={{ margin: 0 }}>
                <label className="as-label">{t?.bio || "Bio / About Me"}</label>
                <textarea
                  className="as-input"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us about yourself, your craftsmanship, and your journey..."
                  rows="5"
                  style={{ 
                    width: "100%", 
                    background: "var(--as-bg)", 
                    border: "1px solid var(--as-border)",
                    resize: "vertical",
                    fontFamily: "inherit",
                    padding: "12px"
                  }}
                />
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "12px" }}>
              <button 
                type="button" 
                className="as-btn" 
                onClick={() => {
                  setIsEditing(false);
                  fetchLatestProfile(); // Revert unsaved edits
                }}
              >
                {t?.cancel || "Cancel"}
              </button>
              <button 
                type="submit" 
                className="as-btn as-btn-primary" 
                disabled={saveLoading}
              >
                {saveLoading ? t?.saving || "Saving..." : t?.save || "Save Changes"}
              </button>
            </div>

          </form>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Bio Display - Artisan Only */}
            {isArtisan && (
              <div>
                <h3 className="as-strong" style={{ fontSize: "1.1rem", marginBottom: "8px", color: "var(--as-primary)" }}>
                  {t?.bio || "About Me"}
                </h3>
                <p className="as-muted" style={{ lineHeight: "1.6", whiteSpace: "pre-line" }}>
                  {profile.bio || "No bio added yet. Tell people about your beautiful crafts!"}
                </p>
              </div>
            )}

            {/* Metadata fields */}
            <div className="as-grid-2" style={{ gap: "20px" }}>
              <div className="as-card-flat">
                <span className="as-strong" style={{ display: "block", marginBottom: "4px", fontSize: "0.85rem", color: "var(--as-muted)" }}>
                  {t?.location || "Location"}
                </span>
                <span style={{ fontSize: "1.05rem", fontWeight: "500" }}>
                  {profile.location || "Not specified"}
                </span>
              </div>

              <div className="as-card-flat">
                <span className="as-strong" style={{ display: "block", marginBottom: "4px", fontSize: "0.85rem", color: "var(--as-muted)" }}>
                  {t?.contactInfo || "Contact Info"}
                </span>
                <span style={{ fontSize: "1.05rem", fontWeight: "500" }}>
                  {profile.contact_info || "Not specified"}
                </span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}