import { supabase } from "../lib/supabase";
import type { Product } from "../models/Product";
import adminProductImageService from "./AdminProductImageService";

interface SupabaseProductImage {
  image_url: string | null;
  image_key: string | null;
  sort_order: number;
}

export type ProductCategoryType =
  | ""
  | "INTERIOR"
  | "EXTERIOR";

interface SupabaseCategory {
  id?: string;
  name: string;
  type: "INTERIOR" | "EXTERIOR";
}

interface SupabaseCompany {
  id?: string;
  name: string;
}

interface SupabaseProduct {
  id: string;
  car: string | null;
  mrp: number;
  color: string | null;
  model: string | null;
  product_name: string;
  product_code: string;
  packaging_unit: string | null;

  categories:
    | SupabaseCategory
    | null;

  companies:
    | SupabaseCompany
    | null;

  product_images:
    | SupabaseProductImage[]
    | null;
}

interface ProductFilterOptions {
  searchTerm?: string;
  categoryType?:ProductCategoryType;
  categoryName?: string;
  company?: string;
  car?: string;
}

/**
 * Admin dropdown option.
 */
export interface AdminOption {
  id?: string;
  name: string;
}

/**
 * Category option.
 */
export interface AdminCategoryOption {
  id: string;
  name: string;
  type: "INTERIOR" | "EXTERIOR";
}


export interface AdminProductUpdateInput {
  categoryId: string;
  companyId: string;

  car: string;
  model: string;

  color: string;
  mrp: number;

  productName: string;
  productCode: string;
  packagingUnit: string;
}

class SupabaseProductService {

