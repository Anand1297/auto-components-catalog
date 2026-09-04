import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import categoryService from "../../services/CategoryService";
import type { Category } from "../../models/Category";
import CategoryCard from "../../components/CategoryCard/CategoryCard";
import businessCatalogService from "../../services/BusinessCatalogService";
import "./CategorySection.css";

export default function CategorySection() {
  const navigate = useNavigate();
  const { businessSlug = "" } = useParams();
  const catalogBase = `/catalog/${businessSlug}`;
  const [categories, setCategories] = useState<Category[]>([]);
  const [sectionTitle, setSectionTitle] = useState("Categories");

  useEffect(() => {
    void Promise.all([
      categoryService.getRootCategories(),
      businessCatalogService.getSiteConfig(),
    ])
      .then(([categoryRows, config]) => {
        setCategories(categoryRows);
        setSectionTitle(config?.categoriesSectionTitle || "Categories");
      })
      .catch(console.error);
  }, []);

  if (!categories.length) return null;

  return (
    <section className="category-section">
      <div className="container">
        <div className="category-section__header">
          <div>
            <h2>{sectionTitle}</h2>
            <p>Browse the catalog by category</p>
          </div>
        </div>

        <div className="category-section__grid">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onClick={() => navigate(`${catalogBase}/category/${category.slug}`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
