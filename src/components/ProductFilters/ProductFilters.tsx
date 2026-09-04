import type { CatalogAttribute } from "../../models/Catalog";
import "./ProductFilters.css";

interface Props {
  searchTerm: string;
  categorySlug?: string;
  categories?: { slug: string; name: string }[];
  brandSlug?: string;
  brands?: { slug: string; name: string }[];
  attributes: CatalogAttribute[];
  attributeFilters: Record<string, string>;
  showCategoryFilters?: boolean;
  onSearchChange: (value: string) => void;
  onCategoryChange?: (value: string) => void;
  onBrandChange?: (value: string) => void;
  onAttributeChange: (slug: string, value: string) => void;
  onClear: () => void;
}

export default function ProductFilters({ searchTerm, categorySlug = "", categories = [], brandSlug = "", brands = [], attributes, attributeFilters, showCategoryFilters = true, onSearchChange, onCategoryChange, onBrandChange, onAttributeChange, onClear }: Props) {
  return (
    <div className="product-filters">
      <div className="product-filters__search"><input type="search" placeholder="Search products..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} /></div>
      <div className="product-filters__fields">
        {showCategoryFilters && categories.length > 0 && <select value={categorySlug} onChange={(e) => onCategoryChange?.(e.target.value)}><option value="">All Categories</option>{categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>}
        {brands.length > 0 && <select value={brandSlug} onChange={(e) => onBrandChange?.(e.target.value)}><option value="">All Brands</option>{brands.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}</select>}
        {attributes.map((attribute) => attribute.dataType === "OPTION" && attribute.options.length > 0 ? (
          <select key={attribute.id} value={attributeFilters[attribute.slug] ?? ""} onChange={(e) => onAttributeChange(attribute.slug, e.target.value)}>
            <option value="">All {attribute.name}</option>
            {attribute.options.map((option) => <option key={option.id} value={option.value}>{option.value}</option>)}
          </select>
        ) : null)}
        <button type="button" onClick={onClear} className="product-filters__clear">Clear</button>
      </div>
    </div>
  );
}
