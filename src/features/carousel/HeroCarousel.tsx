import { useEffect, useState } from "react";
import { carouselData } from "../../data/carouselData";
import "./HeroCarousel.css";

function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalSlides = carouselData.length;

  const goToNext = () => {
    setCurrentIndex((current) => (current + 1) % totalSlides);
  };

  const goToPrevious = () => {
    setCurrentIndex(
      (current) => (current - 1 + totalSlides) % totalSlides,
    );
  };

useEffect(() => {
  const interval = setInterval(() => {
    setCurrentIndex((current) => (current + 1) % totalSlides);
  }, 5000);

  return () => {
    clearInterval(interval);
  };
}, [totalSlides]);

  const currentSlide = carouselData[currentIndex];

  return (
    <section className="hero-carousel">
      <div
        className="hero-carousel__slide"
        style={{
          backgroundImage: `url(${currentSlide.imageUrl})`,
        }}
      >
        <div className="hero-carousel__overlay">
          <div className="hero-carousel__content">
            <h1>{currentSlide.title}</h1>

            <p>{currentSlide.description}</p>
          </div>
        </div>

        <button
          type="button"
          className="hero-carousel__button hero-carousel__button--previous"
          onClick={goToPrevious}
          aria-label="Previous slide"
        >
          ‹
        </button>

        <button
          type="button"
          className="hero-carousel__button hero-carousel__button--next"
          onClick={goToNext}
          aria-label="Next slide"
        >
          ›
        </button>

        <div className="hero-carousel__indicators">
          {carouselData.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={`hero-carousel__indicator ${
                index === currentIndex
                  ? "hero-carousel__indicator--active"
                  : ""
              }`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default HeroCarousel;