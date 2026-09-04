import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import businessService, { type ManagedBusiness } from "../../../services/BusinessService";
import "./RootDashboardPage.css";

export default function RootDashboardPage() {
  const [businesses, setBusinesses] = useState<ManagedBusiness[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    businessService.getAllBusinesses().then(setBusinesses).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="root-dashboard">
      <div className="root-dashboard__header">
        <div><span>Platform administration</span><h1>Business Catalog</h1><p>Create businesses and open any business workspace.</p></div>
        <Link to="/admin/businesses" className="root-dashboard__primary">+ Add Business</Link>
      </div>
      <div className="root-dashboard__stats">
        <article><strong>{businesses.length}</strong><span>Total Businesses</span></article>
        <article><strong>{businesses.filter((b) => b.is_active).length}</strong><span>Active Businesses</span></article>
      </div>
      <section className="root-dashboard__section">
        <div className="root-dashboard__section-title"><h2>Businesses</h2><Link to="/admin/businesses">Manage all</Link></div>
        {loading ? <p>Loading businesses...</p> : (
          <div className="root-dashboard__grid">
            {businesses.map((business) => (
              <article className="root-dashboard__card" key={business.id}>
                <div><h3>{business.name}</h3><p>{business.slug}</p></div>
                <div className="root-dashboard__actions">
                  <Link to={`/catalog/${business.slug}`}>View Catalog</Link>
                  <Link to={`/admin/business/${business.slug}`} className="root-dashboard__manage">Manage</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
