import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";
import businessCatalogService from "../../services/BusinessCatalogService";

export default function BusinessRouteScope({ children }: { children: ReactNode }) {
  const { businessSlug } = useParams();
  const [ready, setReady] = useState(false);
  const [valid, setValid] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (!businessSlug) {
      setValid(false);
      setReady(true);
      return;
    }

    businessCatalogService.setActiveBusinessSlug(businessSlug);
    businessCatalogService.getBusinessBySlug(businessSlug)
      .then(() => { if (mounted) { setValid(true); setReady(true); } })
      .catch(() => { if (mounted) { setValid(false); setReady(true); } });

    return () => { mounted = false; };
  }, [businessSlug]);

  if (!ready) return <div style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>Loading business...</div>;
  if (!valid) return <Navigate to="/" replace />;
  return <>{children}</>;
}
