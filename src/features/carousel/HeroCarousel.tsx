import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import businessCatalogService from "../../services/BusinessCatalogService";
import type { Banner } from "../../models/Catalog";
import "./HeroCarousel.css";

export default function HeroCarousel() {
  const navigate = useNavigate();
  const [slides, setSlides] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => { businessCatalogService.getBanners().then(setSlides).catch(console.error); }, []);
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = window.setInterval(() => setCurrentIndex((i) => (i + 1) % slides.length), 5000);
    return () => window.clearInterval(interval);
  }, [slides.length]);

  if (!slides.length) return null;
  const current = slides[currentIndex];
  return (
    <section className="hero-carousel">
      <div className="hero-carousel__slide" style={current.imageUrl ? { backgroundImage: `url(${current.imageUrl})` } : undefined} onClick={() => current.link && navigate(current.link)}>
        <div className="hero-carousel__overlay"><div className="hero-carousel__content"><h1>{current.title}</h1><p>{current.subtitle}</p></div></div>
        {slides.length > 1 && <>
          <button type="button" className="hero-carousel__button hero-carousel__button--previous" onClick={(e) => { e.stopPropagation(); setCurrentIndex((i) => (i - 1 + slides.length) % slides.length); }}>‹</button>
          <button type="button" className="hero-carousel__button hero-carousel__button--next" onClick={(e) => { e.stopPropagation(); setCurrentIndex((i) => (i + 1) % slides.length); }}>›</button>
          <div className="hero-carousel__indicators">{slides.map((slide, index) => <button key={slide.id} type="button" className={`hero-carousel__indicator ${index === currentIndex ? "hero-carousel__indicator--active" : ""}`} onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); }} />)}</div>
        </>}
      </div>
    </section>
  );
}
