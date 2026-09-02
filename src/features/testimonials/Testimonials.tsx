import {
  useEffect,
  useState,
} from "react";
import testimonialService from "../../services/TestimonialService";
import type { Testimonial } from "../../models/Testimonial";
import "./Testimonials.css";

function Testimonials() {
  const [testimonials, setTestimonials] =
    useState<Testimonial[]>([]);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadTestimonials = async () => {
      try {
        const data =
          await testimonialService.getTestimonials();

        if (!cancelled) {
          setTestimonials(data);
          setCurrentIndex(0);
        }
      } catch (error) {
        console.error(
          "Failed to load testimonials:",
          error,
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadTestimonials();

    return () => {
      cancelled = true;
    };
  }, []);

  const totalTestimonials = testimonials.length;

  const goToPrevious = () => {
    if (totalTestimonials === 0) {
      return;
    }

    setCurrentIndex(
      (current) =>
        (current - 1 + totalTestimonials) %
        totalTestimonials,
    );
  };

  const goToNext = () => {
    if (totalTestimonials === 0) {
      return;
    }

    setCurrentIndex(
      (current) =>
        (current + 1) % totalTestimonials,
    );
  };

  if (!loading && testimonials.length === 0) {
    return null;
  }

  return (
    <section className="testimonials">
      <div className="container">
        <div className="section-header">
          <div>
            <h2>Company Testimonials</h2>
            <p>What our customers say about us</p>
          </div>
        </div>

        {loading ? (
          <div className="testimonials__loading">
            Loading testimonials...
          </div>
        ) : (
          <>
            <div className="testimonials__wrapper">
              {totalTestimonials > 1 && (
                <button
                  type="button"
                  className="testimonials__button testimonials__button--previous"
                  onClick={goToPrevious}
                  aria-label="Previous testimonial"
                >
                  ‹
                </button>
              )}

              <div className="testimonials__viewport">
                <div
                  className="testimonials__track"
                  style={{
                    transform: `translateX(-${currentIndex * 100}%)`,
                  }}
                >
                  {testimonials.map((testimonial) => (
                    <article
                      className="testimonial-card"
                      key={testimonial.id}
                    >
                      <div className="testimonial-card__quote">
                        “
                      </div>

                      <p className="testimonial-card__message">
                        {testimonial.message}
                      </p>

                      <div className="testimonial-card__customer">
                        <strong>
                          {testimonial.customer_name}
                        </strong>
                        <span>
                          {testimonial.company_name}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              {totalTestimonials > 1 && (
                <button
                  type="button"
                  className="testimonials__button testimonials__button--next"
                  onClick={goToNext}
                  aria-label="Next testimonial"
                >
                  ›
                </button>
              )}
            </div>

            {totalTestimonials > 1 && (
              <div className="testimonials__indicators">
                {testimonials.map((testimonial, index) => (
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
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default Testimonials;
