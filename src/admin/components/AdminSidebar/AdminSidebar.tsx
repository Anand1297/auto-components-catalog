import { NavLink } from "react-router-dom";
import "./AdminSidebar.css";

function AdminSidebar() {
  return (
    <aside className="admin-sidebar">

      <div className="admin-sidebar__brand">
        Tarpan Auto Agencies
        <span>Admin</span>
      </div>

      <nav className="admin-sidebar__nav">

        {/* <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            isActive
              ? "admin-sidebar__link admin-sidebar__link--active"
              : "admin-sidebar__link"
          }
        >
          Dashboard
        </NavLink> */}

        <NavLink
          to="/admin/products"
          className={({ isActive }) =>
            isActive
              ? "admin-sidebar__link admin-sidebar__link--active"
              : "admin-sidebar__link"
          }
        >
          Products
        </NavLink>

        <NavLink
          to="/admin/categories"
          className={({ isActive }) =>
            isActive
              ? "admin-sidebar__link admin-sidebar__link--active"
              : "admin-sidebar__link"
          }
        >
          Categories
        </NavLink>

        <NavLink
          to="/admin/testimonials"
          className={({ isActive }) =>
            isActive
              ? "admin-sidebar__link admin-sidebar__link--active"
              : "admin-sidebar__link"
          }
        >
          Testimonials
        </NavLink>

        <NavLink
          to="/admin/settings"
          className={({ isActive }) =>
            isActive
              ? "admin-sidebar__link admin-sidebar__link--active"
              : "admin-sidebar__link"
          }
        >
          Business Settings
        </NavLink>
      </nav>

    </aside>
  );
}

export default AdminSidebar;