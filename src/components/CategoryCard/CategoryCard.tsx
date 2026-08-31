import { useNavigate } from "react-router-dom";
import type { Category } from "../../models/Category";
import "./CategoryCard.css";

interface CategoryCardProps {
  category: Category;
}

function CategoryCard({ category }: CategoryCardProps) {
  const navigate = useNavigate();

  const categoryType =
    category.categoryType === "INTERIOR"
      ? "interior"
      : "exterior";

  const handleClick = () => {
    navigate(
      `/category/${categoryType}/${encodeURIComponent(category.name)}`,
    );
  };

  return (
    <button
      type="button"
      className="category-card"
      onClick={handleClick}
    >
      <div className="category-card__image">
        <img
          src={category.image}
          alt={category.name}
        />
      </div>

      <div className="category-card__content">
        <h3>{category.name}</h3>
      </div>
    </button>
  );
}

export default CategoryCard;