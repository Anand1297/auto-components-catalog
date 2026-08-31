import { useState } from "react";
import { testimonialsData } from "../../data/testimonialsData";
import "./Testimonials.css";

function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalTestimonials = testimonialsData.length;

  const goToPrevious = () => {
    setCurrentIndex(
      (current) =>
        (current - 1 + totalTestimonials) % totalTestimonials,
    );
  };

  const goToNext = () => {
    setCurrentIndex(
      (current) => (current + 1) % totalTestimonials,
    );
  };

  return (
    <section className="testimonials">
      <div className="container">
        <div className="section-header">
          <div>
            <h2>Company Testimonials</h2>
            <p>What our customers say about us</p>
          </div>
        </div>

        <div className="testimonials__wrapper">
          <button
            type="button"
            className="testimonials__button testimonials__button--previous"
            onClick={goToPrevious}
            aria-label="Previous testimonial"
          >
            ‹
          </button>

          <div className="testimonials__viewport">
            <div
              className="testimonials__track"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
              }}
            >
              {testimonialsData.map((testimonial) => (
                <article
                  className="testimonial-card"
                  key={testimonial.id}
                >
                  <p className="testimonial-card__message">
                    "{testimonial.message}"
                  </p>

                  <div className="testimonial-card__customer">
                    <strong>{testimonial.customerName}</strong>
                    <span>{testimonial.companyName}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="testimonials__button testimonials__button--next"
            onClick={goToNext}
            aria-label="Next testimonial"
          >
            ›
          </button>
        </div>

        <div className="testimonials__indicators">
          {testimonialsData.map((testimonial, index) => (
            <button
              key={testimonial.id}
              type="button"
              className={`testimonials__indicator ${
                index === currentIndex
                  ? "testimonials__indicator--active"
                  : ""
              }`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;