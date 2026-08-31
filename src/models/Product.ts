export interface Product {
  id: string;
  categoryType: "INTERIOR" | "EXTERIOR";
  categoryName: string;
  company: string;
  car: string;
  mrp: number;
  color: string;
  model: string;
  productName: string;
  productCode: string;
  packagingUnit: string;
  images :  string[];
}