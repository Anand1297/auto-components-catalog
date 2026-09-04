import { supabase } from "../lib/supabase";
import businessCatalogService from "./BusinessCatalogService";
import type { Product } from "../models/Product";

interface ProductFilterOptions {
  searchTerm?: string;
  categorySlug?: string;
  brandSlug?: string;
  attributeFilters?: Record<string, string>;
}

const selectQuery = `
  id,business_id,name,slug,product_code,short_description,description,mrp,selling_price,packaging_unit,stock_status,is_featured,created_at,
  brand:brands(id,name,slug),
  product_images(id,image_url,storage_key,sort_order,is_primary),
  product_categories(is_primary,category:categories(id,name,slug,parent_id)),
  product_attribute_values(
    value_text,value_number,value_boolean,
    attribute:attributes(id,name,slug),
    option:attribute_options(id,value,slug)
  )
`;

function mapProduct(row: any): Product {
  const categories = (row.product_categories ?? [])
    .filter((item: any) => item.category)
    .map((item: any) => ({
      id: item.category.id,
      name: item.category.name,
      slug: item.category.slug,
      parentId: item.category.parent_id,
      isPrimary: Boolean(item.is_primary),
    }));

  const imageRecords = (row.product_images ?? [])
    .slice()
    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((item: any) => ({
      id: item.id,
      imageUrl: item.image_url ?? "",
      storageKey: item.storage_key ?? null,
      sortOrder: item.sort_order ?? 0,
      isPrimary: Boolean(item.is_primary),
    }));

  const attributes = (row.product_attribute_values ?? []).map((item: any) => {
    let value = item.option?.value ?? item.value_text ?? "";
    if (item.value_number !== null && item.value_number !== undefined) value = String(item.value_number);
    if (item.value_boolean !== null && item.value_boolean !== undefined) value = item.value_boolean ? "Yes" : "No";
    return {
      attributeId: item.attribute?.id ?? "",
      attributeName: item.attribute?.name ?? "",
      attributeSlug: item.attribute?.slug ?? "",
      value,
    };
  }).filter((item: any) => item.attributeId && item.value !== "");

  const primaryCategory = categories.find((item: any) => item.isPrimary) ?? categories[0];
  const attr = (slug: string) => attributes.find((item: any) => item.attributeSlug === slug)?.value ?? "";

  return {
    id: row.id,
    businessId: row.business_id,
    name: row.name,
    slug: row.slug,
    productCode: row.product_code ?? "",
    shortDescription: row.short_description ?? "",
    description: row.description ?? "",
    mrp: Number(row.mrp ?? 0),
    sellingPrice: row.selling_price === null ? null : Number(row.selling_price),
    packagingUnit: row.packaging_unit ?? "",
    stockStatus: row.stock_status ?? "AVAILABLE",
    isFeatured: Boolean(row.is_featured),
    brand: row.brand ? { id: row.brand.id, name: row.brand.name, slug: row.brand.slug } : null,
    categories,
    attributes,
    images: imageRecords.map((item: any) => item.imageUrl).filter(Boolean),
    imageRecords,

    productName: row.name,
    categoryName: primaryCategory?.name ?? "",
    categoryType: "",
    company: row.brand?.name ?? attr("car-company"),
    car: attr("car-model"),
    model: attr("model"),
    color: attr("color"),
  };
}

class SupabaseProductService {
  async getProducts(): Promise<Product[]> {
    const business = await businessCatalogService.getBusiness();
    const { data, error } = await supabase
      .from("products")
      .select(selectQuery)
      .eq("business_id", business.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapProduct);
  }

  async getProductById(productId: string): Promise<Product | undefined> {
    const business = await businessCatalogService.getBusiness();
    const { data, error } = await supabase
      .from("products")
      .select(selectQuery)
      .eq("business_id", business.id)
      .eq("id", productId)
      .maybeSingle();
    if (error) throw error;
    return data ? mapProduct(data) : undefined;
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const business = await businessCatalogService.getBusiness();
    const { data, error } = await supabase
      .from("products")
      .select(selectQuery)
      .eq("business_id", business.id)
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw error;
    return data ? mapProduct(data) : undefined;
  }

  async getLatestProducts(limit = 8): Promise<Product[]> {
    const products = await this.getProducts();
    return products.slice(0, limit);
  }

  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    const products = await this.getProducts();
    return products.filter((p) => p.isFeatured).slice(0, limit);
  }


  async getProductsByCategory(_categoryType: "INTERIOR" | "EXTERIOR", categoryName?: string): Promise<Product[]> {
    const products = await this.getProducts();
    return categoryName ? products.filter((p) => p.categories.some((c) => c.name === categoryName)) : products;
  }

  async getProductsByCategorySlug(categorySlug: string): Promise<Product[]> {
    const products = await this.getProducts();
    return products.filter((product) => product.categories.some((category) => category.slug === categorySlug));
  }

  async getFilteredProducts(options: ProductFilterOptions = {}): Promise<Product[]> {
    let products = await this.getProducts();
    const search = (options.searchTerm ?? "").trim().toLowerCase();
    if (search) {
      products = products.filter((product) =>
        [product.name, product.productCode, product.brand?.name ?? "", product.shortDescription]
          .some((value) => value.toLowerCase().includes(search)),
      );
    }
    if (options.categorySlug) {
      products = products.filter((p) => p.categories.some((c) => c.slug === options.categorySlug));
    }
    if (options.brandSlug) {
      products = products.filter((p) => p.brand?.slug === options.brandSlug);
    }
    for (const [slug, value] of Object.entries(options.attributeFilters ?? {})) {
      if (!value) continue;
      products = products.filter((p) => p.attributes.some((a) => a.attributeSlug === slug && a.value === value));
    }
    return products;
  }

  async deleteProduct(productId: string): Promise<void> {
    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (error) throw error;
  }
}

export default new SupabaseProductService();
