import {
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";

import businessSettingsService from "../../services/BusinessSettingsService";

import type { BusinessSettings } from "../../models/BusinessSettings";

import "./Footer.css";

function Footer() {
  const [settings, setSettings] =
    useState<BusinessSettings | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadSettings = async () => {
      try {
        const data =
          await businessSettingsService.getBusinessSettings();

        if (!cancelled) {
          setSettings(data);
        }
      } catch (error) {
        console.error(
          "Failed to load footer settings:",
          error,
        );
      }
    };

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <footer className="site-footer">
      <div className="container">

        <div className="site-footer__grid">

          {/* BUSINESS */}
          <div className="site-footer__section">

            <h3 className="site-footer__brand">
              {settings?.business_name ||
                "Auto Components"}
            </h3>

            <p className="site-footer__description">
              Quality automotive interior and exterior
              components for your vehicle.
            </p>

          </div>


          {/* QUICK LINKS */}
          <div className="site-footer__section">

            <h4>Quick Links</h4>

            <nav className="site-footer__links">

              <Link to="/">
                Home
              </Link>

              <Link to="/products">
                All Products
              </Link>

              <Link to="/category/INTERIOR/all">
                Interior
              </Link>

              <Link to="/category/EXTERIOR/all">
                Exterior
              </Link>

            </nav>

          </div>


          {/* CONTACT */}
          <div className="site-footer__section">

            <h4>Contact</h4>

            <div className="site-footer__contact">

              {settings?.phone && (
                <a
                  href={`tel:${settings.phone}`}
                >
                  Phone: {settings.phone}
                </a>
              )}

              {settings?.mobile && (
                <a
                  href={`tel:${settings.mobile}`}
                >
                  Mobile: {settings.mobile}
                </a>
              )}

              {settings?.whatsapp && (
                <a
                  href={`https://wa.me/${settings.whatsapp.replace(
                    /\D/g,
                    "",
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp: {settings.whatsapp}
                </a>
              )}

              {settings?.email && (
                <a
                  href={`mailto:${settings.email}`}
                >
                  {settings.email}
                </a>
              )}

            </div>

          </div>


          {/* ADDRESS */}
          <div className="site-footer__section">

            <h4>Address</h4>

            <div className="site-footer__address">

              {settings?.address && (
                <p>{settings.address}</p>
              )}

              {(settings?.city ||
                settings?.state ||
                settings?.pincode) && (
                <p>
                  {[
                    settings?.city,
                    settings?.state,
                    settings?.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}

            </div>

            <div className="site-footer__social">

              {settings?.instagram_url && (
                <a
                  href={
                    settings.instagram_url
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  Instagram
                </a>
              )}

              {settings?.facebook_url && (
                <a
                  href={
                    settings.facebook_url
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  Facebook
                </a>
              )}

            </div>

          </div>

        </div>


        <div className="site-footer__bottom">

          <p>
            © {new Date().getFullYear()}{" "}
            {settings?.business_name ||
              "Auto Components"}.
            All rights reserved.
          </p>

        </div>

      </div>
    </footer>
  );
}

export default Footer;