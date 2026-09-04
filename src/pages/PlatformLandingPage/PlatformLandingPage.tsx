import { Link } from "react-router-dom";
import "./PlatformLandingPage.css";

export default function PlatformLandingPage() {
  return (
    <main className="platform-landing">
      <section className="platform-landing__hero">
        <div className="platform-landing__content">
          <span className="platform-landing__eyebrow">Multi-business catalog platform</span>
          <h1>Build and manage product catalogs for every business from one platform.</h1>
          <p>Products, categories, brands, attributes, images, banners, testimonials and business users stay isolated by business.</p>
          <div className="platform-landing__actions">
            <Link to="/login" className="platform-landing__primary">Admin Login</Link>
          </div>
        </div>
      </section>
      <section className="platform-landing__features">
        <article><h2>Business isolation</h2><p>Each business user can manage only the businesses assigned to their account.</p></article>
        <article><h2>Flexible catalog</h2><p>Every business can define its own categories, brands and dynamic attributes.</p></article>
        <article><h2>Root administration</h2><p>Platform administrators can create businesses, assign users and open any business workspace.</p></article>
      </section>
    </main>
  );
}
