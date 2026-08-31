import { categories } from "../../data/categories";
import CategoryCard from "../../components/CategoryCard/CategoryCard";

function InteriorSection() {
  const interiorCategories = categories.filter(
    (category) => category.categoryType === "INTERIOR",
  );

  return (
    <section className="category-section">
      <div className="container">
        <div className="section-header">
          <div>
            <h2>Car Interiors</h2>
            <p>Explore our interior accessories</p>
          </div>
        </div>

        <div className="category-carousel">
          {interiorCategories.map((category) => (
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

export default InteriorSection;