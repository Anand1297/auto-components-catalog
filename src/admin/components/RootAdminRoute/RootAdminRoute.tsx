import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import platformAccessService from "../../../services/PlatformAccessService";
import businessService from "../../../services/BusinessService";

export default function RootAdminRoute({ children }: { children: ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [isRoot, setIsRoot] = useState(false);
  const [fallbackPath, setFallbackPath] = useState("/login");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const root = await platformAccessService.isRootAdmin(user.id);
      if (!mounted) return;
      setIsRoot(root);
      if (!root) {
        const businesses = await businessService.getMyBusinesses();
        if (mounted && businesses.length) setFallbackPath(`/admin/business/${businesses[0].slug}`);
      }
    })().catch(console.error).finally(() => { if (mounted) setChecking(false); });
    return () => { mounted = false; };
  }, []);

  if (checking) return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>Checking platform access...</div>;
  if (!isRoot) return <Navigate to={fallbackPath} replace />;
  return <>{children}</>;
}
