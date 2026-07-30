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

      // 2️⃣ Auto-login the user programmatically calling the login API
      const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email_or_username: email, 
          password: password 
        }),
      });

      if (!loginRes.ok) {
        throw new Error("Registration succeeded, but auto-login failed. Please sign in manually.");
      }

      const authData = await loginRes.json();
      const token = authData.token;

      // 3️⃣ Fetch user profile data to get the role
      const profileRes = await fetch(`${BASE_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let userData;
      if (profileRes.ok) {
        userData = await profileRes.json();
      } else {
        userData = { username, email, role }; 
      }

      // 4️⃣ Save user and token to context
      login(userData, token);

      // 5️⃣ Navigate by role
      if (role === "artisan") {
        nav("/artisan/dashboard");
      } else {
        nav("/");
      }
    } catch (err) {
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
          <Link className="as-btn" to="/login" style={{ marginTop: "12px", width: "100%" }}>
            {t?.login || "Login"}
          </Link>
        </div>
      </form>
    </div>
  );
}