  // ============================================================
  // GET ALL PRODUCTS
  // ============================================================

  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select(this.getProductSelect())
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      this.handleError(
        "Failed to fetch products",
        error,
      );
    }

    return this.mapProducts(
      (data ?? []) as unknown as SupabaseProduct[],
    );
  }


  // ============================================================
  // GET PRODUCT BY ID
  // ============================================================

  async getProductById(
    productId: string,
  ): Promise<Product | undefined> {

    if (!productId) {
      return undefined;
    }

    const { data, error } = await supabase
      .from("products")
      .select(this.getProductSelect())
      .eq("id", productId)
      .maybeSingle();

    if (error) {
      this.handleError(
        "Failed to fetch product",
        error,
      );
    }

    if (!data) {
      return undefined;
    }

    return this.mapProduct(
      data as unknown as SupabaseProduct,
    );
  }


  // ============================================================
  // GET PRODUCTS BY CATEGORY
  // ============================================================

  async getProductsByCategory(
    categoryType: "INTERIOR" | "EXTERIOR",
    categoryName?: string,
  ): Promise<Product[]> {

    let query = supabase
      .from("products")
      .select(
        this.getProductSelect({
          categoryInnerJoin: true,
        }),
      )
      .eq(
        "categories.type",
        categoryType,
      );

    if (categoryName) {
      query = query.eq(
        "categories.name",
        categoryName,
      );
    }

    const { data, error } =
      await query.order(
        "created_at",
        {
          ascending: false,
        },
      );

    if (error) {
      this.handleError(
        "Failed to fetch products by category",
        error,
      );
    }

    return this.mapProducts(
      (data ?? []) as unknown as SupabaseProduct[],
    );
  }


  // ============================================================
  // GET LATEST PRODUCTS
  // ============================================================

  async getLatestProducts(
    limit: number,
  ): Promise<Product[]> {

    const { data, error } = await supabase
      .from("products")
      .select(this.getProductSelect())
      .order("created_at", {
        ascending: false,
      })
      .limit(limit);

    if (error) {
      this.handleError(
        "Failed to fetch latest products",
        error,
      );
    }

    return this.mapProducts(
      (data ?? []) as unknown as SupabaseProduct[],
    );
  }


  // ============================================================
  // FILTER PRODUCTS
  // ============================================================

  async getFilteredProducts({
    searchTerm = "",
    categoryType = "",
    categoryName = "",
    company = "",
    car = "",
  }: ProductFilterOptions): Promise<Product[]> {

    const needsCategoryJoin =
      Boolean(categoryType) ||
      Boolean(categoryName);

    const needsCompanyJoin =
      Boolean(company);

    const select = this.getProductSelect({
      categoryInnerJoin: needsCategoryJoin,
      companyInnerJoin: needsCompanyJoin,
    });

    let query = supabase
      .from("products")
      .select(select);

    // ----------------------------------------------------------
    // CATEGORY TYPE
    // ----------------------------------------------------------

    if (categoryType) {
      query = query.eq(
        "categories.type",
        categoryType,
      );
    }

    // ----------------------------------------------------------
    // CATEGORY NAME
    // ----------------------------------------------------------

    if (categoryName) {
      query = query.eq(
        "categories.name",
        categoryName,
      );
    }

    // ----------------------------------------------------------
    // COMPANY
    // ----------------------------------------------------------

    if (company) {
      query = query.eq(
        "companies.name",
        company,
      );
    }

    // ----------------------------------------------------------
    // CAR
    // ----------------------------------------------------------

    if (car) {
      query = query.eq(
        "car",
        car,
      );
    }

    const { data, error } =
      await query.order(
        "created_at",
        {
          ascending: false,
        },
      );

    if (error) {
      this.handleError(
        "Failed to fetch filtered products",
        error,
      );
    }

    let products = this.mapProducts(
      (data ?? []) as unknown as SupabaseProduct[],
    );

    // ----------------------------------------------------------
    // SEARCH
    // ----------------------------------------------------------

    const search =
      searchTerm.trim().toLowerCase();

    if (search) {
      products = products.filter(
        (product) =>
          [
            product.productName,
            product.productCode,
            product.company,
            product.car,
            product.model,
            product.categoryName,
          ].some((value) =>
            value
              .toLowerCase()
              .includes(search),
          ),
      );
    }

    return products;
  }


  // ============================================================
  // ADMIN - GET CATEGORIES
  // ============================================================

  async getCategories(): Promise<
    AdminCategoryOption[]
  > {

    const { data, error } = await supabase
      .from("categories")
      .select(`
        id,
        name,
        type
      `)
      .order("type")
      .order("name");

    if (error) {
      this.handleError(
        "Failed to fetch categories",
        error,
      );
    }

    return (data ?? []) as AdminCategoryOption[];
  }


  // ============================================================
  // ADMIN - GET CATEGORIES BY TYPE
  // ============================================================

  async getCategoriesByType(
    type: "INTERIOR" | "EXTERIOR",
  ): Promise<AdminCategoryOption[]> {

    const { data, error } = await supabase
      .from("categories")
      .select(`
        id,
        name,
        type
      `)
      .eq("type", type)
      .order("name");

    if (error) {
      this.handleError(
        "Failed to fetch categories by type",
        error,
      );
    }

    return (data ?? []) as AdminCategoryOption[];
  }


  // ============================================================
  // ADMIN - ADD CATEGORY
  // ============================================================

  async createCategory(
    name: string,
    type: "INTERIOR" | "EXTERIOR",
  ): Promise<AdminCategoryOption> {

    const cleanName = name.trim();

    if (!cleanName) {
      throw new Error(
        "Category name is required.",
      );
    }

    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: cleanName,
        type,
      })
      .select(`
        id,
        name,
        type
      `)
      .single();

    if (error) {
      console.error(
        "Failed to create category:",
        error,
      );

      throw new Error(
        "Unable to create category.",
      );
    }

    return data as AdminCategoryOption;
  }


  // ============================================================
  // ADMIN - GET COMPANIES
  // ============================================================

  async getCompanies(): Promise<
    AdminOption[]
  > {

    const { data, error } = await supabase
      .from("companies")
      .select(`
        id,
        name
      `)
      .order("name");

    if (error) {
      this.handleError(
        "Failed to fetch companies",
        error,
      );
    }

    return (data ?? []) as AdminOption[];
  }


  // ============================================================
  // ADMIN - ADD COMPANY
  // ============================================================

  async createCompany(
    name: string,
  ): Promise<AdminOption> {

    const cleanName = name.trim();

    if (!cleanName) {
      throw new Error(
        "Company name is required.",
      );
    }

    const { data, error } = await supabase
      .from("companies")
      .insert({
        name: cleanName,
      })
      .select(`
        id,
        name
      `)
      .single();

    if (error) {
      console.error(
        "Failed to create company:",
        error,
      );

      throw new Error(
        "Unable to create company.",
      );
    }

    return data as AdminOption;
  }


  // ============================================================
  // ADMIN - GET CARS
  //
  // Cars are currently stored directly in products.car.
  // Therefore we derive unique values from products.
  // ============================================================

  async getCars(): Promise<
    AdminOption[]
  > {

    const { data, error } = await supabase
      .from("products")
      .select("car")
      .not("car", "is", null)
      .order("car");

    if (error) {
      this.handleError(
        "Failed to fetch cars",
        error,
      );
    }

    const uniqueCars = Array.from(
      new Set(
        (data ?? [])
          .map((item) => item.car)
          .filter(
            (car): car is string =>
              Boolean(car?.trim()),
          ),
      ),
    );

    return uniqueCars.map((car) => ({
      name: car,
    }));
  }


  // ============================================================
  // ADMIN - GET MODELS
  //
  // Models are currently stored directly in products.model.
  // Therefore we derive unique values from products.
  // ============================================================

  async getModels(): Promise<
    AdminOption[]
  > {

    const { data, error } = await supabase
      .from("products")
      .select("model")
      .not("model", "is", null)
      .order("model");

    if (error) {
      this.handleError(
        "Failed to fetch models",
        error,
      );
    }

    const uniqueModels = Array.from(
      new Set(
        (data ?? [])
          .map((item) => item.model)
          .filter(
            (model): model is string =>
              Boolean(model?.trim()),
          ),
      ),
    );

    return uniqueModels.map((model) => ({
      name: model,
    }));
  }


  // ============================================================
  // ADMIN - GET MODELS FOR CAR
  //
  // Useful when the Admin product form selects:
  //
  // Car -> Model
  //
  // Example:
  //
  // Hyundai Creta
  //   -> Premium
  // ============================================================

  async getModelsByCar(
    car: string,
  ): Promise<AdminOption[]> {

    if (!car.trim()) {
      return [];
    }

    const { data, error } = await supabase
      .from("products")
      .select("model")
      .eq("car", car)
      .not("model", "is", null)
      .order("model");

    if (error) {
      this.handleError(
        "Failed to fetch models for car",
        error,
      );
    }

    const uniqueModels = Array.from(
      new Set(
        (data ?? [])
          .map((item) => item.model)
          .filter(
            (model): model is string =>
              Boolean(model?.trim()),
          ),
      ),
    );

    return uniqueModels.map((model) => ({
      name: model,
    }));
  }


  // ============================================================
  // COMMON SELECT
  // ============================================================

  private getProductSelect(options?: {
    categoryInnerJoin?: boolean;
    companyInnerJoin?: boolean;
  }) {

    const categoryRelation =
      options?.categoryInnerJoin
        ? `
          categories!inner (
            name,
            type
          )
        `
        : `
          categories (
            name,
            type
          )
        `;

    const companyRelation =
      options?.companyInnerJoin
        ? `
          companies!inner (
            name
          )
        `
        : `
          companies (
            name
          )
        `;

    return `
      id,
      car,
      mrp,
      color,
      model,
      product_name,
      product_code,
      packaging_unit,

      ${categoryRelation},

      ${companyRelation},

      product_images (
        image_url,
        image_key,
        sort_order
      )
    `;
  }


  // ============================================================
  // MAP PRODUCTS
  // ============================================================

  private mapProducts(
    products: SupabaseProduct[],
  ): Product[] {

    return products.map(
      (product) =>
        this.mapProduct(product),
    );
  }


  // ============================================================
  // MAP SINGLE PRODUCT
  // ============================================================

  private mapProduct(
    product: SupabaseProduct,
  ): Product {

    // ----------------------------------------------------------
    // IMAGES
    // ----------------------------------------------------------

    const images = (
      product.product_images ?? []
    )
      .sort(
        (a, b) =>
          a.sort_order -
          b.sort_order,
      )
      .map(
        (image) =>
          image.image_url,
      )
      .filter(
        (
          url,
        ): url is string =>
          Boolean(url),
      );


    // ----------------------------------------------------------
    // CATEGORY
    // ----------------------------------------------------------

    const category =
      product.categories;

    if (
      !category ||
      (
        category.type !== "INTERIOR" &&
        category.type !== "EXTERIOR"
      )
    ) {

      console.warn(
        `Product "${product.product_name}" (${product.id}) has no valid category.`,
      );

      throw new Error(
        `Product "${product.product_name}" (${product.id}) has no valid category.`,
      );
    }


    // ----------------------------------------------------------
    // COMPANY
    // ----------------------------------------------------------

    const company =
      product.companies?.name ?? "";


    // ----------------------------------------------------------
    // FINAL PRODUCT
    // ----------------------------------------------------------

    return {

      id: product.id,

      categoryType:
        category.type,

      categoryName:
        category.name ?? "",

      company,

      car:
        product.car ?? "",

      mrp:
        Number(product.mrp),

      color:
        product.color ?? "",

      model:
        product.model ?? "",

      productName:
        product.product_name,

      productCode:
        product.product_code,

      packagingUnit:
        product.packaging_unit ?? "",

      images,
    };
  }


  // ============================================================
  // ERROR HANDLER
  // ============================================================

  private handleError(
    message: string,
    error: unknown,
  ): never {

    console.error(
      message,
      error,
    );

    throw new Error(
      "Unable to load product data.",
    );
  }


  // ============================================================
