import { supabase } from "../lib/supabase";
import r2ImageService from "./R2ImageService";
import businessCatalogService from "./BusinessCatalogService";

export interface AdminProductImage {
  id: string;
  productId: string;
  storageKey: string;
  imageKey: string;
  imageUrl: string;
  sortOrder: number;
  isPrimary: boolean;
}

class AdminProductImageService {
  async getProductImages(productId: string): Promise<AdminProductImage[]> {
    const { data, error } = await supabase.from("product_images")
      .select("id,product_id,storage_key,image_url,sort_order,is_primary")
      .eq("product_id", productId).order("sort_order");
    if (error) throw error;
    return (data ?? []).map((row: any) => ({ id: row.id, productId: row.product_id, storageKey: row.storage_key ?? "", imageKey: row.storage_key ?? "", imageUrl: row.image_url ?? "", sortOrder: row.sort_order ?? 0, isPrimary: Boolean(row.is_primary) }));
  }

  async uploadProductImages(productId: string, _productCode: string, files: File[], startingSortOrder: number): Promise<AdminProductImage[]> {
    const business = await businessCatalogService.getBusiness();
    const uploaded: AdminProductImage[] = [];
    for (let i = 0; i < files.length; i += 1) {
      const r2 = await r2ImageService.uploadProductImage(files[i], business.slug, productId);
      const sortOrder = startingSortOrder + i;
      const { data, error } = await supabase.from("product_images").insert({
        product_id: productId,
        image_url: r2.imageUrl,
        storage_provider: "R2",
        storage_key: r2.storageKey,
        sort_order: sortOrder,
        is_primary: sortOrder === 1,
      }).select("id,product_id,storage_key,image_url,sort_order,is_primary").single();
      if (error) { await r2ImageService.deleteProductImage(r2.storageKey).catch(console.error); throw error; }
      uploaded.push({ id: data.id, productId: data.product_id, storageKey: data.storage_key ?? "", imageKey: data.storage_key ?? "", imageUrl: data.image_url, sortOrder: data.sort_order ?? sortOrder, isPrimary: Boolean(data.is_primary) });
    }
    return uploaded;
  }

  async deleteProductImage(image: AdminProductImage): Promise<void> {
    if (image.storageKey) await r2ImageService.deleteProductImage(image.storageKey);
    const { error } = await supabase.from("product_images").delete().eq("id", image.id);
    if (error) throw error;
  }

  async updateSortOrder(images: AdminProductImage[]): Promise<void> {
    for (let i = 0; i < images.length; i += 1) {
      const { error } = await supabase.from("product_images").update({ sort_order: i + 1, is_primary: i === 0 }).eq("id", images[i].id);
      if (error) throw error;
    }
  }
}

export default new AdminProductImageService();
