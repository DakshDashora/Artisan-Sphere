import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import ArtisanDashboard from "./pages/ArtisanDashboard";
import AddProduct from "./pages/AddProduct"
import ProtectedRoute from "./routes/ProtectedRoute";
import Profile from "./pages/Profile";
import ArtisanProducts from "./pages/ArtisanProduct";
import CreateStoryPage from "./components/CreateStoryModal";
import ExploreMarketplace from "./pages/ExploreMarketplace";
import ProductPage from "./pages/ProductPage";
import SearchResults from "./pages/SearchResult";
import UnderProduction from "./pages/UnderProduction";
import NotFound from "./pages/NotFound";
export default function App()
{
    return (
        <>
            <Navbar />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/marketplace" element={<ExploreMarketplace />} />

               <Route
                path="/artisan/dashboard"
                element={
                  <ProtectedRoute role="artisan">
                    <ArtisanDashboard />
                  </ProtectedRoute>
                }
              />
             <Route
                path="/artisan/add-product"
                element={
                  <ProtectedRoute role="artisan">
                    <AddProduct />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/artisan/products"
                element={
                  <ProtectedRoute role="artisan" >
                    <ArtisanProducts />
                  </ProtectedRoute>
                }
              />
                <Route
                path="/artisan/story/:id"
                element={
                  <ProtectedRoute role="artisan">
                    <CreateStoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/artisan/manage-orders"
                element={
                  <ProtectedRoute role="artisan">
                    <UnderProduction />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/favourites"
                element={
                  <ProtectedRoute role="artisan">
                    <UnderProduction />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute >
                    <Profile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/product/:id"
                element={
                  <ProtectedRoute >
                    <ProductPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/customer/cart"
                element={
                  <ProtectedRoute  >
                    <UnderProduction />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/orders"
                element={
                  <ProtectedRoute >
                    <UnderProduction />
                  </ProtectedRoute>
                }
              />
             

              <Route path="*" element={<NotFound />} />
           </Routes> 
            <Footer />
        </>
    )
}


