import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import "./AdminHeader.css";

function AdminHeader() {
  const navigate = useNavigate();

  const [loggingOut, setLoggingOut] =
    useState(false);

  // ============================================================
  // GO TO CUSTOMER CATALOG
  // ============================================================

  const handleViewCatalog = () => {
    navigate("/");
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      const { error } =
        await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      // After logout go to customer home page
      navigate("/", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Logout failed:",
        error,
      );

      alert(
        "Unable to logout. Please try again.",
      );
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="admin-header">

      <div className="admin-header__title">
        <h1>Admin Panel</h1>
      </div>

      <div className="admin-header__actions">

        <button
          type="button"
          className="admin-header__catalog"
          onClick={handleViewCatalog}
        >
          View Customer Catalog
        </button>

        <div className="admin-header__user">
          Admin
        </div>

        <button
          type="button"
          className="admin-header__logout"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut
            ? "Logging out..."
            : "Logout"}
        </button>

      </div>

    </header>
  );
}

export default AdminHeader;