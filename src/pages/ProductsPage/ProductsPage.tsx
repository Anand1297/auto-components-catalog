import { useEffect, useState } from "react";
import ProductCard from "../../features/latest-launch/ProductCard";
import ProductFilters from "../../components/ProductFilters/ProductFilters";
import supabaseProductService, { type ProductCategoryType } from "../../services/SupabaseProductService";
import type { Product } from "../../models/Product";
import "./ProductsPage.css";

function ProductsPage() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [filteredProducts, setFilteredProducts] =
    useState<Product[]>([]);

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

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  /**
   * Load complete product catalog.
   *
   * This is used to generate filter options.
   */
  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const result =
          await supabaseProductService.getProducts();

        if (!cancelled) {
          setProducts(result);
          setFilteredProducts(result);
        }
      } catch (error) {
        console.error(
          "Failed to load products:",
          error,
        );

        if (!cancelled) {
          setError(
            "Unable to load products.",
          );
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
  }, []);

  /**
   * Load filtered products from Supabase.
   */
  useEffect(() => {
    let cancelled = false;

    const loadFilteredProducts =
      async () => {
        try {
          const result =
            await supabaseProductService.getFilteredProducts(
              {
                searchTerm,
                categoryType,
                categoryName,
                company,
                car,
              },
            );

          if (!cancelled) {
            setFilteredProducts(result);
          }
        } catch (error) {
          console.error(
            "Failed to filter products:",
            error,
          );
        }
      };

    /**
     * Don't make another request before
     * initial product loading is complete.
     */
    if (!loading) {
      loadFilteredProducts();
    }

    return () => {
      cancelled = true;
    };
  }, [
    searchTerm,
    categoryType,
    categoryName,
    company,
    car,
    loading,
  ]);

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryType("");
    setCategoryName("");
    setCompany("");
    setCar("");
  };

  if (loading) {
    return (
      <main className="products-page">
        <div className="container">
          <p>Loading products...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="products-page">
        <div className="container">
          <h1>Products</h1>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="products-page">
      <div className="container">
        <div className="products-page__header">
          <h1>All Products</h1>

          <p>
            Browse our complete product
            catalog.
          </p>
        </div>

        <ProductFilters
          products={products}
          searchTerm={searchTerm}
          categoryType={categoryType}
          categoryName={categoryName}
          company={company}
          car={car}
          showCategoryFilters={true}
          onSearchChange={setSearchTerm}
          onCategoryTypeChange={
            setCategoryType
          }
          onCategoryNameChange={
            setCategoryName
          }
          onCompanyChange={setCompany}
          onCarChange={setCar}
          onClear={clearFilters}
        />

        <div className="products-page__count">
          Showing{" "}
          {filteredProducts.length} of{" "}
          {products.length} products
        </div>

        {filteredProducts.length === 0 ? (
          <div className="products-page__empty">
            <h2>No Products Found</h2>

            <p>
              Try changing your search or
              filter options.
            </p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ),
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default ProductsPage;