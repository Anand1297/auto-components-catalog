import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import platformAccessService from "../../../services/PlatformAccessService";
import businessCatalogService from "../../../services/BusinessCatalogService";

export default function BusinessAdminRoute({ children }: { children: ReactNode }) {
  const { businessSlug } = useParams();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!businessSlug) return false;
      businessCatalogService.setActiveBusinessSlug(businessSlug);
      const business = await businessCatalogService.getBusinessBySlug(businessSlug);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      if (await platformAccessService.isRootAdmin(user.id)) return true;
      return Boolean(await platformAccessService.getBusinessMembership(user.id, business.id));
    })()
      .then((result) => { if (mounted) setAllowed(Boolean(result)); })
      .catch((error) => { console.error("Failed to verify business access:", error); if (mounted) setAllowed(false); })
      .finally(() => { if (mounted) setChecking(false); });
    return () => { mounted = false; };
  }, [businessSlug]);

  if (checking) return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>Checking business access...</div>;
  if (!allowed) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}
