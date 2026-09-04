import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabaseProductService from "../services/SupabaseProductService";
import type { Product } from "../models/Product";
import "./ProductDetailPage.css";

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const { productSlug = "" } = useParams();
  const [product, setProduct] = useState<Product>();
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    setLoading(true);
    supabaseProductService.getProductBySlug(productSlug)
      .then(setProduct)
      .catch((error) => { console.error(error); setProduct(undefined); })
      .finally(() => setLoading(false));
  }, [productSlug]);

  if (loading) return <main className="product-detail-page"><div className="container"><p>Loading product...</p></div></main>;
  if (!product) return <main className="product-detail-page"><div className="container"><h1>Product Not Found</h1><button type="button" className="product-detail-page__back" onClick={() => navigate(-1)}>← Go Back</button></div></main>;

  const displayPrice = product.sellingPrice ?? product.mrp;
  return (
    <main className="product-detail-page"><div className="container">
      <button type="button" className="product-detail-page__back" onClick={() => navigate(-1)}>← Back</button>
      <div className="product-detail">
        <div className="product-detail__gallery">
          <div className="product-detail__image">{product.images.length ? <img src={product.images[selectedImage]} alt={product.name} /> : <span>Product Image</span>}</div>
          {product.images.length > 1 && <div className="product-detail__thumbnails">{product.images.map((image, index) => <button type="button" key={`${image}-${index}`} className={index === selectedImage ? "product-detail__thumbnail product-detail__thumbnail--active" : "product-detail__thumbnail"} onClick={() => setSelectedImage(index)}><img src={image} alt={`${product.name} ${index + 1}`} /></button>)}</div>}
        </div>
        <div className="product-detail__content">
          <span className="product-detail__category">{product.categoryName}</span>
          <h1>{product.name}</h1>
          {product.brand && <p className="product-detail__company">{product.brand.name}</p>}
          <div className="product-detail__price">₹{displayPrice.toLocaleString("en-IN")}</div>
          {product.sellingPrice !== null && product.mrp > product.sellingPrice && <p><s>₹{product.mrp.toLocaleString("en-IN")}</s></p>}
          {product.shortDescription && <p>{product.shortDescription}</p>}
          <div className="product-detail__information">
            <div><span>Product Code</span><strong>{product.productCode || "—"}</strong></div>
            <div><span>Packaging Unit</span><strong>{product.packagingUnit || "—"}</strong></div>
            <div><span>Status</span><strong>{product.stockStatus.replaceAll("_", " ")}</strong></div>
            {product.attributes.map((attribute) => <div key={attribute.attributeId}><span>{attribute.attributeName}</span><strong>{attribute.value}</strong></div>)}
          </div>
          {product.description && <p>{product.description}</p>}
        </div>
      </div>
    </div></main>
  );
}
