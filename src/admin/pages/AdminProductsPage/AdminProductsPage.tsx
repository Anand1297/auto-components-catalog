import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabaseProductService from "../../../services/SupabaseProductService";
import type { Product } from "../../../models/Product";
import "./AdminProductsPage.css";

export default function AdminProductsPage() {
  const navigate = useNavigate();
  const { businessSlug = "" } = useParams();
  const base = `/admin/business/${businessSlug}`;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    supabaseProductService.getProducts().then(setProducts).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => [p.name, p.productCode, p.brand?.name ?? "", p.categoryName].some((v) => v.toLowerCase().includes(q)));
  }, [products, searchTerm]);

  return <div className="admin-products-page">
    <div className="admin-products-page__header"><div><h1>Products</h1><p>Manage products for this business catalog.</p></div><button type="button" className="admin-products-page__add-button" onClick={() => navigate(`${base}/products/new`)}>+ Add Product</button></div>
    <section className="admin-products-page__filters"><div className="admin-products-page__search"><label htmlFor="product-search">Search</label><input id="product-search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search product, code, brand or category..." /></div></section>
    <div className="admin-products-page__result">{loading ? "Loading products..." : `Showing ${filtered.length} products`}</div>
    <section className="admin-products-page__table-container">
      {!loading && filtered.length === 0 ? <div className="admin-products-page__empty"><h2>No products found</h2></div> : <table className="admin-products-page__table"><thead><tr><th>Product</th><th>Code</th><th>Category</th><th>Brand</th><th>Price</th><th>Status</th><th>Action</th></tr></thead><tbody>
        {filtered.map((product) => <tr key={product.id}><td><div className="admin-products-page__product">{product.images[0] ? <img src={product.images[0]} alt={product.name} className="admin-products-page__product-image" /> : <div className="admin-products-page__product-placeholder">No Image</div>}<div><strong>{product.name}</strong><span>{product.shortDescription}</span></div></div></td><td>{product.productCode || "—"}</td><td>{product.categoryName || "—"}</td><td>{product.brand?.name || "—"}</td><td>₹{(product.sellingPrice ?? product.mrp).toLocaleString("en-IN")}</td><td>{product.stockStatus.replaceAll("_", " ")}</td><td><button type="button" onClick={() => navigate(`${base}/products/${product.id}`)}>View / Edit</button></td></tr>)}
      </tbody></table>}
    </section>
  </div>;
}
