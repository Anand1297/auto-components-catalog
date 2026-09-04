import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Category } from "../../models/Category";
import "./CategoryCard.css";

export default function CategoryCard({ category, onClick }: { category: Category; onClick?: () => void }) {
  const navigate = useNavigate();
  const { businessSlug = "" } = useParams();
  const [imageFailed, setImageFailed] = useState(false);
  const handleClick = onClick ?? (() => navigate(`/catalog/${businessSlug}/category/${category.slug}`));

  return (
    <button type="button" className="category-card" onClick={handleClick}>
      <div className="category-card__image">
        {!imageFailed && category.image ? <img src={category.image} alt={category.name} onError={() => setImageFailed(true)} /> : <div className="category-card__placeholder">No Image</div>}
      </div>
      <div className="category-card__content"><h3>{category.name}</h3></div>
    </button>
  );
}
