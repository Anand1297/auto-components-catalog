import HeroCarousel from "../features/carousel/HeroCarousel";
import LatestLaunch from "../features/latest-launch/LatestLaunch";
import CategorySection from "../features/categories/CategorySection";
import Testimonials from "../features/testimonials/Testimonials";

export default function HomePage() {
  return <main><HeroCarousel /><LatestLaunch /><CategorySection /><Testimonials /></main>;
}
