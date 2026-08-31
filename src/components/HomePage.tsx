import HeroCarousel from "../features/carousel/HeroCarousel";
import ExteriorSection from "../features/exteriors/ExteriorSection";
import InteriorSection from "../features/interiors/InteriorSection";
import LatestLaunch from "../features/latest-launch/LatestLaunch";
import Testimonials from "../features/testimonials/Testimonials";

function HomePage() {
  return (
    <main>
      <HeroCarousel />

      <LatestLaunch />

      <InteriorSection />

      <ExteriorSection />

      <Testimonials />
    </main>
  );
}

export default HomePage;