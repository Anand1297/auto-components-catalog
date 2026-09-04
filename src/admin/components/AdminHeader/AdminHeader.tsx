import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import platformAccessService from "../../../services/PlatformAccessService";
import "./AdminHeader.css";

function AdminHeader() {
  const navigate = useNavigate();
  const { businessSlug } = useParams();
  const [loggingOut, setLoggingOut] = useState(false);
  const [roleLabel, setRoleLabel] = useState("Business Admin");

  useEffect(() => {
    void supabase.auth.getUser()
      .then(({ data }) => data.user ? platformAccessService.isRootAdmin(data.user.id) : false)
      .then((isRoot) => setRoleLabel(isRoot ? "Root Admin" : "Business Admin"))
      .catch(console.error);
  }, []);

  const handleViewCatalog = () => {
    if (businessSlug) navigate(`/catalog/${businessSlug}`);
    else navigate("/");
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Unable to logout. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="admin-header">
      <div className="admin-header__title"><h1>{businessSlug ? "Business Admin" : "Platform Admin"}</h1></div>
      <div className="admin-header__actions">
        <button type="button" className="admin-header__catalog" onClick={handleViewCatalog}>{businessSlug ? "View Customer Catalog" : "Platform Home"}</button>
        <div className="admin-header__user">{roleLabel}</div>
        <button type="button" className="admin-header__logout" onClick={handleLogout} disabled={loggingOut}>{loggingOut ? "Logging out..." : "Logout"}</button>
      </div>
    </header>
  );
}
export default AdminHeader;
