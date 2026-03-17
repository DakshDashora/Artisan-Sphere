import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // 👈 Unified hook
import { useLanguage } from "../contexts/LanguageContext";
import { BASE_URL } from "../baseurl"; // 👈 Using BASE_URL

import GenerateDescriptionModal from "../components/GenerateDescriptionModal";
// import CreateStoryModal from "../components/CreateStoryModal"; // Unused in this file right now

export default function ArtisanProducts() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const nav = useNavigate();

    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Protect route: Kick non-artisans back to login
    useEffect(() => {
        if (!user || user.role !== "artisan") {
            nav("/login");
        }
    }, [user, nav]);

    // Fetch artisan's products from FastAPI
    useEffect(() => {
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

        fetchMyProducts();
    }, [user, t]);

    const handleGenerateClick = (product) => {
        setSelectedProduct(product);
        setShowModal(true);
    };

    return (
        <div className="as-container as-dashboard">
            <h1 className="as-section-title">{t?.products || "My Products"}</h1>
            
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
                            {/* Updated to image_url to match FastAPI */}
                            <img src={p.image_url} alt={p.title} className="as-img" />
                            
                            <div className="as-product-body">
                                <div className="as-product-title">{p.title}</div>
                                
                                <div className="as-product-meta">
                                    <span className="as-chip">{p.category || "Uncategorized"}</span>
                                    <span className="as-price">₹{p.price}</span>
                                </div>
                                
                                <div className="as-row-gap" style={{ marginTop: "16px" }}>
                                    <button
                                        className="as-btn"
                                        onClick={() => handleGenerateClick(p)}
                                    >
                                        {t?.generateDescription || "Generate Description"}
                                    </button>
                                    
                                    {/* Notice I swapped to an outline/ghost button to create visual hierarchy! */}
                                    <button
                                        className="as-btn as-btn-ghost"
                                        onClick={() => nav(`/artisan/story/${p.id}`)}
                                    >
                                        {t?.createStory || "Create Story"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && selectedProduct && (
                <GenerateDescriptionModal
                    product={selectedProduct}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
}