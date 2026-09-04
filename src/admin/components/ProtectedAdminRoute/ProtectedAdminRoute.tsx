import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../../../lib/supabase";

export default function ProtectedAdminRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (error) throw error;
        if (mounted) setAuthenticated(Boolean(data.session?.user));
      })
      .catch((error) => { console.error("Failed to verify session:", error); if (mounted) setAuthenticated(false); })
      .finally(() => { if (mounted) setChecking(false); });
    return () => { mounted = false; };
  }, []);

  if (checking) return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>Checking session...</div>;
  if (!authenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}
