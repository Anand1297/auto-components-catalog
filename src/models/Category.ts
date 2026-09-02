export type CategoryType =
  | "INTERIOR"
  | "EXTERIOR";

export interface Category {
  id: string;
  categoryType: CategoryType;
  name: string;
  image: string;
  imageKey: string | null;
}
