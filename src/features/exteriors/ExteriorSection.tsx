import {
  useEffect,
  useState,
} from "react";

import CategoryCard from "../../components/CategoryCard/CategoryCard";
import categoryService from "../../services/CategoryService";

import type { Category } from "../../models/Category";

function ExteriorSection() {
  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadCategories =
      async () => {
        try {
          const result =
            await categoryService
              .getCategoriesByType(
                "EXTERIOR",
              );

          if (!cancelled) {
            setCategories(result);
          }
        } catch (error) {
          console.error(
            "Failed to load exterior categories:",
            error,
          );

          if (!cancelled) {
            setCategories([]);
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="category-section">
      <div className="container">
        <div className="section-header">
          <div>
            <h2>Car Exteriors</h2>
            <p>
              Explore our exterior accessories
            </p>
          </div>
        </div>

        {loading ? (
          <p className="category-section__status">
            Loading categories...
          </p>
        ) : categories.length === 0 ? (
          <p className="category-section__status">
            No exterior categories available.
          </p>
        ) : (
          <div className="category-carousel">
            {categories.map(
              (category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                />
              ),
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default ExteriorSection;