// UPDATE PRODUCT
// ============================================================

async updateProduct(
  productId: string,
  input: AdminProductUpdateInput,
): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({
      category_id: input.categoryId,
      company_id: input.companyId,

      car: input.car.trim(),

      model:
        input.model.trim() || null,

      color:
        input.color.trim() || null,

      mrp: input.mrp,

      product_name:
        input.productName.trim(),

      product_code:
        input.productCode
          .trim()
          .toUpperCase(),

      packaging_unit:
        input.packagingUnit.trim() || null,

      updated_at:
        new Date().toISOString(),
    })
    .eq("id", productId);

  if (error) {
    this.handleError(
      "Failed to update product",
      error,
    );
  }
}


// ============================================================
// DELETE PRODUCT
// ============================================================

async deleteProduct(
  productId: string,
): Promise<void> {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    this.handleError(
      "Failed to delete product",
      error,
    );
  }
}

async deleteProductCompletely(
  productId: string,
): Promise<void> {
  // 1. Load all image records first
  const images =
    await adminProductImageService
      .getProductImages(productId);

  // 2. Delete each image from R2 + product_images
  for (const image of images) {
    await adminProductImageService
      .deleteProductImage(image);
  }

  // 3. Delete the product row
  await this.deleteProduct(productId);
}
}


const supabaseProductService =
  new SupabaseProductService();


export default supabaseProductService;