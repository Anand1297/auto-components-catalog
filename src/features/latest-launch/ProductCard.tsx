import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Product } from "../../models/Product";
import "./ProductCard.css";

interface ProductCardProps {
  product: Product;
}

function ProductCard({
  product,
}: ProductCardProps) {
  const navigate = useNavigate();

  const [imageFailed, setImageFailed] =
    useState(false);

  const imageUrl =
    product.images?.[0];

  const showImage =
    Boolean(imageUrl) && !imageFailed;

  return (
    <button
      type="button"
      className="product-card"
      onClick={() =>
        navigate(
          `/product/${product.id}`,
        )
      }
    >
      <div className="product-card__image">
        {showImage ? (
          <img
            src={imageUrl}
            alt={product.productName}
            onError={() =>
              setImageFailed(true)
            }
          />
        ) : (
          <div className="product-card__image-placeholder">
            <span>No Image</span>
          </div>
        )}
      </div>

      <div className="product-card__content">
        <span className="product-card__company">
          {product.company}
        </span>

        <h3 className="product-card__name">
          {product.productName}
        </h3>

        <p className="product-card__car">
          {product.car}
        </p>

        <div className="product-card__footer">
          <strong className="product-card__price">
            ₹
            {product.mrp.toLocaleString(
              "en-IN",
            )}
          </strong>
        </div>
      </div>
    </button>
  );
}

export default ProductCard;
