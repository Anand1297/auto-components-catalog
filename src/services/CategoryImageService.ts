import { supabase } from "../lib/supabase";

export interface UploadedCategoryImage {
  imageKey: string;
  imageUrl: string;
}

class CategoryImageService {
  async uploadCategoryImage(
    file: File,
    categoryName: string,
  ): Promise<UploadedCategoryImage> {
    const formData =
      new FormData();

    formData.append(
      "file",
      file,
    );

    formData.append(
      "categoryName",
      categoryName,
    );

    const {
      data,
      error,
    } =
      await supabase.functions.invoke(
        "upload-category-image",
        {
          body: formData,
        },
      );

    if (error) {
      console.error(
        "Category image upload failed:",
        error,
      );

      throw new Error(
        "Unable to upload category image.",
      );
    }

    if (
      !data?.imageKey ||
      !data?.imageUrl
    ) {
      throw new Error(
        "Invalid category image upload response.",
      );
    }

    return {
      imageKey: data.imageKey,
      imageUrl: data.imageUrl,
    };
  }

  async deleteCategoryImage(
    imageKey: string,
  ): Promise<void> {
    if (!imageKey) {
      return;
    }

    const {
      data,
      error,
    } =
      await supabase.functions.invoke(
        "delete-category-image",
        {
          body: {
            imageKey,
          },
        },
      );

    if (error) {
      console.error(
        "Category image delete failed:",
        error,
      );

      throw new Error(
        "Unable to delete old category image.",
      );
    }

    if (!data?.success) {
      throw new Error(
        data?.error ||
          "Unable to delete old category image.",
      );
    }
  }
}

const categoryImageService =
  new CategoryImageService();

export default categoryImageService;
