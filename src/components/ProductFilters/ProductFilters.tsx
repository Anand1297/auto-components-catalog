import type { Product } from "../../models/Product";
import "./ProductFilters.css";
import type {
  ProductCategoryType,
} from "../../services/SupabaseProductService";

interface ProductFiltersProps {
  products: Product[];

  searchTerm: string;
  categoryType: ProductCategoryType;
  categoryName: string;
  company: string;
  car: string;

  showCategoryFilters?: boolean;

  onSearchChange: (value: string) => void;
  onCategoryTypeChange: (value: ProductCategoryType) => void;
  onCategoryNameChange: (value: string) => void;
  onCompanyChange: (value: string) => void;
  onCarChange: (value: string) => void;

  onClear: () => void;
}

function ProductFilters({
  products,
  searchTerm,
  categoryType,
  categoryName,
  company,
  car,
  showCategoryFilters = true,

  onSearchChange,
  onCategoryTypeChange,
  onCategoryNameChange,
  onCompanyChange,
  onCarChange,

  onClear,
}: ProductFiltersProps) {
  /**
   * Category names depend on selected category type.
   */
  const categoryProducts =
    categoryType
      ? products.filter(
          (product) =>
            product.categoryType ===
            categoryType,
        )
      : products;

  const categoryNames = Array.from(
    new Set(
      categoryProducts
        .map(
          (product) =>
            product.categoryName,
        )
        .filter(Boolean),
    ),
  );

  /**
   * Companies
   */
  const companies = Array.from(
    new Set(
      products
        .map(
          (product) =>
            product.company,
        )
        .filter(Boolean),
    ),
  );

  /**
   * Cars
   */
  const cars = Array.from(
    new Set(
      products
        .map(
          (product) => product.car,
        )
        .filter(Boolean),
    ),
  );

  return (
    <div className="product-filters">
      {/* Search */}
      <div className="product-filters__search">
        <input
          type="search"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(event) =>
            onSearchChange(
              event.target.value,
            )
          }
        />
      </div>

      <div className="product-filters__fields">
        {showCategoryFilters && (
          <>
            {/* Category Type */}
            <select
              value={categoryType}
              onChange={(event) => {
                onCategoryTypeChange(
                  event.target.value as ProductCategoryType,
                );

                /**
                 * Reset category name when
                 * category type changes.
                 */
                onCategoryNameChange("");
              }}
            >
              <option value="">
                All Types
              </option>

              <option value="INTERIOR">
                Interior
              </option>

              <option value="EXTERIOR">
                Exterior
              </option>
            </select>

            {/* Category Name */}
            <select
              value={categoryName}
              onChange={(event) =>
                onCategoryNameChange(
                  event.target.value,
                )
              }
            >
              <option value="">
                All Categories
              </option>

              {categoryNames.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ),
              )}
            </select>
          </>
        )}

        {/* Company */}
        <select
          value={company}
          onChange={(event) =>
            onCompanyChange(
              event.target.value,
            )
          }
        >
          <option value="">
            All Companies
          </option>

          {companies.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>

        {/* Car */}
        <select
          value={car}
          onChange={(event) =>
            onCarChange(
              event.target.value,
            )
          }
        >
          <option value="">
            All Cars
          </option>

          {cars.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>

        {/* Clear */}
        <button
          type="button"
          onClick={onClear}
          className="product-filters__clear"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

export default ProductFilters;