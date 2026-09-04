import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import businessCatalogService from "../../services/BusinessCatalogService";
import platformAccessService from "../../services/PlatformAccessService";
import { supabase } from "../../lib/supabase";
import "./Header.css";

export default function Header() {
  const { businessSlug = "" } = useParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [businessName, setBusinessName] = useState("Business Catalog");
  const [adminPath, setAdminPath] = useState("/login");
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const catalogBase = `/catalog/${businessSlug}`;

  useEffect(() => {
    businessCatalogService.setActiveBusinessSlug(businessSlug);
    void businessCatalogService.getBusiness().then((business) => { setBusinessName(business.name); document.title = business.name; }).catch(console.error);
  }, [businessSlug]);

  useEffect(() => {
    let active = true;
    const checkAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) { if (active) { setHasAdminAccess(false); setAdminPath("/login"); } return; }
        if (await platformAccessService.isRootAdmin(session.user.id)) {
          if (active) { setHasAdminAccess(true); setAdminPath("/admin"); }
          return;
        }
        const business = await businessCatalogService.getBusiness();
        const membership = await platformAccessService.getBusinessMembership(session.user.id, business.id);
        if (active) {
          setHasAdminAccess(Boolean(membership));
          setAdminPath(membership ? `/admin/business/${businessSlug}` : "/login");
        }
      } catch (error) {
        console.error("Unable to resolve admin access:", error);
        if (active) { setHasAdminAccess(false); setAdminPath("/login"); }
      }
    };
    void checkAdmin();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => { void checkAdmin(); });
    return () => { active = false; authListener.subscription.unsubscribe(); };
  }, [businessSlug]);

  const close = () => setMenuOpen(false);
  return (
    <header className="app-header">
      <div className="container app-header__container">
        <NavLink to={catalogBase} className="app-header__brand" onClick={close}>{businessName}</NavLink>
        <button type="button" className="app-header__menu-button" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle navigation"><span /><span /><span /></button>
        <nav className={`app-header__nav ${menuOpen ? "app-header__nav--open" : ""}`}>
          <NavLink to={catalogBase} end onClick={close} className={({ isActive }) => isActive ? "app-header__link app-header__link--active" : "app-header__link"}>Home</NavLink>
          <NavLink to={`${catalogBase}/products`} onClick={close} className={({ isActive }) => isActive ? "app-header__link app-header__link--active" : "app-header__link"}>All Products</NavLink>
          <NavLink to={adminPath} onClick={close} className="app-header__login">{hasAdminAccess ? "Admin Panel" : "Admin"}</NavLink>
        </nav>
      </div>
    </header>
  );
}
