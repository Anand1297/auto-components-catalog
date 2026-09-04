import { useEffect, useState, type FormEvent } from "react";
import businessService, {
  type CreateBusinessRequest,
  type ManagedBusiness,
} from "../../../services/BusinessService";
import "./AdminBusinessesPage.css";

const emptyForm: CreateBusinessRequest = {
  name: "",
  slug: "",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  currency: "INR",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<ManagedBusiness[]>([]);
  const [form, setForm] = useState<CreateBusinessRequest>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadBusinesses();
  }, []);

  async function loadBusinesses() {
    try {
      setLoading(true);
      setError("");
      setBusinesses(await businessService.getAllBusinesses());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load businesses.");
    } finally {
      setLoading(false);
    }
  }

  function change<K extends keyof CreateBusinessRequest>(key: K, value: CreateBusinessRequest[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleBusinessName(value: string) {
    setForm((current) => ({
      ...current,
      name: value,
      slug: slugify(value),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      const created = await businessService.createBusiness(form);
      setBusinesses((current) => [...current, created]);
      setForm(emptyForm);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create business.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-businesses">
      <div className="admin-page-header">
        <div>
          <h2>Businesses</h2>
          <p>Create and manage every business on the platform.</p>
        </div>
        <button
          type="button"
          className="admin-businesses__add"
          onClick={() => setShowForm((current) => !current)}
        >
          {showForm ? "Cancel" : "+ Add Business"}
        </button>
      </div>

      {error && <div className="admin-businesses__error">{error}</div>}

      {showForm && (
        <form className="admin-businesses__form" onSubmit={handleSubmit}>
          <div className="admin-businesses__form-heading">
            <h3>New Business</h3>
            <p>The root admin will automatically be linked as OWNER for this business.</p>
          </div>

          <div className="admin-businesses__fields">
            <label>
              <span>Business Name *</span>
              <input
                value={form.name}
                onChange={(event) => handleBusinessName(event.target.value)}
                required
              />
            </label>

            <label>
              <span>Business Slug *</span>
              <input
                value={form.slug}
                onChange={(event) => change("slug", slugify(event.target.value))}
                placeholder="abc-furniture"
                required
              />
            </label>

            <label>
              <span>Phone</span>
              <input value={form.phone} onChange={(event) => change("phone", event.target.value)} />
            </label>

            <label>
              <span>WhatsApp</span>
              <input
                value={form.whatsapp}
                onChange={(event) => change("whatsapp", event.target.value)}
              />
            </label>

            <label>
              <span>Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => change("email", event.target.value)}
              />
            </label>

            <label>
              <span>Currency</span>
              <select
                value={form.currency}
                onChange={(event) => change("currency", event.target.value)}
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="AED">AED</option>
              </select>
            </label>

            <label className="admin-businesses__address">
              <span>Address</span>
              <textarea
                rows={3}
                value={form.address}
                onChange={(event) => change("address", event.target.value)}
              />
            </label>
          </div>

          <div className="admin-businesses__form-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create Business"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="admin-businesses__status">Loading businesses...</div>
      ) : businesses.length === 0 ? (
        <div className="admin-businesses__status">No businesses have been created yet.</div>
      ) : (
        <div className="admin-businesses__grid">
          {businesses.map((business) => (
            <article key={business.id} className="admin-businesses__card">
              <div className="admin-businesses__card-top">
                <div>
                  <h3>{business.name}</h3>
                  <p>{business.slug}</p>
                </div>
                <span>{business.is_active ? "ACTIVE" : "INACTIVE"}</span>
              </div>

              <dl>
                {business.email && (
                  <div><dt>Email</dt><dd>{business.email}</dd></div>
                )}
                {business.phone && (
                  <div><dt>Phone</dt><dd>{business.phone}</dd></div>
                )}
                <div><dt>Currency</dt><dd>{business.currency}</dd></div>
                <div><dt>Status</dt><dd>{business.is_active ? "Active" : "Inactive"}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
