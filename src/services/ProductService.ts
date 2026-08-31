// import productsData from "../data/products.json";
import type { Product } from "../models/Product";
import supabaseProductService from "./SupabaseProductService";

class ProductService {
//   private readonly products: Product[] = productsData.map((product) => ({
//     ...product,
//     categoryType:
//       product.categoryType === "INTERIOR" ? "INTERIOR" : "EXTERIOR",
//   }));

//  getAllProducts(): Product[] {
//   return this.products;
// }

// getLatestProducts(limit = 4): Product[] {
//   return this.products.slice(0, limit);
// }

//   getInteriorProducts(): Product[] {
//     return this.products.filter(
//       (product) => product.categoryType === "INTERIOR",
//     );
//   }

//   getExteriorProducts(): Product[] {
//     return this.products.filter(
//       (product) => product.categoryType === "EXTERIOR",
//     );
//   }

// getProductsByCategory(
//   categoryType: Product["categoryType"],
//   categoryName: string,
// ): Product[] {
//   return this.products.filter(
//     (product) =>
//       product.categoryType === categoryType &&
//       product.categoryName === categoryName,
//   );
// }

// getProductById(productId: string): Product | undefined {
//   return this.products.find(
//     (product) => product.id === productId,
//   );
// }

// getFilteredProducts(filters: {
//   searchTerm?: string;
//   categoryType?: Product["categoryType"] | "";
//   categoryName?: string;
//   company?: string;
//   car?: string;
// }): Product[] {
//   const search = filters.searchTerm?.trim().toLowerCase();

//   return this.products.filter((product) => {
//     const matchesSearch =
//       !search ||
//       product.productName.toLowerCase().includes(search) ||
//       product.productCode.toLowerCase().includes(search) ||
//       product.company.toLowerCase().includes(search) ||
//       product.car.toLowerCase().includes(search);

//     const matchesCategoryType =
//       !filters.categoryType ||
//       product.categoryType === filters.categoryType;

//     const matchesCategoryName =
//       !filters.categoryName ||
//       product.categoryName === filters.categoryName;

//     const matchesCompany =
//       !filters.company ||
//       product.company === filters.company;

//     const matchesCar =
//       !filters.car ||
//       product.car === filters.car;

//     return (
//       matchesSearch &&
//       matchesCategoryType &&
//       matchesCategoryName &&
//       matchesCompany &&
//       matchesCar
//     );
//   });
// }


 async getProducts(): Promise<Product[]> {
    return supabaseProductService.getProducts();
  }

  async getProductById(
    productId: string,
  ): Promise<Product | undefined> {
    return supabaseProductService.getProductById(
      productId,
    );
  }

  async getProductsByCategory(
    categoryType: "INTERIOR" | "EXTERIOR",
    categoryName?: string,
  ): Promise<Product[]> {
    return supabaseProductService.getProductsByCategory(
      categoryType,
      categoryName,
    );
  }

    async getLatestProducts(
    limit: number,
  ): Promise<Product[]> {
    return supabaseProductService.getLatestProducts(
      limit,
    );
  }
 
}

export default new ProductService();