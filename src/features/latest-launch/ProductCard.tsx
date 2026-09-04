import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Product } from "../../models/Product";
import "./ProductCard.css";

export default function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const { businessSlug = "" } = useParams();
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = product.images[0];
  const price = product.sellingPrice ?? product.mrp;

  return (
    <button type="button" className="product-card" onClick={() => navigate(`/catalog/${businessSlug}/product/${product.slug}`)}>
      <div className="product-card__image">
        {imageUrl && !imageFailed ? (
          <img src={imageUrl} alt={product.name} onError={() => setImageFailed(true)} />
        ) : (
          <div className="product-card__image-placeholder"><span>No Image</span></div>
        )}
      </div>
      <div className="product-card__content">
        <span className="product-card__company">{product.brand?.name ?? product.categoryName}</span>
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__car">{product.shortDescription || product.packagingUnit}</p>
        <div className="product-card__footer">
          <strong className="product-card__price">₹{price.toLocaleString("en-IN")}</strong>
        </div>
      </div>
    </button>
  );
}
