import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { BASE_URL } from "../baseurl";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const { login } = useAuth(); // Grabbing our local-storage based login function
  const { t } = useLanguage();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors on new submission

    if (!email || !password) {
      return setError("Please enter both email and password!");
    }

    setIsLoading(true);

    try {
      // 1️⃣ Authenticate with your custom backend
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email_or_username: email, 
          password: password 
        }),
      });

      if (!response.ok) {
        throw new Error("Invalid login credentials.");
      }

      const authData = await response.json();
      const token = authData.token;

      // 2️⃣ Fetch user profile data to get the role
      // Note: Assuming you have an /auth/me endpoint to get the user's details using the token
      const profileRes = await fetch(`${BASE_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let userData;
      if (profileRes.ok) {
        userData = await profileRes.json();
      } else {
        // Safe fallback just in case your /auth/me endpoint isn't fully built yet
        console.warn("Could not fetch profile, defaulting to customer role.");
        userData = { email, role: "customer" }; 
      }

      // 3️⃣ Save user and token to context (which handles our 'as-user' localStorage)
      login(userData, token);

      // 4️⃣ Navigate based on user role
      if (userData.role === "artisan") {
        navigate("/artisan/dashboard");
      } else {
        navigate("/");
      }
      
    } catch (err) {
      console.error("Login Error:", err);
      setError("An error occured!\nKyu hua tere kaam ka nahi h!!!!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="as-auth-page as-container">
      <form className="as-card as-auth-form" onSubmit={onSubmit}>
        <h2 className="as-title" style={{ textAlign: "center" }}>{t?.signIn || "Sign In"}</h2>
        
        {/* Error Message Display */}
        {error && (
          <div style={{ color: "var(--as-danger)", marginBottom: "16px", textAlign: "center", fontWeight: "600" }}>
            {error}
          </div>
        )}

        <div className="as-field">
          <label className="as-label">{t?.email || "Email or Username"}</label>
          <input 
            className="as-input-field" 
            type="text" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>

        <div className="as-field">
          <label className="as-label">{t?.password || "Password"}</label>
          <input 
            className="as-input-field" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>

        <button 
          className="as-btn" 
          type="submit" 
          disabled={isLoading}
          style={{ width: "100%", justifyContent: "center", marginTop: "10px" }}
        >
          {isLoading ? (t?.loading || "Loading...") : (t?.signIn || "Sign In")}
        </button>

        <div className="as-auth-alt">
          <span className="as-muted">{t?.or || "or"}</span>
          <br />
          <Link className="as-link" to="/signup" style={{ display: "inline-block", marginTop: "8px" }}>
            {t?.signUp || "Sign Up"}
          </Link>
        </div>
      </form>
    </div>
  );
}