export type CategoryType = "INTERIOR" | "EXTERIOR";

export interface Category {
  id: string;
  businessId: string;
  name: string;
  slug: string;
  parentId: string | null;
  description: string;
  image: string;
  sortOrder: number;
  isActive: boolean;
  children?: Category[];

  // temporary compatibility alias
  categoryType?: CategoryType;
  imageKey?: string | null;
}
