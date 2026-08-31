import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import supabaseProductService from "../../../services/SupabaseProductService";
import type {
  ProductCategoryType,
} from "../../../services/SupabaseProductService";
import type { Product } from "../../../../src/models/Product";

import "./AdminProductsPage.css";

function AdminProductsPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>(
    [],
  );

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [categoryType, setCategoryType] =
    useState<ProductCategoryType>("");

  const [categoryName, setCategoryName] =
    useState("");

  const [company, setCompany] =
    useState("");

  const [car, setCar] =
    useState("");

  /*
   * Load products whenever filters change.
   */
  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        setLoading(true);

        const result =
          await supabaseProductService
            .getFilteredProducts({
              searchTerm,
              categoryType,
              categoryName,
              company,
              car,
            });

        if (!cancelled) {
          setProducts(result);
        }
      } catch (error) {
        console.error(
          "Failed to load admin products:",
          error,
        );

        if (!cancelled) {
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [
    searchTerm,
    categoryType,
    categoryName,
    company,
    car,
  ]);

  /*
   * Get unique categories, companies and cars
   * from currently loaded products.
   *
   * Later, when the admin panel grows,
   * we can load these directly from their
   * respective Supabase tables.
   */
  const categoryNames = useMemo(() => {
    return Array.from(
      new Set(
        products
          .map(
            (product) =>
              product.categoryName,
          )
          .filter(Boolean),
      ),
    ).sort();
  }, [products]);

  const companies = useMemo(() => {
    return Array.from(
      new Set(
        products
          .map(
            (product) =>
              product.company,
          )
          .filter(Boolean),
      ),
    ).sort();
  }, [products]);

  const cars = useMemo(() => {
    return Array.from(
      new Set(
        products
          .map(
            (product) =>
              product.car,
          )
          .filter(Boolean),
      ),
    ).sort();
  }, [products]);

  /*
   * Clear all filters.
   */
  const clearFilters = () => {
    setSearchTerm("");
    setCategoryType("");
    setCategoryName("");
    setCompany("");
    setCar("");
  };

  const hasFilters =
    Boolean(searchTerm) ||
    Boolean(categoryType) ||
    Boolean(categoryName) ||
    Boolean(company) ||
    Boolean(car);

  return (
    <div className="admin-products-page">
      <div className="admin-products-page__header">
        <div>
          <h1>Products</h1>

          <p>
            Manage your automotive accessories.
          </p>
        </div>

        <button
          type="button"
          className="admin-products-page__add-button"
          onClick={() =>
            navigate("/admin/products/new")
          }
        >
          + Add Product
        </button>
      </div>

      {/* Filters */}

      <section className="admin-products-page__filters">
        <div className="admin-products-page__search">
          <label htmlFor="product-search">
            Search
          </label>

          <input
            id="product-search"
            type="text"
            placeholder="Search product, code, company, car..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />
        </div>

        <div className="admin-products-page__filter">
          <label htmlFor="category-type">
            Category Type
          </label>

          <select
            id="category-type"
            value={categoryType}
            onChange={(event) => {
              setCategoryType(
                event.target.value as ProductCategoryType,
              );

              // Reset category when type changes.
              setCategoryName("");
            }}
          >
            <option value="">
              All Categories
            </option>

            <option value="INTERIOR">
              Interior
            </option>

            <option value="EXTERIOR">
              Exterior
            </option>
          </select>
        </div>

        <div className="admin-products-page__filter">
          <label htmlFor="category-name">
            Category
          </label>

          <select
            id="category-name"
            value={categoryName}
            onChange={(event) =>
              setCategoryName(
                event.target.value,
              )
            }
          >
            <option value="">
              All Categories
            </option>

            {categoryNames.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-products-page__filter">
          <label htmlFor="company">
            Company
          </label>

          <select
            id="company"
            value={company}
            onChange={(event) =>
              setCompany(event.target.value)
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
        </div>

        <div className="admin-products-page__filter">
          <label htmlFor="car">
            Car
          </label>

          <select
            id="car"
            value={car}
            onChange={(event) =>
              setCar(event.target.value)
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
        </div>

        {hasFilters && (
          <button
            type="button"
            className="admin-products-page__clear-button"
            onClick={clearFilters}
          >
            Clear
          </button>
        )}
      </section>

      {/* Result count */}

      <div className="admin-products-page__result">
        {loading
          ? "Loading products..."
          : `Showing ${products.length} product${
              products.length === 1
                ? ""
                : "s"
            }`}
      </div>

      {/* Products table */}

      <section className="admin-products-page__table-container">
        {loading ? (
          <div className="admin-products-page__loading">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="admin-products-page__empty">
            <h2>No products found</h2>

            <p>
              Try changing your search or
              filter options.
            </p>
          </div>
        ) : (
          <table className="admin-products-page__table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Code</th>
                <th>Category</th>
                <th>Company</th>
                <th>Car</th>
                <th>MRP</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="admin-products-page__product">
                      {product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={
                            product.productName
                          }
                          className="admin-products-page__product-image"
                        />
                      ) : (
                        <div className="admin-products-page__product-placeholder">
                          No Image
                        </div>
                      )}

                      <div>
                        <strong>
                          {
                            product.productName
                          }
                        </strong>

                        <span>
                          {product.model}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td>
                    {product.productCode}
                  </td>

                  <td>
                    <div>
                      <strong>
                        {
                          product.categoryName
                        }
                      </strong>

                      <span>
                        {
                          product.categoryType
                        }
                      </span>
                    </div>
                  </td>

                  <td>
                    {product.company || "—"}
                  </td>

                  <td>
                    {product.car}
                  </td>

                  <td>
                    ₹
                    {product.mrp.toLocaleString(
                      "en-IN",
                    )}
                  </td>

                  <td>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/admin/products/${product.id}`,
                        )
                      }
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default AdminProductsPage;