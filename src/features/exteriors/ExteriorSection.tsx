import { categories } from "../../data/categories";
import CategoryCard from "../../components/CategoryCard/CategoryCard";

function ExteriorSection() {
  const exteriorCategories = categories.filter(
    (category) => category.categoryType === "EXTERIOR",
  );

  return (
    <section className="category-section">
      <div className="container">
        <div className="section-header">
          <div>
            <h2>Car Exteriors</h2>
            <p>Explore our exterior accessories</p>
          </div>
        </div>

        <div className="category-carousel">
          {exteriorCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ExteriorSection;