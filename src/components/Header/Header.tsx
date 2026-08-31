import { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Header.css";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="app-header">
      <div className="container app-header__container">
        <NavLink
          to="/"
          className="app-header__brand"
          onClick={closeMenu}
        >
          Auto Components
        </NavLink>

        <button
          type="button"
          className="app-header__menu-button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          className={`app-header__nav ${
            menuOpen ? "app-header__nav--open" : ""
          }`}
        >
          <NavLink
            to="/"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive
                ? "app-header__link app-header__link--active"
                : "app-header__link"
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/products"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive
                ? "app-header__link app-header__link--active"
                : "app-header__link"
            }
          >
            All Products
          </NavLink>

          {/* ADMIN LOGIN */}
          <NavLink
            to="/login"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive
                ? "app-header__login app-header__login--active"
                : "app-header__login"
            }
          >
            Admin Login
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Header;