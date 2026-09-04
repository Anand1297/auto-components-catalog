import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import businessCatalogService from "../../../services/BusinessCatalogService";
import categoryService from "../../../services/CategoryService";
import attributeService from "../../../services/AttributeService";
import type { Category } from "../../../models/Category";
import type { Brand, CatalogAttribute } from "../../../models/Catalog";
import "./AdminAddProductPage.css";

const slugify = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function AdminAddProductPage() {
  const navigate = useNavigate();
  const { businessSlug = "" } = useParams();
  const base = `/admin/business/${businessSlug}`;
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [attributes, setAttributes] = useState<CatalogAttribute[]>([]);
  const [attributeValues, setAttributeValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", productCode: "", categoryId: "", brandId: "", shortDescription: "", description: "", mrp: "", sellingPrice: "", packagingUnit: "", stockStatus: "AVAILABLE", isFeatured: false });

  useEffect(() => {
    Promise.all([
      categoryService.getCategories(),
      attributeService.getFilterableAttributes(),
      businessCatalogService.getBusiness().then(async (business) => {
        const { data, error } = await supabase.from("brands").select("id,name,slug,logo_url").eq("business_id", business.id).eq("is_active", true).order("sort_order");
        if (error) throw error;
        return (data ?? []).map((b) => ({ id: b.id, name: b.name, slug: b.slug, logoUrl: b.logo_url }));
      }),
    ]).then(([c, a, b]) => { setCategories(c); setAttributes(a); setBrands(b); }).catch((e) => setError(e.message ?? "Unable to load form options."));
  }, []);

  const update = (field: keyof typeof form, value: string | boolean) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!form.name.trim() || !form.categoryId || !form.mrp) { setError("Product name, category and MRP are required."); return; }
    const mrp = Number(form.mrp); const sellingPrice = form.sellingPrice ? Number(form.sellingPrice) : null;
    if (!Number.isFinite(mrp) || mrp < 0 || (sellingPrice !== null && (!Number.isFinite(sellingPrice) || sellingPrice < 0))) { setError("Enter valid prices."); return; }
    setSaving(true);
    try {
      const business = await businessCatalogService.getBusiness();
      const { data: product, error: productError } = await supabase.from("products").insert({
        business_id: business.id, brand_id: form.brandId || null, name: form.name.trim(), slug: `${slugify(form.name)}-${Date.now().toString().slice(-6)}`,
        product_code: form.productCode.trim() || null, short_description: form.shortDescription.trim() || null, description: form.description.trim() || null,
        mrp, selling_price: sellingPrice, packaging_unit: form.packagingUnit.trim() || null, stock_status: form.stockStatus, is_active: true, is_featured: form.isFeatured,
      }).select("id").single();
      if (productError) throw productError;

      const { error: categoryError } = await supabase.from("product_categories").insert({ product_id: product.id, category_id: form.categoryId, is_primary: true });
      if (categoryError) throw categoryError;

      const rows = attributes.flatMap((attribute) => {
        const optionId = attributeValues[attribute.id];
        return optionId ? [{ product_id: product.id, attribute_id: attribute.id, option_id: optionId }] : [];
      });
      if (rows.length) { const { error: attrError } = await supabase.from("product_attribute_values").insert(rows); if (attrError) throw attrError; }
      navigate(`${base}/products/${product.id}`);
    } catch (e) { console.error(e); setError(e instanceof Error ? e.message : "Unable to create product."); }
    finally { setSaving(false); }
  };

  return <div className="admin-add-product-page"><div className="admin-add-product-page__header"><div><h1>Add Product</h1><p>Create a product using the generic business catalog fields.</p></div><button type="button" className="admin-add-product-page__back-button" onClick={() => navigate(`${base}/products`)}>← Back to Products</button></div>
    <form className="admin-add-product-page__form" onSubmit={handleSubmit}>
      {error && <div className="admin-add-product-page__error">{error}</div>}
      <section className="admin-add-product-page__section"><div className="admin-add-product-page__section-header"><h2>Product Information</h2></div><div className="admin-add-product-page__grid">
        <label><span>Product Name *</span><input value={form.name} onChange={(e) => update("name", e.target.value)} /></label>
        <label><span>Product Code</span><input value={form.productCode} onChange={(e) => update("productCode", e.target.value)} /></label>
        <label><span>Primary Category *</span><select value={form.categoryId} onChange={(e) => update("categoryId", e.target.value)}><option value="">Select category</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label><span>Brand</span><select value={form.brandId} onChange={(e) => update("brandId", e.target.value)}><option value="">No brand</option>{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
        <label><span>MRP *</span><input type="number" min="0" value={form.mrp} onChange={(e) => update("mrp", e.target.value)} /></label>
        <label><span>Selling Price</span><input type="number" min="0" value={form.sellingPrice} onChange={(e) => update("sellingPrice", e.target.value)} /></label>
        <label><span>Packaging Unit</span><input value={form.packagingUnit} onChange={(e) => update("packagingUnit", e.target.value)} /></label>
        <label><span>Status</span><select value={form.stockStatus} onChange={(e) => update("stockStatus", e.target.value)}><option value="AVAILABLE">Available</option><option value="OUT_OF_STOCK">Out of stock</option><option value="COMING_SOON">Coming soon</option><option value="DISCONTINUED">Discontinued</option></select></label>
      </div></section>
      <section className="admin-add-product-page__section"><div className="admin-add-product-page__section-header"><h2>Business Attributes</h2><p>These fields are driven by the attributes configured for this business.</p></div><div className="admin-add-product-page__grid">
        {attributes.map((attribute) => <label key={attribute.id}><span>{attribute.name}{attribute.isRequired ? " *" : ""}</span><select value={attributeValues[attribute.id] ?? ""} onChange={(e) => setAttributeValues((current) => ({ ...current, [attribute.id]: e.target.value }))}><option value="">Select {attribute.name}</option>{attribute.options.map((option) => <option key={option.id} value={option.id}>{option.value}</option>)}</select></label>)}
      </div></section>
      <section className="admin-add-product-page__section"><div className="admin-add-product-page__grid"><label><span>Short Description</span><textarea value={form.shortDescription} onChange={(e) => update("shortDescription", e.target.value)} /></label><label><span>Description</span><textarea value={form.description} onChange={(e) => update("description", e.target.value)} /></label><label><span><input type="checkbox" checked={form.isFeatured} onChange={(e) => update("isFeatured", e.target.checked)} /> Featured Product</span></label></div></section>
      <div className="admin-add-product-page__actions"><button type="button" onClick={() => navigate(`${base}/products`)}>Cancel</button><button type="submit" disabled={saving}>{saving ? "Creating..." : "Create Product"}</button></div>
    </form>
  </div>;
}
