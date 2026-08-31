import {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import supabaseProductService from "../../services/SupabaseProductService";

import type { Product } from "../../models/Product";

import ProductCard from "./ProductCard";

import "./LatestLaunch.css";

function LatestLaunch() {
  const navigate = useNavigate();

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const visibleProducts = 4;

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        const result =
          await supabaseProductService.getLatestProducts(
            8,
          );

        if (!cancelled) {
          setProducts(result);
        }
      } catch (error) {
        console.error(
          "Failed to load latest products:",
          error,
        );
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

  const maxIndex = Math.max(
    products.length -
      visibleProducts,
    0,
  );

  const goToPrevious = () => {
    setCurrentIndex(
      (current) =>
        Math.max(current - 1, 0),
    );
  };

  const goToNext = () => {
    setCurrentIndex(
      (current) =>
        Math.min(
          current + 1,
          maxIndex,
        ),
    );
  };

  if (loading) {
    return (
      <section className="latest-launch">
        <div className="container">
          <div className="section-header">
            <div>
              <h2>Latest Launch</h2>
              <p>
                Check out our latest
                products
              </p>
            </div>
          </div>

          <p>Loading products...</p>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="latest-launch">
      <div className="container">
        <div className="section-header">
          <div>
            <h2>Latest Launch</h2>

            <p>
              Check out our latest
              products
            </p>
          </div>

          <button
            type="button"
            className="latest-launch__view-all"
            onClick={() =>
              navigate("/products")
            }
          >
            View All →
          </button>
        </div>

        <div className="latest-launch__carousel">
          <button
            type="button"
            className="latest-launch__button"
            onClick={
              goToPrevious
            }
            disabled={
              currentIndex === 0
            }
            aria-label="Previous products"
          >
            ‹
          </button>

          <div className="latest-launch__viewport">
            <div
              className="latest-launch__track"
              style={{
                transform: `translateX(-${
                  currentIndex *
                  (100 /
                    visibleProducts)
                }%)`,
              }}
            >
              {products.map(
                (product) => (
                  <div
                    className="latest-launch__item"
                    key={product.id}
                  >
                    <ProductCard
                      product={product}
                    />
                  </div>
                ),
              )}
            </div>
          </div>

          <button
            type="button"
            className="latest-launch__button"
            onClick={goToNext}
            disabled={
              currentIndex ===
              maxIndex
            }
            aria-label="Next products"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}

export default LatestLaunch;