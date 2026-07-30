import { useMemo, useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { BASE_URL } from "../baseurl"; // 👈 Updated to BASE_URL

import HeroSection from "../components/HeroSection";
import FilterBar from "../components/FilterBar";
import ProductGrid from "../components/ProductGrid";

export default function Index() {
  const { t } = useLanguage();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState(20000);

  // 1️⃣ Dedicated fetch function using the current state
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      let url = `${BASE_URL}/products/getproducts?max_price=${maxPrice}`;
      
      if (category !== "All") {
        url += `&category=${category}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch products");
      
      const data = await response.json();
      setProducts(data);
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  // 2️⃣ Initial load ONLY (empty dependency array)
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // 3️⃣ Filter locally by title (Search Bar stays instant)
  const finalFilteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    
    return products.filter((p) => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  return (
    <div className="as-landing">
      <HeroSection />

      <section id="market" className="as-container as-market">
        
        <FilterBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          category={category}
          setCategory={setCategory}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          onApplyFilters={fetchProducts} // 👈 Pass the fetch function to the button
        />

        <h2 className="as-section-title">{t?.featuredArtworks || "Featured Artworks"}</h2>
        
        {isLoading ? (
          <div className="as-spinner-container">
            <div className="as-spinner"></div>
          </div>
        ) : (
          <ProductGrid products={finalFilteredProducts} />
        )}
        
      </section>
    </div>
  );
}