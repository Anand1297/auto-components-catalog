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

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="latest-launch">
        <div className="container">
          <div className="section-header">
            <div>
              <h2>Latest Launch</h2>

              <p>
                Check out our latest products
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
              Check out our latest products
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

        <div className="latest-launch__scroll">
          {products.map((product) => (
            <div
              className="latest-launch__item"
              key={product.id}
            >
              <ProductCard
                product={product}
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default LatestLaunch;
