import { supabase } from "../lib/supabase";

import type {
  Category,
  CategoryType,
} from "../models/Category";

interface CategoryRow {
  id: string;
  name: string;
  type: CategoryType;
  image_url: string | null;
  image_key: string | null;
}

export interface CategoryInput {
  name: string;
  type: CategoryType;
  imageUrl?: string;
  imageKey?: string | null;
}

const fallbackImage =
  "/categories/default.png";

const mapCategory = (
  row: CategoryRow,
): Category => ({
  id: row.id,
  name: row.name,
  categoryType: row.type,
  image:
    row.image_url?.trim() ||
    fallbackImage,
  imageKey:
    row.image_key ?? null,
});

class CategoryService {
  private readonly selectFields =
    "id,name,type,image_url,image_key";

  async getCategories(): Promise<
    Category[]
  > {
    const { data, error } =
      await supabase
        .from("categories")
        .select(this.selectFields)
        .order("type")
        .order("name");

    if (error) {
      console.error(
        "Failed to fetch categories:",
        error,
      );

      throw new Error(
        "Unable to load categories.",
      );
    }

    return (
      (data ?? []) as CategoryRow[]
    ).map(mapCategory);
  }

  async getCategoriesByType(
    type: CategoryType,
  ): Promise<Category[]> {
    const { data, error } =
      await supabase
        .from("categories")
        .select(this.selectFields)
        .eq("type", type)
        .order("name");

    if (error) {
      console.error(
        "Failed to fetch categories:",
        error,
      );

      throw new Error(
        "Unable to load categories.",
      );
    }

    return (
      (data ?? []) as CategoryRow[]
    ).map(mapCategory);
  }

  async createCategory(
    input: CategoryInput,
  ): Promise<Category> {
    const { data, error } =
      await supabase
        .from("categories")
        .insert({
          name: input.name.trim(),
          type: input.type,
          image_url:
            input.imageUrl?.trim() ||
            null,
          image_key:
            input.imageKey ?? null,
        })
        .select(this.selectFields)
        .single();

    if (error) {
      console.error(
        "Failed to create category:",
        error,
      );

      throw new Error(
        error.code === "23505"
          ? "A category with this name/type already exists."
          : "Unable to create category.",
      );
    }

    return mapCategory(
      data as CategoryRow,
    );
  }

  async updateCategory(
    categoryId: string,
    input: CategoryInput,
  ): Promise<Category> {
    const { data, error } =
      await supabase
        .from("categories")
        .update({
          name: input.name.trim(),
          type: input.type,
          image_url:
            input.imageUrl?.trim() ||
            null,
          image_key:
            input.imageKey ?? null,
        })
        .eq("id", categoryId)
        .select(this.selectFields)
        .single();

    if (error) {
      console.error(
        "Failed to update category:",
        error,
      );

      throw new Error(
        error.code === "23505"
          ? "A category with this name/type already exists."
          : "Unable to update category.",
      );
    }

    return mapCategory(
      data as CategoryRow,
    );
  }

  async deleteCategory(
    categoryId: string,
  ): Promise<void> {
    const { error } =
      await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId);

    if (error) {
      console.error(
        "Failed to delete category:",
        error,
      );

      throw new Error(
        error.code === "23503"
          ? "This category is being used by one or more products. Move those products to another category before deleting it."
          : "Unable to delete category.",
      );
    }
  }
}

const categoryService =
  new CategoryService();

export default categoryService;
