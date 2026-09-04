import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabaseProductService from "../../services/SupabaseProductService";
import businessCatalogService from "../../services/BusinessCatalogService";
import type { Product } from "../../models/Product";
import ProductCard from "./ProductCard";
import "./LatestLaunch.css";

export default function LatestLaunch() {
  const navigate = useNavigate();
  const { businessSlug = "" } = useParams();
  const catalogBase = `/catalog/${businessSlug}`;
  const [products, setProducts] = useState<Product[]>([]);
  const [title, setTitle] = useState("Latest Products");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([supabaseProductService.getLatestProducts(8), businessCatalogService.getSiteConfig()])
      .then(([items, config]) => {
        if (!cancelled) {
          setProducts(items);
          if (config?.latestSectionTitle) setTitle(config.latestSectionTitle);
        }
      })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <section className="latest-launch"><div className="container"><h2>{title}</h2><p>Loading products...</p></div></section>;
  if (!products.length) return null;

  return (
    <section className="latest-launch">
      <div className="container">
        <div className="section-header">
          <div><h2>{title}</h2><p>Explore recently added products</p></div>
          <button type="button" className="latest-launch__view-all" onClick={() => navigate(`${catalogBase}/products`)}>View All →</button>
        </div>
        <div className="latest-launch__scroll">
          {products.map((product) => <div className="latest-launch__item" key={product.id}><ProductCard product={product} /></div>)}
        </div>
      </div>
    </section>
  );
}
