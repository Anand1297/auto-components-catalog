export interface ProductImage {
  id: string;
  imageUrl: string;
  storageKey: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductAttributeValue {
  attributeId: string;
  attributeName: string;
  attributeSlug: string;
  value: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  isPrimary: boolean;
}

export interface ProductBrand {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  slug: string;
  productCode: string;
  shortDescription: string;
  description: string;
  mrp: number;
  sellingPrice: number | null;
  packagingUnit: string;
  stockStatus: "AVAILABLE" | "OUT_OF_STOCK" | "COMING_SOON" | "DISCONTINUED";
  isFeatured: boolean;
  brand: ProductBrand | null;
  categories: ProductCategory[];
  attributes: ProductAttributeValue[];
  images: string[];
  imageRecords: ProductImage[];

  // Compatibility aliases for older presentational/admin code while this branch is migrated.
  productName: string;
  categoryName: string;
  categoryType: "INTERIOR" | "EXTERIOR" | "";
  company: string;
  car: string;
  model: string;
  color: string;
}
