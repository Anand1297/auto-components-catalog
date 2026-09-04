import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import businessSettingsService from "../../services/BusinessSettingsService";
import businessCatalogService from "../../services/BusinessCatalogService";
import categoryService from "../../services/CategoryService";
import type { BusinessSettings } from "../../models/BusinessSettings";
import type { Category } from "../../models/Category";
import "./Footer.css";

function Footer() {
  const { businessSlug = "" } = useParams();
  const catalogBase = `/catalog/${businessSlug}`;
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [description, setDescription] = useState("Browse our latest products and categories.");
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let cancelled = false;

    const loadFooter = async () => {
      try {
        const [businessSettings, siteConfig, rootCategories] = await Promise.all([
          businessSettingsService.getBusinessSettings(),
          businessCatalogService.getSiteConfig(),
          categoryService.getRootCategories(),
        ]);

        if (!cancelled) {
          setSettings(businessSettings);
          setDescription(
            siteConfig?.catalogSubtitle ||
              siteConfig?.footerText ||
              "Browse our latest products and categories.",
          );
          setCategories(rootCategories.slice(0, 4));
        }
      } catch (error) {
        console.error("Failed to load footer data:", error);
      }
    };

    void loadFooter();

    return () => {
      cancelled = true;
    };
  }, []);

  const businessName = settings?.business_name || "Business Catalog";

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div className="site-footer__section">
            <h3 className="site-footer__brand">{businessName}</h3>
            <p className="site-footer__description">{description}</p>
          </div>

          <div className="site-footer__section">
            <h4>Quick Links</h4>
            <nav className="site-footer__links">
              <Link to={catalogBase}>Home</Link>
              <Link to={`${catalogBase}/products`}>All Products</Link>
              {categories.map((category) => (
                <Link key={category.id} to={`${catalogBase}/category/${category.slug}`}>
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="site-footer__section">
            <h4>Contact</h4>
            <div className="site-footer__contact">
              {settings?.phone && <a href={`tel:${settings.phone}`}>Phone: {settings.phone}</a>}
              {settings?.mobile && settings.mobile !== settings.phone && (
                <a href={`tel:${settings.mobile}`}>Mobile: {settings.mobile}</a>
              )}
              {settings?.whatsapp && (
                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp: {settings.whatsapp}
                </a>
              )}
              {settings?.email && <a href={`mailto:${settings.email}`}>{settings.email}</a>}
            </div>
          </div>

          <div className="site-footer__section">
            <h4>Address</h4>
            <div className="site-footer__address">
              {settings?.address && <p>{settings.address}</p>}
              {(settings?.city || settings?.state || settings?.pincode) && (
                <p>{[settings.city, settings.state, settings.pincode].filter(Boolean).join(", ")}</p>
              )}
            </div>

            <div className="site-footer__social">
              {settings?.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noreferrer">
                  Instagram
                </a>
              )}
              {settings?.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noreferrer">
                  Facebook
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>
            © {new Date().getFullYear()} {businessName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
