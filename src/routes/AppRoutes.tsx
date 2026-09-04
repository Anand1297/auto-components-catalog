import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "../components/Layout";
import HomePage from "../components/HomePage";
import CategoryProductsPage from "../pages/CategoryProductsPage";
import ProductDetailPage from "../pages/ProductDetailPage";
import ProductsPage from "../pages/ProductsPage/ProductsPage";
import PlatformLandingPage from "../pages/PlatformLandingPage/PlatformLandingPage";
import BusinessRouteScope from "../components/BusinessRouteScope/BusinessRouteScope";
import AdminRoutes from "../admin/routes/AdminRoutes";
import AdminLoginPage from "../admin/pages/AdminLoginPage/AdminLoginPage";
import SetPasswordPage from "../pages/SetPasswordPage/SetPasswordPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PlatformLandingPage />} />
        <Route path="/login" element={<AdminLoginPage />} />
        <Route path="/set-password" element={<SetPasswordPage />} />

        <Route path="/catalog/:businessSlug" element={<BusinessRouteScope><Layout /></BusinessRouteScope>}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="category/:categorySlug" element={<CategoryProductsPage />} />
          <Route path="product/:productSlug" element={<ProductDetailPage />} />
        </Route>

        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}
