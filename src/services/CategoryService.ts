import { supabase } from "../lib/supabase";
import businessCatalogService from "./BusinessCatalogService";
import type { Category } from "../models/Category";

const fallbackImage = "/categories/default.png";

function mapCategory(row: any): Category {
  return {
    id: row.id,
    businessId: row.business_id,
    name: row.name,
    slug: row.slug,
    parentId: row.parent_id,
    description: row.description ?? "",
    image: row.image_url?.trim() || fallbackImage,
    sortOrder: row.sort_order ?? 0,
    isActive: row.is_active ?? true,
    imageKey: null,
  };
}

class CategoryService {
  async getCategories(): Promise<Category[]> {
    const business = await businessCatalogService.getBusiness();
    const { data, error } = await supabase
      .from("categories")
      .select("id,business_id,name,slug,parent_id,description,image_url,sort_order,is_active")
      .eq("business_id", business.id)
      .eq("is_active", true)
      .order("sort_order")
      .order("name");
    if (error) throw error;
    return (data ?? []).map(mapCategory);
  }

  async getRootCategories(): Promise<Category[]> {
    return (await this.getCategories()).filter((category) => !category.parentId);
  }

  async getCategoriesByType(type: "INTERIOR" | "EXTERIOR"): Promise<Category[]> {
    const root = (await this.getRootCategories()).find((category) => category.slug === type.toLowerCase());
    if (!root) return [];
    return this.getChildren(root.id);
  }

  async getChildren(parentId: string): Promise<Category[]> {
    return (await this.getCategories()).filter((category) => category.parentId === parentId);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return (await this.getCategories()).find((category) => category.slug === slug);
  }

  async createCategory(input: { name: string; parentId?: string | null; description?: string; imageUrl?: string }): Promise<Category> {
    const business = await businessCatalogService.getBusiness();
    const slug = input.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const { data, error } = await supabase.from("categories").insert({ business_id: business.id, name: input.name.trim(), slug, parent_id: input.parentId || null, description: input.description?.trim() || null, image_url: input.imageUrl?.trim() || null, is_active: true }).select("id,business_id,name,slug,parent_id,description,image_url,sort_order,is_active").single();
    if (error) throw error;
    return mapCategory(data);
  }

  async updateCategory(categoryId: string, input: { name: string; parentId?: string | null; description?: string; imageUrl?: string }): Promise<Category> {
    const slug = input.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const { data, error } = await supabase.from("categories").update({ name: input.name.trim(), slug, parent_id: input.parentId || null, description: input.description?.trim() || null, image_url: input.imageUrl?.trim() || null }).eq("id", categoryId).select("id,business_id,name,slug,parent_id,description,image_url,sort_order,is_active").single();
    if (error) throw error;
    return mapCategory(data);
  }

  async deleteCategory(categoryId: string): Promise<void> {
    const { error } = await supabase.from("categories").delete().eq("id", categoryId);
    if (error) throw error;
  }
}

export default new CategoryService();
