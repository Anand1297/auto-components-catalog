import { useEffect, useMemo, useState } from "react";
import supabaseProductService from "../../services/SupabaseProductService";
import categoryService from "../../services/CategoryService";
import attributeService from "../../services/AttributeService";
import { supabase } from "../../lib/supabase";
import businessCatalogService from "../../services/BusinessCatalogService";
import ProductFilters from "../../components/ProductFilters/ProductFilters";
import ProductCard from "../../features/latest-launch/ProductCard";
import type { Product } from "../../models/Product";
import type { Category } from "../../models/Category";
import type { Brand, CatalogAttribute } from "../../models/Catalog";
import "./ProductsPage.css";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [attributes, setAttributes] = useState<CatalogAttribute[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [brandSlug, setBrandSlug] = useState("");
  const [attributeFilters, setAttributeFilters] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      supabaseProductService.getProducts(),
      categoryService.getCategories(),
      attributeService.getFilterableAttributes(),
      businessCatalogService.getBusiness().then(async (business) => {
        const { data, error } = await supabase.from("brands").select("id,name,slug,logo_url").eq("business_id", business.id).eq("is_active", true).order("sort_order");
        if (error) throw error;
        return (data ?? []).map((b) => ({ id: b.id, name: b.name, slug: b.slug, logoUrl: b.logo_url }));
      }),
    ]).then(([p, c, a, b]) => { setProducts(p); setCategories(c); setAttributes(a); setBrands(b); }).catch(console.error);
  }, []);

  const filtered = useMemo(() => products.filter((product) => {
    const search = searchTerm.trim().toLowerCase();
    if (search && ![product.name, product.productCode, product.brand?.name ?? ""].some((v) => v.toLowerCase().includes(search))) return false;
    if (categorySlug && !product.categories.some((c) => c.slug === categorySlug)) return false;
    if (brandSlug && product.brand?.slug !== brandSlug) return false;
    return Object.entries(attributeFilters).every(([slug, value]) => !value || product.attributes.some((a) => a.attributeSlug === slug && a.value === value));
  }), [products, searchTerm, categorySlug, brandSlug, attributeFilters]);

  const clear = () => { setSearchTerm(""); setCategorySlug(""); setBrandSlug(""); setAttributeFilters({}); };
  return (
    <main className="products-page"><div className="container"><h1>All Products</h1><p>Browse the complete catalog.</p>
      <ProductFilters searchTerm={searchTerm} categorySlug={categorySlug} categories={categories} brandSlug={brandSlug} brands={brands} attributes={attributes} attributeFilters={attributeFilters} onSearchChange={setSearchTerm} onCategoryChange={setCategorySlug} onBrandChange={setBrandSlug} onAttributeChange={(slug, value) => setAttributeFilters((current) => ({ ...current, [slug]: value }))} onClear={clear} />
      <div className="products-page__count">Showing {filtered.length} products</div>
      <div className="products-page__grid">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div>
    </div></main>
  );
}
