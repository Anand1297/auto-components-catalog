import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import Layout from "../components/Layout";
import HomePage from "../components/HomePage";
import CategoryProductsPage from "../pages/CategoryProductsPage";
import ProductDetailPage from "../pages/ProductDetailPage";
import ProductsPage from "../pages/ProductsPage/ProductsPage";

import AdminRoutes from "../admin/routes/AdminRoutes";

import AdminLoginPage
  from "../admin/pages/AdminLoginPage/AdminLoginPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            CUSTOMER WEBSITE
           ========================= */}
        <Route element={<Layout />}>

          <Route
            path="/"
            element={<HomePage />}
          />

          <Route
            path="/products"
            element={<ProductsPage />}
          />

          <Route
            path="/category/:categoryType/:categoryName"
            element={<CategoryProductsPage />}
          />

          <Route
            path="/product/:productId"
            element={<ProductDetailPage />}
          />

        </Route>

        {/* =========================
            ADMIN LOGIN
           ========================= */}
        <Route
          path="/login"
          element={<AdminLoginPage />}
        />

        {/* =========================
            ADMIN PANEL
           ========================= */}
        <Route
          path="/admin/*"
          element={<AdminRoutes />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;