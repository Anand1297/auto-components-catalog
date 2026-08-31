import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import supabaseProductService from "../services/SupabaseProductService";

import type { Product } from "../models/Product";

import "./ProductDetailPage.css";

function ProductDetailPage() {
  const navigate = useNavigate();

  const { productId } =
    useParams<{
      productId: string;
    }>();

  const [product, setProduct] =
    useState<Product>();

  const [loading, setLoading] =
    useState(true);

  const [selectedImage, setSelectedImage] =
    useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadProduct = async () => {
      if (!productId) {
        return;
      }

      try {
        const result =
          await supabaseProductService.getProductById(
            productId,
          );

        if (!cancelled) {
          setProduct(result);
        }
      } catch (error) {
        console.error(
          "Failed to load product:",
          error,
        );

        if (!cancelled) {
          setProduct(undefined);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (loading) {
    return (
      <main className="product-detail-page">
        <div className="container">
          <p>Loading product...</p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="product-detail-page">
        <div className="container">
          <h1>Product Not Found</h1>

          <p>
            The product you are looking
            for does not exist.
          </p>

          <button
            type="button"
            className="product-detail-page__back"
            onClick={() =>
              navigate(-1)
            }
          >
            ← Go Back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="product-detail-page">
      <div className="container">
        <button
          type="button"
          className="product-detail-page__back"
          onClick={() =>
            navigate(-1)
          }
        >
          ← Back
        </button>

        <div className="product-detail">
          {/* Gallery */}
          <div className="product-detail__gallery">
            <div className="product-detail__image">
              {product.images.length >
              0 ? (
                <img
                  src={
                    product.images[
                      selectedImage
                    ]
                  }
                  alt={
                    product.productName
                  }
                />
              ) : (
                <span>
                  Product Image
                </span>
              )}
            </div>

            {product.images.length >
              1 && (
              <div className="product-detail__thumbnails">
                {product.images.map(
                  (
                    image,
                    index,
                  ) => (
                    <button
                      type="button"
                      key={image}
                      className={
                        index ===
                        selectedImage
                          ? "product-detail__thumbnail product-detail__thumbnail--active"
                          : "product-detail__thumbnail"
                      }
                      onClick={() =>
                        setSelectedImage(
                          index,
                        )
                      }
                      aria-label={`View product image ${
                        index + 1
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.productName} ${
                          index + 1
                        }`}
                      />
                    </button>
                  ),
                )}
              </div>
            )}
          </div>

          {/* Information */}
          <div className="product-detail__content">
            <span className="product-detail__category">
              {product.categoryName}
            </span>

            <h1>
              {product.productName}
            </h1>

            <p className="product-detail__company">
              {product.company}
            </p>

            <div className="product-detail__price">
              ₹
              {product.mrp.toLocaleString(
                "en-IN",
              )}
            </div>

            <div className="product-detail__information">
              <div>
                <span>
                  Product Code
                </span>

                <strong>
                  {product.productCode}
                </strong>
              </div>

              <div>
                <span>Car</span>

                <strong>
                  {product.car}
                </strong>
              </div>

              <div>
                <span>Model</span>

                <strong>
                  {product.model}
                </strong>
              </div>

              <div>
                <span>Color</span>

                <strong>
                  {product.color}
                </strong>
              </div>

              <div>
                <span>
                  Packaging Unit
                </span>

                <strong>
                  {
                    product.packagingUnit
                  }
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ProductDetailPage;