import { useNavigate } from "react-router-dom";
import type { Product } from "../../models/Product";

interface ProductCardProps {
  product: Product;
}

function ProductCard({
  product,
}: ProductCardProps) {
  const navigate = useNavigate();

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
        {product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.productName}
          />
        ) : (
          <span>Product Image</span>
        )}
      </div>

      <div className="product-card__content">
        <span>
          {product.company}
        </span>

        <h3>
          {product.productName}
        </h3>

        <p>{product.car}</p>

        <strong>
          ₹
          {product.mrp.toLocaleString(
            "en-IN",
          )}
        </strong>
      </div>
    </button>
  );
}

export default ProductCard;