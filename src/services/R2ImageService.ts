import { supabase } from "../lib/supabase";

export interface UploadedProductImage {
  imageKey: string;
  imageUrl: string;
}

class R2ImageService {
  // ============================================================
  // UPLOAD
  // ============================================================

  async uploadProductImage(
    file: File,
    productCode: string,
  ): Promise<UploadedProductImage> {
    const formData =
      new FormData();

    formData.append(
      "file",
      file,
    );

    formData.append(
      "productCode",
      productCode,
    );

    const {
      data,
      error,
    } =
      await supabase.functions.invoke(
        "upload-product-image",
        {
          body: formData,
        },
      );

    if (error) {
      console.error(
        "Failed to upload R2 image:",
        error,
      );

      throw new Error(
        "Unable to upload product image.",
      );
    }

    if (
      !data?.imageKey ||
      !data?.imageUrl
    ) {
      throw new Error(
        "Invalid response from image upload.",
      );
    }

    return {
      imageKey:
        data.imageKey,

      imageUrl:
        data.imageUrl,
    };
  }

  // ============================================================
  // DELETE
  // ============================================================

  async deleteProductImage(
    imageKey: string,
  ): Promise<void> {
    if (!imageKey) {
      throw new Error(
        "Image key is required.",
      );
    }

    const {
      data,
      error,
    } =
      await supabase.functions.invoke(
        "delete-product-image",
        {
          body: {
            imageKey,
          },
        },
      );

    if (error) {
      console.error(
        "Failed to delete R2 image:",
        error,
      );

      throw new Error(
        "Unable to delete product image from R2.",
      );
    }

    if (!data?.success) {
      throw new Error(
        data?.error ||
          "Unable to delete product image from R2.",
      );
    }
  }
}

const r2ImageService =
  new R2ImageService();

export default r2ImageService;