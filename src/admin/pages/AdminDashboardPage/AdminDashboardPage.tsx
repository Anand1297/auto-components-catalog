import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import businessCatalogService from "../../../services/BusinessCatalogService";
import "./AdminDashboardPage.css";

function AdminDashboardPage() {
  const { businessSlug = "" } = useParams();
  const [businessName, setBusinessName] = useState("Business Catalog");
  const base = `/admin/business/${businessSlug}`;

  useEffect(() => {
    businessCatalogService.setActiveBusinessSlug(businessSlug);
    void businessCatalogService.getBusiness().then((business) => setBusinessName(business.name)).catch(console.error);
  }, [businessSlug]);

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__header"><h2 className="admin-dashboard__title">Dashboard</h2><p className="admin-dashboard__subtitle">Manage your {businessName} catalog.</p></div>
      <div className="admin-dashboard__grid">
        <Link to={`${base}/products`} className="admin-dashboard__card"><h3>Products</h3><p>View and manage products.</p></Link>
        <Link to={`${base}/products/new`} className="admin-dashboard__card"><h3>Add Product</h3><p>Add a new product to the catalog.</p></Link>
        <Link to={`${base}/categories`} className="admin-dashboard__card"><h3>Categories</h3><p>Organize products into catalog categories.</p></Link>
        <Link to={`/catalog/${businessSlug}`} className="admin-dashboard__card"><h3>View Catalog</h3><p>Open the customer-facing catalog.</p></Link>
      </div>
    </div>
  );
}
export default AdminDashboardPage;
