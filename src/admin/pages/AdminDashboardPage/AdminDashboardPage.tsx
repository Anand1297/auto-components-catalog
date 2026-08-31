import { Link } from "react-router-dom";
import "./AdminDashboardPage.css";

function AdminDashboardPage() {
  return (
    <div>

      <div className="admin-page-header">

        <div>
          <h2>Dashboard</h2>
          <p>
            Manage your Auto Components catalog.
          </p>
        </div>

      </div>

      <div className="admin-dashboard-grid">

        <Link
          to="/admin/products"
          className="admin-dashboard-card"
        >
          <h3>Products</h3>

          <p>
            View and manage products.
          </p>
        </Link>

        <Link
          to="/admin/products/new"
          className="admin-dashboard-card"
        >
          <h3>Add Product</h3>

          <p>
            Add a new product to the catalog.
          </p>
        </Link>

      </div>

    </div>
  );
}

export default AdminDashboardPage;