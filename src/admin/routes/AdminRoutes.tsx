import { Route, Routes } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout";
import ProtectedAdminRoute from "../components/ProtectedAdminRoute/ProtectedAdminRoute";
import RootAdminRoute from "../components/RootAdminRoute/RootAdminRoute";
import BusinessAdminRoute from "../components/BusinessAdminRoute/BusinessAdminRoute";
import RootDashboardPage from "../pages/RootDashboardPage/RootDashboardPage";
import AdminDashboardPage from "../pages/AdminDashboardPage/AdminDashboardPage";
import AdminProductsPage from "../pages/AdminProductsPage/AdminProductsPage";
import AdminAddProductPage from "../pages/AdminAddProductPage/AdminAddProductPage";
import AdminProductDetailPage from "../pages/AdminProductDetailPage/AdminProductDetailPage";
import BusinessSettingsPage from "../pages/BusinessSettingsPage/BusinessSettingsPage";
import AdminTestimonialsPage from "../pages/AdminTestimonialsPage/AdminTestimonialsPage";
import AdminCategoriesPage from "../pages/AdminCategoriesPage/AdminCategoriesPage";
import AdminBusinessesPage from "../pages/AdminBusinessesPage/AdminBusinessesPage";
import AdminBusinessUsersPage from "../pages/AdminBusinessUsersPage/AdminBusinessUsersPage";

function AdminRoutes() {
  return (
    <ProtectedAdminRoute>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<RootAdminRoute><RootDashboardPage /></RootAdminRoute>} />
          <Route path="businesses" element={<RootAdminRoute><AdminBusinessesPage /></RootAdminRoute>} />

          <Route path="business/:businessSlug" element={<BusinessAdminRoute><AdminDashboardPage /></BusinessAdminRoute>} />
          <Route path="business/:businessSlug/products" element={<BusinessAdminRoute><AdminProductsPage /></BusinessAdminRoute>} />
          <Route path="business/:businessSlug/products/new" element={<BusinessAdminRoute><AdminAddProductPage /></BusinessAdminRoute>} />
          <Route path="business/:businessSlug/products/:productId" element={<BusinessAdminRoute><AdminProductDetailPage /></BusinessAdminRoute>} />
          <Route path="business/:businessSlug/categories" element={<BusinessAdminRoute><AdminCategoriesPage /></BusinessAdminRoute>} />
          <Route path="business/:businessSlug/testimonials" element={<BusinessAdminRoute><AdminTestimonialsPage /></BusinessAdminRoute>} />
          <Route path="business/:businessSlug/settings" element={<BusinessAdminRoute><BusinessSettingsPage /></BusinessAdminRoute>} />
          <Route path="business/:businessSlug/users" element={<BusinessAdminRoute><RootAdminRoute><AdminBusinessUsersPage /></RootAdminRoute></BusinessAdminRoute>} />
        </Route>
      </Routes>
    </ProtectedAdminRoute>
  );
}

export default AdminRoutes;
