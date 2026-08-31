import { supabase } from "../lib/supabase";
import r2ImageService from "./R2ImageService";

export interface AdminProductImage {
  id: string;
  productId: string;
  imageKey: string;
  imageUrl: string;
  sortOrder: number;
}

interface ProductImageRow {
  id: string;
  product_id: string;
  image_key: string | null;
  image_url: string;
  sort_order: number | null;
}

class AdminProductImageService {
  // ============================================================
  // GET IMAGES
  // ============================================================

  async getProductImages(
    productId: string,
  ): Promise<AdminProductImage[]> {
    const { data, error } = await supabase
      .from("product_images")
      .select(
        `
        id,
        product_id,
        image_key,
        image_url,
        sort_order
        `,
      )
      .eq("product_id", productId)
      .order("sort_order", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Failed to load product images:",
        error,
      );

      throw new Error(
        "Unable to load product images.",
      );
    }

    return ((data ?? []) as ProductImageRow[]).map(
      (image) => ({
        id: image.id,
        productId: image.product_id,
        imageKey: image.image_key ?? "",
        imageUrl: image.image_url,
        sortOrder: image.sort_order ?? 0,
      }),
    );
  }

  // ============================================================
  // UPLOAD IMAGES
  // ============================================================

  async uploadProductImages(
    productId: string,
    productCode: string,
    files: File[],
    startingSortOrder: number,
  ): Promise<AdminProductImage[]> {
    const uploadedImages: AdminProductImage[] = [];

    for (
      let index = 0;
      index < files.length;
      index += 1
    ) {
      const file = files[index];

      const uploaded =
        await r2ImageService.uploadProductImage(
          file,
          productCode,
        );

      const sortOrder =
        startingSortOrder + index;

      const { data, error } = await supabase
        .from("product_images")
        .insert({
          product_id: productId,
          image_key: uploaded.imageKey,
          image_url: uploaded.imageUrl,
          sort_order: sortOrder,
        })
        .select(
          `
          id,
          product_id,
          image_key,
          image_url,
          sort_order
          `,
        )
        .single();

      if (error) {
        console.error(
          "Failed to save product image:",
          error,
        );

        /*
         * R2 upload succeeded but DB insert failed.
         * Clean up the uploaded R2 object.
         */
        try {
          await r2ImageService.deleteProductImage(
            uploaded.imageKey,
          );
        } catch (cleanupError) {
          console.error(
            "Failed to clean R2 image:",
            cleanupError,
          );
        }

        throw new Error(
          "Unable to save uploaded image.",
        );
      }

      const row = data as ProductImageRow;

      uploadedImages.push({
        id: row.id,
        productId: row.product_id,
        imageKey: row.image_key ?? "",
        imageUrl: row.image_url,
        sortOrder: row.sort_order ?? sortOrder,
      });
    }

    return uploadedImages;
  }

  // ============================================================
  // DELETE IMAGE
  // ============================================================

  async deleteProductImage(
    image: AdminProductImage,
  ): Promise<void> {
    /*
     * Delete R2 object first.
     */
    if (image.imageKey) {
      await r2ImageService.deleteProductImage(
        image.imageKey,
      );
    }

    /*
     * R2 deletion succeeded.
     * Now remove DB record.
     */
    const { error } = await supabase
      .from("product_images")
      .delete()
      .eq("id", image.id);

    if (error) {
      console.error(
        "Failed to delete product image row:",
        error,
      );

      throw new Error(
        "Image was removed from storage but its database record could not be deleted.",
      );
    }
  }

  // ============================================================
  // REORDER
  // ============================================================

  async updateSortOrder(
    images: AdminProductImage[],
  ): Promise<void> {
    for (
      let index = 0;
      index < images.length;
      index += 1
    ) {
      const { error } = await supabase
        .from("product_images")
        .update({
          sort_order: index + 1,
        })
        .eq("id", images[index].id);

      if (error) {
        console.error(
          "Failed to update image order:",
          error,
        );

        throw new Error(
          "Unable to update image order.",
        );
      }
    }
  }
}

export default new AdminProductImageService();