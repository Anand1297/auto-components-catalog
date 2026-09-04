import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import businessCatalogService from "../../../services/BusinessCatalogService";
import platformAccessService from "../../../services/PlatformAccessService";
import { supabase } from "../../../lib/supabase";
import "./AdminSidebar.css";

export default function AdminSidebar() {
  const { businessSlug } = useParams();
  const [businessName, setBusinessName] = useState("Business Catalog");
  const [isRoot, setIsRoot] = useState(false);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => data.user ? platformAccessService.isRootAdmin(data.user.id) : false).then(setIsRoot).catch(console.error);
  }, []);

  useEffect(() => {
    if (!businessSlug) { setBusinessName("Business Catalog"); return; }
    businessCatalogService.setActiveBusinessSlug(businessSlug);
    void businessCatalogService.getBusiness().then((business) => setBusinessName(business.name)).catch(console.error);
  }, [businessSlug]);

  const cls = ({ isActive }: { isActive: boolean }) => isActive ? "admin-sidebar__link admin-sidebar__link--active" : "admin-sidebar__link";

  if (!businessSlug) {
    return (
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">Business Catalog<span>Root Admin</span></div>
        <nav className="admin-sidebar__nav">
          <NavLink to="/admin" end className={cls}>Platform Dashboard</NavLink>
          <NavLink to="/admin/businesses" className={cls}>Businesses</NavLink>
        </nav>
      </aside>
    );
  }

  const base = `/admin/business/${businessSlug}`;
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">{businessName}<span>Business Admin</span></div>
      <nav className="admin-sidebar__nav">
        <NavLink to={base} end className={cls}>Dashboard</NavLink>
        <NavLink to={`${base}/products`} className={cls}>Products</NavLink>
        <NavLink to={`${base}/categories`} className={cls}>Categories</NavLink>
        <NavLink to={`${base}/testimonials`} className={cls}>Testimonials</NavLink>
        <NavLink to={`${base}/settings`} className={cls}>Business Settings</NavLink>
        {isRoot && <NavLink to={`${base}/users`} className={cls}>Business Users</NavLink>}
        {isRoot && <NavLink to="/admin" className={cls}>← All Businesses</NavLink>}
      </nav>
    </aside>
  );
}
