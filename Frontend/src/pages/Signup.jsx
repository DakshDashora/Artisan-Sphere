import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { BASE_URL } from "../baseurl";

export default function Signup() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "customer",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const nav = useNavigate();
  const { t } = useLanguage();
  const { login } = useAuth(); // Used to auto-login the user after successful signup

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(""); // Clear any previous errors

    const { username, email, password, role } = form;

    // Basic validation
    if (!username || !email || !password) {
      return setError(t?.fillAllFields || "Please fill all fields!");
    }

    if (password.length < 6) {
      return setError(t?.passwordTooShort || "Password must be at least 6 characters long!");
    }

    setIsLoading(true);

    try {
      // 1️⃣ Create user via your FastAPI/custom backend
      // Note: Assuming the endpoint is /auth/register or /auth/signup. Adjust if needed!
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password, role }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || "Registration failed.");
      }

      const data = await response.json();
      
      // 2️⃣ Auto-login the user
      // Assuming your backend returns { token: "...", user: {...} } upon successful registration
      const token = data.token;
      let userData = data.user;

      // Fallback just in case your backend doesn't return the user object immediately
      if (!userData) {
        userData = { username, email, role };
      }

      if (token) {
        login(userData, token); // Saves session to localStorage via our AuthContext
      } else {
        // If the backend doesn't return a token on signup, redirect them to login manually
        nav("/login");
        return;
      }

      // 3️⃣ Navigate by role
      if (role === "artisan") {
        nav("/artisan/dashboard");
      } else {
        nav("/");
      }
    } catch (err) {
      console.error("Signup Error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="as-auth-page as-container">
      <form className="as-card as-auth-form" onSubmit={handleSignup}>
        <h2 className="as-title" style={{ textAlign: "center" }}>{t?.signUp || "Sign Up"}</h2>

        {/* Error Message Display */}
        {error && (
          <div style={{ color: "var(--as-danger)", marginBottom: "16px", textAlign: "center", fontWeight: "600" }}>
            {error}
          </div>
        )}

        <div className="as-field">
          <label className="as-label">{t?.username || "Username"}</label>
          <input
            className="as-input-field"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
        </div>

        <div className="as-field">
          <label className="as-label">{t?.email || "Email"}</label>
          <input
            className="as-input-field"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>

        <div className="as-field">
          <label className="as-label">{t?.password || "Password"}</label>
          <input
            className="as-input-field"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>

        <div className="as-field">
          <label className="as-label">{t?.role || "Role"}</label>
          <select
            className="as-input-field"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="artisan">{t?.artisan || "Artisan"}</option>
            <option value="customer">{t?.customer || "Customer"}</option>
          </select>
        </div>

        <button 
          className="as-btn" 
          type="submit" 
          disabled={isLoading}
          style={{ width: "100%", justifyContent: "center", marginTop: "10px" }}
        >
          {isLoading ? (t?.loading || "Loading...") : (t?.submit || "Submit")}
        </button>

        <div className="as-auth-alt">
          <span className="as-muted">{t?.alreadyHaveAccount || "Already have an account?"}</span>
          <br />
          <Link className="as-link" to="/login" style={{ display: "inline-block", marginTop: "8px" }}>
            {t?.login || "Login"}
          </Link>
        </div>
      </form>
    </div>
  );
}