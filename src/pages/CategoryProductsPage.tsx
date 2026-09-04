import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabaseProductService from "../services/SupabaseProductService";
import categoryService from "../services/CategoryService";
import attributeService from "../services/AttributeService";
import ProductFilters from "../components/ProductFilters/ProductFilters";
import ProductCard from "../features/latest-launch/ProductCard";
import type { Product } from "../models/Product";
import type { CatalogAttribute } from "../models/Catalog";
import "./CategoryProductsPage.css";

export default function CategoryProductsPage() {
  const navigate = useNavigate();
  const { categorySlug = "" } = useParams();
  const [name, setName] = useState(categorySlug);
  const [products, setProducts] = useState<Product[]>([]);
  const [attributes, setAttributes] = useState<CatalogAttribute[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [attributeFilters, setAttributeFilters] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([supabaseProductService.getProductsByCategorySlug(categorySlug), categoryService.getCategoryBySlug(categorySlug), attributeService.getFilterableAttributes()])
      .then(([p, c, a]) => { setProducts(p); setName(c?.name ?? categorySlug); setAttributes(a); }).catch(console.error);
  }, [categorySlug]);

  const filtered = useMemo(() => products.filter((product) => {
    const search = searchTerm.toLowerCase();
    if (search && ![product.name, product.productCode, product.brand?.name ?? ""].some((v) => v.toLowerCase().includes(search))) return false;
    return Object.entries(attributeFilters).every(([slug, value]) => !value || product.attributes.some((a) => a.attributeSlug === slug && a.value === value));
  }), [products, searchTerm, attributeFilters]);

  return <main className="category-products-page"><div className="container"><button type="button" className="category-products-page__back" onClick={() => navigate(-1)}>← Back</button><h1>{name}</h1><p className="category-products-page__subtitle">Products in this category</p>
    <ProductFilters searchTerm={searchTerm} attributes={attributes} attributeFilters={attributeFilters} showCategoryFilters={false} onSearchChange={setSearchTerm} onAttributeChange={(slug, value) => setAttributeFilters((current) => ({ ...current, [slug]: value }))} onClear={() => { setSearchTerm(""); setAttributeFilters({}); }} />
    <div className="category-products-page__count">Showing {filtered.length} products</div><div className="category-products-page__grid">{filtered.map((p) => <ProductCard key={p.id} product={p} />)}</div>
  </div></main>;
}
