import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import supabaseProductService from "../../../services/SupabaseProductService";
import adminProductImageService, { type AdminProductImage } from "../../../services/AdminProductImageService";
import categoryService from "../../../services/CategoryService";
import attributeService from "../../../services/AttributeService";
import type { Product } from "../../../models/Product";
import type { Category } from "../../../models/Category";
import type { CatalogAttribute } from "../../../models/Catalog";
import "./AdminProductDetailPage.css";

export default function AdminProductDetailPage() {
  const navigate = useNavigate();
  const { productId = "", businessSlug = "" } = useParams();
  const base = `/admin/business/${businessSlug}`;
  const [product, setProduct] = useState<Product>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [attributes, setAttributes] = useState<CatalogAttribute[]>([]);
  const [images, setImages] = useState<AdminProductImage[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", productCode: "", categoryId: "", mrp: "", sellingPrice: "", packagingUnit: "", stockStatus: "AVAILABLE", shortDescription: "", description: "", isFeatured: false });
  const [attributeValues, setAttributeValues] = useState<Record<string, string>>({});

  const load = async () => {
    const [p, c, a, i] = await Promise.all([supabaseProductService.getProductById(productId), categoryService.getCategories(), attributeService.getFilterableAttributes(), adminProductImageService.getProductImages(productId)]);
    if (!p) return;
    setProduct(p); setCategories(c); setAttributes(a); setImages(i);
    setForm({ name: p.name, productCode: p.productCode, categoryId: p.categories.find((x) => x.isPrimary)?.id ?? p.categories[0]?.id ?? "", mrp: String(p.mrp), sellingPrice: p.sellingPrice === null ? "" : String(p.sellingPrice), packagingUnit: p.packagingUnit, stockStatus: p.stockStatus, shortDescription: p.shortDescription, description: p.description, isFeatured: p.isFeatured });
    const values: Record<string, string> = {};
    for (const attr of a) {
      const existing = p.attributes.find((x) => x.attributeId === attr.id);
      const option = attr.options.find((o) => o.value === existing?.value);
      if (option) values[attr.id] = option.id;
    }
    setAttributeValues(values);
  };

  useEffect(() => { load().catch((e) => { console.error(e); setError("Unable to load product."); }); }, [productId]);

  const handleSave = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const { error: productError } = await supabase.from("products").update({ name: form.name.trim(), product_code: form.productCode.trim() || null, mrp: Number(form.mrp), selling_price: form.sellingPrice ? Number(form.sellingPrice) : null, packaging_unit: form.packagingUnit.trim() || null, stock_status: form.stockStatus, short_description: form.shortDescription.trim() || null, description: form.description.trim() || null, is_featured: form.isFeatured }).eq("id", productId);
      if (productError) throw productError;
      await supabase.from("product_categories").delete().eq("product_id", productId);
      if (form.categoryId) { const { error } = await supabase.from("product_categories").insert({ product_id: productId, category_id: form.categoryId, is_primary: true }); if (error) throw error; }
      await supabase.from("product_attribute_values").delete().eq("product_id", productId);
      const rows = attributes.flatMap((attribute) => attributeValues[attribute.id] ? [{ product_id: productId, attribute_id: attribute.id, option_id: attributeValues[attribute.id] }] : []);
      if (rows.length) { const { error } = await supabase.from("product_attribute_values").insert(rows); if (error) throw error; }
      if (selectedImages.length) await adminProductImageService.uploadProductImages(productId, form.productCode, selectedImages, images.length + 1);
      setSelectedImages([]); setEditMode(false); await load();
    } catch (e) { console.error(e); setError(e instanceof Error ? e.message : "Unable to save product."); }
    finally { setSaving(false); }
  };

  const onImages = (event: ChangeEvent<HTMLInputElement>) => setSelectedImages(Array.from(event.target.files ?? []));
  const deleteImage = async (image: AdminProductImage) => { if (!window.confirm("Delete this image?")) return; await adminProductImageService.deleteProductImage(image); await load(); };
  const deleteProduct = async () => { if (!window.confirm("Delete this product?")) return; await supabaseProductService.deleteProduct(productId); navigate(`${base}/products`); };

  if (!product) return <div className="admin-product-detail-page__state">{error || "Loading product..."}</div>;
  return <div className="admin-product-detail-page">
    <div className="admin-product-detail-page__header"><div><h1>{product.name}</h1><p>{product.productCode}</p></div><button type="button" onClick={() => navigate(`${base}/products`)}>← Back</button></div>
    {error && <div className="admin-product-detail-page__error">{error}</div>}
    <section className="admin-product-detail-page__image-section"><div className="admin-product-detail-page__image-header"><div><h2>Product Images</h2><p>Images are stored in Cloudflare R2. The first image is primary.</p></div>{editMode && <label className="admin-product-detail-page__image-picker">+ Add Images<input type="file" accept="image/*" multiple onChange={onImages} /></label>}</div>
      <div className="admin-product-detail-page__image-grid">{images.map((image, index) => <div key={image.id} className="admin-product-detail-page__image-card"><img src={image.imageUrl} alt={`${product.name} ${index + 1}`} /><div className="admin-product-detail-page__image-position">{index === 0 ? "Primary" : `#${index + 1}`}</div>{editMode && <button type="button" className="admin-product-detail-page__image-delete" onClick={() => deleteImage(image)}>Delete</button>}</div>)}</div>
      {selectedImages.length > 0 && <p>{selectedImages.length} new image(s) selected. They will upload when you save.</p>}
    </section>
    {!editMode ? <section className="admin-product-detail-page__card"><div className="admin-product-detail-page__details"><div><span>Product Name</span><strong>{product.name}</strong></div><div><span>Category</span><strong>{product.categoryName || "—"}</strong></div><div><span>Brand</span><strong>{product.brand?.name || "—"}</strong></div><div><span>MRP</span><strong>₹{product.mrp.toLocaleString("en-IN")}</strong></div>{product.attributes.map((a) => <div key={a.attributeId}><span>{a.attributeName}</span><strong>{a.value}</strong></div>)}</div><div className="admin-product-detail-page__actions"><button type="button" onClick={() => setEditMode(true)}>Edit Product</button><button type="button" onClick={deleteProduct}>Delete Product</button></div></section>
    : <form className="admin-product-detail-page__card" onSubmit={handleSave}><div className="admin-product-detail-page__form-grid"><label><span>Name</span><input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></label><label><span>Code</span><input value={form.productCode} onChange={(e) => setForm((f) => ({ ...f, productCode: e.target.value }))} /></label><label><span>Category</span><select value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label><span>MRP</span><input type="number" value={form.mrp} onChange={(e) => setForm((f) => ({ ...f, mrp: e.target.value }))} /></label><label><span>Selling Price</span><input type="number" value={form.sellingPrice} onChange={(e) => setForm((f) => ({ ...f, sellingPrice: e.target.value }))} /></label><label><span>Packaging Unit</span><input value={form.packagingUnit} onChange={(e) => setForm((f) => ({ ...f, packagingUnit: e.target.value }))} /></label>{attributes.map((a) => <label key={a.id}><span>{a.name}</span><select value={attributeValues[a.id] ?? ""} onChange={(e) => setAttributeValues((v) => ({ ...v, [a.id]: e.target.value }))}><option value="">Select</option>{a.options.map((o) => <option key={o.id} value={o.id}>{o.value}</option>)}</select></label>)}</div><div className="admin-product-detail-page__actions"><button type="button" onClick={() => setEditMode(false)}>Cancel</button><button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</button></div></form>}
  </div>;
}
