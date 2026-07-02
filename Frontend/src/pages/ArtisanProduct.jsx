import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { BASE_URL } from "../baseurl";

import GenerateDescriptionModal from "../components/GenerateDescriptionModal";
import EditProductModal from "../components/EditProductModal";
import Toast from "../components/Toast";

export default function ArtisanProducts() {
    const { user } = useAuth();
    const { t, lang } = useLanguage();
    const nav = useNavigate();

    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showDescModal, setShowDescModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [toast, setToast] = useState(null);

    // Protect route
    useEffect(() => {
        if (!user || user.role !== "artisan") {
            nav("/login");
        }
    }, [user, nav]);

    // Fetch artisan's products
    const fetchMyProducts = async () => {
        if (!user) return;
        setIsLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${BASE_URL}/products/myproducts`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch your products.");
            }

            const data = await response.json();
            setProducts(data);
        } catch (err) {
            console.error("Error fetching artisan products:", err);
            setError(t?.errorFetchingProducts || "Could not load your products.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMyProducts();
    }, [user, t]);

    const handleGenerateClick = (product) => {
        setSelectedProduct(product);
        setShowDescModal(true);
    };

    const handleEditClick = (product) => {
        setSelectedProduct(product);
        setShowEditModal(true);
    };

    const handleSaveProduct = (updatedProduct) => {
        setProducts((prev) =>
            prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
        );
    };

    const { pathname } = useLocation();
    const isAssistantMode = pathname.includes("assistant");

    return (
        <div className="as-container as-dashboard" style={{ paddingBottom: "40px" }}>
            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            )}

            <h1 className="as-section-title">
                {isAssistantMode ? (t?.aiAssistant || "AI Assistant") : (t?.products || "My Products")}
            </h1>
            
            {isAssistantMode && (
                <p className="as-muted" style={{ marginBottom: "24px", fontSize: "1.05rem" }}>
                    {t?.aiAssistantPrompt || "Select a product below to update its description or create its craft story using AI."}
                </p>
            )}
            
            {error && (
                <div style={{ color: "var(--as-danger)", marginBottom: "16px", fontWeight: "600", textAlign: "center" }}>
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="as-spinner-container">
                    <div className="as-spinner"></div>
                </div>
            ) : products.length === 0 ? (
                <div className="as-card" style={{ textAlign: "center", padding: "40px", color: "var(--as-muted)" }}>
                    {t?.noProductsFound || "You haven't added any products yet."}
                </div>
            ) : (
                <div className="as-grid">
                    {products.map((p) => (
                        <div key={p.id} className="as-card as-product">
                            <img src={p.image_url} alt={lang === "hi" && p.title_hi ? p.title_hi : p.title} className="as-img" />
                            
                            <div className="as-product-body">
                                <div className="as-product-title">
                                    {lang === "hi" && p.title_hi ? p.title_hi : p.title}
                                </div>
                                
                                <div className="as-product-meta">
                                    <span className="as-chip">{t?.categories?.[p.category] || p.category}</span>
                                    <span className="as-price">₹{p.price}</span>
                                </div>
                                
                                <div className="as-row-gap" style={{ marginTop: "16px", flexWrap: "wrap" }}>
                                    <button
                                        className="as-btn"
                                        onClick={() => handleGenerateClick(p)}
                                        style={{ flex: "1 1 auto", fontSize: "0.8rem", padding: "8px 12px" }}
                                    >
                                        ✨ {t?.generateDescription || "Description"}
                                    </button>
                                    
                                    <button
                                        className="as-btn"
                                        onClick={() => nav(`/artisan/story/${p.id}`)}
                                        style={{ flex: "1 1 auto", fontSize: "0.8rem", padding: "8px 12px" }}
                                    >
                                        📖 {t?.createStory || "Story"}
                                    </button>

                                    <button
                                        className="as-btn"
                                        onClick={() => handleEditClick(p)}
                                        style={{ flex: "1 1 auto", fontSize: "0.8rem", padding: "8px 12px" }}
                                    >
                                        ✏️ {t?.edit || "Edit"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showDescModal && selectedProduct && (
                <GenerateDescriptionModal
                    product={selectedProduct}
                    onClose={() => {
                        setShowDescModal(false);
                        fetchMyProducts(); // Refresh list to get generated details
                    }}
                />
            )}

            {showEditModal && selectedProduct && (
                <EditProductModal
                    product={selectedProduct}
                    onClose={() => setShowEditModal(false)}
                    onSave={handleSaveProduct}
                />
            )}
        </div>
    );
}