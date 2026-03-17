import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BASE_URL } from "../baseurl";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext"; // 👈 Unified hook

export default function CreateStoryPage() {
  const { lang, t } = useLanguage();
  const { id } = useParams();
  const { user } = useAuth(); // 👈 Unified hook
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [story, setStory] = useState(null);
  const [history, setHistory] = useState([]);
  const [count, setCount] = useState(0);

  // Translate helper
  async function translate(text, target) {
    if (!text) return "";
    try {
      const res = await fetch(`${BASE_URL}/api/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, target_language: target }),
      });
      const data = await res.json();
      return data.translated_text || text;
    } catch (err) {
      console.error("Translation error:", err);
      return text; // Fallback to original text on failure
    }
  }

  // Fetch product from Custom FastAPI Backend
  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`${BASE_URL}/products/getproduct/${id}`);
        if (!res.ok) throw new Error("Product not found");
        
        const prodData = await res.json();

        // Translate description into Hindi if it exists
        let hiDesc = "";
        if (prodData.description) {
          hiDesc = await translate(prodData.description, "hi");
        }

        // Store both en/hi descriptions
        setProduct({
          ...prodData,
          description: {
            en: prodData.description || "",
            hi: hiDesc || "",
          },
        });
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoadingProduct(false);
      }
    }
    fetchProduct();
    // eslint-disable-next-line
  }, [id]);

  // Start new interview session
  async function startSession() {
    try {
      const res = await fetch(`${BASE_URL}/api/start-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 👈 Passed image_url to match your FastAPI/DB schema
        body: JSON.stringify({ title: product.title, image_url: product.image_url }) 
      });
      const data = await res.json();

      const hiQ = await translate(data.question, "hi");

      setSessionId(data.sessionId);
      setQuestion({ en: data.question, hi: hiQ });
      setHistory([]);
      setStory(null);
      setCount(0);
    } catch (err) {
      console.error("Failed to start session:", err);
    }
  }

  // Submit answer to the AI
  async function submitAnswer() {
    if (!answer.trim()) return;

    try {
      const answerEn = lang === "hi" ? await translate(answer, "en") : answer;

      const res = await fetch(`${BASE_URL}/api/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, answer: answerEn }),
      });
      const data = await res.json();

      const nextHiQ = data.done ? "" : await translate(data.question, "hi");

      setHistory((prev) => [
        ...prev,
        { q: question, a: { en: answerEn, hi: answer } },
      ]);
      setAnswer("");
      setCount(count + 1);

      if (data.done || count + 1 >= 10) {
        const hiStory = await translate(data.question, "hi");
        setStory({ en: data.question, hi: hiStory });
        setQuestion(null);
      } else {
        setQuestion({ en: data.question, hi: nextHiQ });
      }
    } catch (err) {
      console.error("Failed to submit answer:", err);
    }
  }

  // Force stop the interview
  async function stopInterview() {
    try {
      const res = await fetch(`${BASE_URL}/api/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, answer: "__STOP__" }),
      });
      const data = await res.json();

      const hiStory = await translate(data.question, "hi");
      setStory({ en: data.question, hi: hiStory });
      setQuestion(null);
    } catch (err) {
      console.error("Failed to stop interview:", err);
    }
  }

  // Submit the final story to the Postgres database
  const submitStory = async (e) => {
    e.preventDefault();
    if (!story) return alert("Please write a story first!");

    try {
      const token = localStorage.getItem("token");
      
      // 👈 Use your updateproduct PUT endpoint!
      const res = await fetch(`${BASE_URL}/products/updateproduct/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        // We just pass the story. FastAPI will update only this field.
        body: JSON.stringify({ story: story.en }),
      });

      if (!res.ok) throw new Error("Failed to save story to database.");

      alert("Story saved successfully!");
      navigate("/artisan/products");
    } catch (err) {
      console.error("Error saving story:", err);
      alert("Failed to submit story: " + err.message);
    }
  };

  const showText = (obj) => {
    if (!obj) return "";
    return lang === "hi" ? obj.hi : obj.en;
  };

  if (loadingProduct) {
    return (
      <div className="as-container as-page" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="as-spinner-container">
            <div className="as-spinner"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="as-container as-page" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="as-card" style={{ textAlign: "center" }}>
          <h2 className="as-title">{t?.noProductFound || "Product not found"}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="as-container as-page as-flex-row as-story-page" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
      
      {/* Left side - Product details */}
      <div className="as-product-panel" style={{ flex: '1 1 300px' }}>
        <div className="as-card as-product">
          <img src={product.image_url} alt={product.title} className="as-img" />
          <div className="as-product-body">
            <h2 className="as-title">{product.title}</h2>
            <div className="as-product-meta" style={{ marginBottom: "16px" }}>
              <span className="as-chip">{product.category}</span>
              <span className="as-price">₹{product.price}</span>
            </div>
            <p className="as-muted">
              {product.description?.en || product.description?.hi
                ? lang === "hi"
                  ? product.description.hi
                  : product.description.en
                : (t?.noDescription || "No description available yet.")}
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Chat assistant */}
      <div className="as-chat-panel as-card" style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column' }}>
        <h2 className="as-section-title">{t?.storyAssistant || "AI Story Assistant"}</h2>
        <p className="as-muted" style={{ marginBottom: "20px" }}>
          {t?.storyAssistantDesc || "Let's uncover the unique story behind your creation."}
        </p>

        {!sessionId && (
          <button className="as-btn" onClick={startSession} style={{ alignSelf: "flex-start" }}>
            {t?.startInterview || "Start Interview ✨"}
          </button>
        )}

        {sessionId && (
          <div className="as-chat-window" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px", padding: "10px" }}>
            
            {history.map((item, i) => (
              <div key={i} className="as-chat-bubble-group" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div className="as-chip" style={{ alignSelf: "flex-start", backgroundColor: "var(--as-bg)", border: "1px solid var(--as-surface)", maxWidth: "80%" }}>
                  <strong style={{ color: "var(--as-primary)" }}>{t?.question || "AI"}:</strong> {showText(item.q)}
                </div>
                <div className="as-chip" style={{ alignSelf: "flex-end", backgroundColor: "var(--as-primary)", color: "var(--as-bg)", maxWidth: "80%" }}>
                  <strong>{t?.answer || "You"}:</strong> {lang === "hi" ? item.a.hi : item.a.en}
                </div>
              </div>
            ))}

            {question && !story && (
              <div className="as-chip" style={{ alignSelf: "flex-start", backgroundColor: "var(--as-bg)", border: "1px solid var(--as-primary)" }}>
                {showText(question)}
              </div>
            )}

            {story && (
              <div className="as-card" style={{ marginTop: "16px", border: "2px solid var(--as-primary)" }}>
                <h3 className="as-title">{t?.finalStory || "Your Generated Story"}</h3>
                <p style={{ lineHeight: "1.6", marginTop: "12px", color: "var(--as-text)" }}>{showText(story)}</p>
              </div>
            )}
          </div>
        )}

        {/* Input Area */}
        {story && (
          <div className="as-chat-input-row" style={{ marginTop: "auto", paddingTop: "16px", borderTop: "1px solid var(--as-surface)" }}>
            <button className="as-btn" onClick={submitStory} style={{ width: "100%", justifyContent: "center" }}>
              {t?.submit || "Save Story to Product"}
            </button>
          </div>
        )}

        {question && !story && (
          <div className="as-chat-input-row" style={{ display: "flex", gap: "12px", marginTop: "auto", paddingTop: "16px", borderTop: "1px solid var(--as-surface)" }}>
            <input
              type="text"
              className="as-input-field"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={t?.typeAnswer || "Type your answer..."}
              onKeyDown={(e) => e.key === 'Enter' && submitAnswer()}
              style={{ flex: 1 }}
            />
            <button className="as-btn" onClick={submitAnswer}>
              {t?.submit || "Send"}
            </button>
            <button className="as-btn as-btn-ghost" onClick={stopInterview}>
              {t?.stopInterview || "Stop"}
            </button>
          </div>
        )}
      </div>
      
    </div>
  );
}