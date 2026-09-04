import { supabase } from "../lib/supabase";

export interface UploadedProductImage { storageKey: string; imageUrl: string; }

class R2ImageService {
  async uploadProductImage(file: File, businessSlug: string, productId: string): Promise<UploadedProductImage> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("businessSlug", businessSlug);
    formData.append("productId", productId);

    const { data, error } = await supabase.functions.invoke("upload-business-product-image", { body: formData });
    if (error) throw error;
    if (!data?.storageKey || !data?.imageUrl) throw new Error("Invalid response from image upload.");
    return { storageKey: data.storageKey, imageUrl: data.imageUrl };
  }

  async deleteProductImage(storageKey: string): Promise<void> {
    const { data, error } = await supabase.functions.invoke("delete-business-product-image", { body: { storageKey } });
    if (error) throw error;
    if (!data?.success) throw new Error(data?.error || "Unable to delete image.");
  }
}

export default new R2ImageService();
