import {
  Route,
  Routes,
} from "react-router-dom";

import AdminLayout
  from "../layout/AdminLayout";

import ProtectedAdminRoute
  from "../components/ProtectedAdminRoute/ProtectedAdminRoute";

import AdminDashboardPage
  from "../pages/AdminDashboardPage/AdminDashboardPage";

import AdminProductsPage
  from "../pages/AdminProductsPage/AdminProductsPage";

import AdminAddProductPage
  from "../pages/AdminAddProductPage/AdminAddProductPage";

import AdminProductDetailPage
  from "../pages/AdminProductDetailPage/AdminProductDetailPage";

function AdminRoutes() {
  return (
    <ProtectedAdminRoute>
      <Routes>

        <Route element={<AdminLayout />}>

          {/* /admin */}
          <Route
            index
            element={<AdminDashboardPage />}
          />

          {/* /admin/products */}
          <Route
            path="products"
            element={<AdminProductsPage />}
          />

          {/* /admin/products/new */}
          <Route
            path="products/new"
            element={<AdminAddProductPage />}
          />

          {/* /admin/products/:productId */}
          <Route
            path="products/:productId"
            element={
              <AdminProductDetailPage />
            }
          />

        </Route>

      </Routes>
    </ProtectedAdminRoute>
  );
}

export default AdminRoutes;