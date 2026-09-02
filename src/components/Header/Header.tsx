import {
  useEffect,
  useState,
} from "react";

import {
  NavLink,
} from "react-router-dom";

import { supabase } from "../../lib/supabase";

import "./Header.css";

function Header() {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const [isAdmin, setIsAdmin] =
    useState(false);

  const [checkingAdmin, setCheckingAdmin] =
    useState(true);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  useEffect(() => {
    let mounted = true;

    const verifyAdmin = async (
      userId?: string,
    ) => {
      if (!userId) {
        if (mounted) {
          setIsAdmin(false);
          setCheckingAdmin(false);
        }

        return;
      }

      try {
        const {
          data: adminUser,
          error,
        } = await supabase
          .from("admin_users")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (mounted) {
          setIsAdmin(
            Boolean(adminUser),
          );
        }
      } catch (error) {
        console.error(
          "Failed to verify admin session:",
          error,
        );

        if (mounted) {
          setIsAdmin(false);
        }
      } finally {
        if (mounted) {
          setCheckingAdmin(false);
        }
      }
    };

    const loadSession = async () => {
      const {
        data: { session },
        error,
      } =
        await supabase.auth.getSession();

      if (error) {
        console.error(
          "Failed to read session:",
          error,
        );

        if (mounted) {
          setIsAdmin(false);
          setCheckingAdmin(false);
        }

        return;
      }

      await verifyAdmin(
        session?.user.id,
      );
    };

    void loadSession();

    const {
      data: authListener,
    } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          /*
           * Run the database verification
           * outside the auth callback itself.
           */
          window.setTimeout(() => {
            if (mounted) {
              setCheckingAdmin(true);
            }

            void verifyAdmin(
              session?.user.id,
            );
          }, 0);
        },
      );

    return () => {
      mounted = false;

      authListener.subscription
        .unsubscribe();
    };
  }, []);

  return (
    <header className="app-header">
      <div className="container app-header__container">
        <NavLink
          to="/"
          className="app-header__brand"
          onClick={closeMenu}
        >
          Tarpan Auto Agencies
        </NavLink>

        <button
          type="button"
          className="app-header__menu-button"
          onClick={() =>
            setMenuOpen(
              (open) => !open,
            )
          }
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          className={`app-header__nav ${
            menuOpen
              ? "app-header__nav--open"
              : ""
          }`}
        >
          <NavLink
            to="/"
            onClick={closeMenu}
            className={({
              isActive,
            }) =>
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
            className={({
              isActive,
            }) =>
              isActive
                ? "app-header__link app-header__link--active"
                : "app-header__link"
            }
          >
            All Products
          </NavLink>

          <NavLink
            to={
              isAdmin
                ? "/admin/products"
                : "/login"
            }
            onClick={closeMenu}
            className={({
              isActive,
            }) =>
              isActive
                ? "app-header__login app-header__login--active"
                : "app-header__login"
            }
          >
            {checkingAdmin
              ? "Admin"
              : isAdmin
                ? "Admin Panel"
                : "Admin Login"}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Header;
