import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ProductCard from "../features/latest-launch/ProductCard";
import ProductFilters from "../components/ProductFilters/ProductFilters";
import supabaseProductService from "../services/SupabaseProductService";

import type { Product } from "../models/Product";

import "./CategoryProductsPage.css";

function CategoryProductsPage() {
  const navigate = useNavigate();

  const { categoryType, categoryName } = useParams<{
    categoryType: string;
    categoryName: string;
  }>();

  /*
   * Validate URL category
   */
  const isValidCategory =
    categoryType === "interior" ||
    categoryType === "exterior";

  /*
   * Convert URL category to database category type
   */
  const productCategoryType =
    categoryType === "interior"
      ? "INTERIOR"
      : "EXTERIOR";

  /*
   * Decode category name
   */
  const decodedCategoryName = categoryName
    ? decodeURIComponent(categoryName)
    : "";

  /*
   * Products fetched from Supabase
   */
  const [categoryProducts, setCategoryProducts] =
    useState<Product[]>([]);

  /*
   * Loading state
   */
  const [loading, setLoading] = useState(true);

  /*
   * UI filters
   */
  const [searchTerm, setSearchTerm] = useState("");
  const [company, setCompany] = useState("");
  const [car, setCar] = useState("");

  /*
   * Fetch products from Supabase.
   *
   * IMPORTANT:
   * There is NO synchronous setState here.
   *
   * setState happens only after the
   * asynchronous Supabase request completes.
   */
  useEffect(() => {
    if (!isValidCategory) {
      return;
    }

    let cancelled = false;

    const loadProducts = async () => {
      try {
        const products =
          await supabaseProductService.getProductsByCategory(
            productCategoryType,
            decodedCategoryName,
          );

        if (!cancelled) {
          setCategoryProducts(products);
          setLoading(false);
        }
      } catch (error) {
        console.error(
          "Failed to load category products:",
          error,
        );

        if (!cancelled) {
          setCategoryProducts([]);
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [
    isValidCategory,
    productCategoryType,
    decodedCategoryName,
  ]);

  /*
   * Filter products.
   *
   * This is derived data.
   * Therefore:
   *
   * ❌ no useState
   * ❌ no useEffect
   *
   * We calculate it directly with useMemo.
   */
  const filteredProducts = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    return categoryProducts.filter((product) => {
      const matchesSearch =
        !search ||
        product.productName
          .toLowerCase()
          .includes(search) ||
        product.productCode
          .toLowerCase()
          .includes(search) ||
        product.company
          .toLowerCase()
          .includes(search) ||
        product.car
          .toLowerCase()
          .includes(search);

      const matchesCompany =
        !company ||
        product.company === company;

      const matchesCar =
        !car ||
        product.car === car;

      return (
        matchesSearch &&
        matchesCompany &&
        matchesCar
      );
    });
  }, [
    categoryProducts,
    searchTerm,
    company,
    car,
  ]);

  /*
   * Clear filters
   */
  const clearFilters = () => {
    setSearchTerm("");
    setCompany("");
    setCar("");
  };

  /*
   * Invalid category
   *
   * We check this BEFORE rendering the
   * actual category page.
   */
  if (!isValidCategory) {
    return (
      <main className="category-products-page">
        <div className="container">
          <h1>Category Not Found</h1>

          <p>
            The requested category does not exist.
          </p>

          <button
            type="button"
            className="category-products-page__back"
            onClick={() => navigate(-1)}
          >
            ← Go Back
          </button>
        </div>
      </main>
    );
  }

  const sectionTitle =
    productCategoryType === "INTERIOR"
      ? "Car Interior Accessories"
      : "Car Exterior Accessories";

  return (
    <main className="category-products-page">
      <div className="container">

        {/* Back */}
        <button
          type="button"
          className="category-products-page__back"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        {/* Category */}
        <h1>{decodedCategoryName}</h1>

        <p className="category-products-page__subtitle">
          {sectionTitle}
        </p>

        {/* Filters */}
        <ProductFilters
          products={categoryProducts}
          searchTerm={searchTerm}
          categoryType={productCategoryType}
          categoryName={decodedCategoryName}
          company={company}
          car={car}
          showCategoryFilters={false}
          onSearchChange={setSearchTerm}
          onCategoryTypeChange={() => undefined}
          onCategoryNameChange={() => undefined}
          onCompanyChange={setCompany}
          onCarChange={setCar}
          onClear={clearFilters}
        />

        {/* Loading */}
        {loading ? (
          <div className="category-products-page__empty">
            <p>Loading products...</p>
          </div>
        ) : (
          <>
            {/* Count */}
            <div className="category-products-page__count">
              Showing{" "}
              {filteredProducts.length}{" "}
              of{" "}
              {categoryProducts.length}{" "}
              products
            </div>

            {/* Empty */}
            {filteredProducts.length === 0 ? (
              <div className="category-products-page__empty">
                <h2>No Products Found</h2>

                <p>
                  Try changing your search or filter
                  options.
                </p>
              </div>
            ) : (
              /* Products */
              <div className="products-grid">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default CategoryProductsPage;