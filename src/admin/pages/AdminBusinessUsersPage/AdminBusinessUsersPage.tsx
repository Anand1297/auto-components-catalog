import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import businessCatalogService from "../../../services/BusinessCatalogService";
import businessUserService, {
  type BusinessUserItem,
  type BusinessUserRole,
} from "../../../services/BusinessUserService";
import "./AdminBusinessUsersPage.css";

export default function AdminBusinessUsersPage() {
  const { businessSlug } = useParams();
  const [businessId, setBusinessId] = useState("");
  const [businessName, setBusinessName] = useState("Business");
  const [users, setUsers] = useState<BusinessUserItem[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<BusinessUserRole>("ADMIN");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!businessSlug) throw new Error("Business not selected.");
      const business = await businessCatalogService.getBusinessBySlug(businessSlug);
      if (!mounted) return;
      setBusinessId(business.id);
      setBusinessName(business.name);
      const rows = await businessUserService.listBusinessUsers(business.id);
      if (mounted) setUsers(rows);
    })()
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err.message : "Unable to load business users.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [businessSlug]);

  async function refreshUsers() {
    if (!businessId) return;
    setUsers(await businessUserService.listBusinessUsers(businessId));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!businessId) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const result = await businessUserService.addBusinessUser({
        businessId,
        email: email.trim(),
        role,
        redirectTo: `${window.location.origin}/set-password`,
      });

      setEmail("");
      setRole("ADMIN");
      setShowForm(false);
      await refreshUsers();
      setSuccess(
        result.invited
          ? `Invite sent to ${result.email}. They can use that email to create a password and log in.`
          : `${result.email} already had a catalog account and has been assigned to ${businessName}.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add business user.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-business-users">
      <div className="admin-page-header">
        <div>
          <h2>Business Users</h2>
          <p>Users listed here can log in and manage {businessName} according to their assigned role.</p>
        </div>
        <button
          type="button"
          className="admin-business-users__add"
          onClick={() => {
            setShowForm((current) => !current);
            setError("");
            setSuccess("");
          }}
        >
          {showForm ? "Cancel" : "+ Add User"}
        </button>
      </div>

      {error && <div className="admin-business-users__message admin-business-users__message--error">{error}</div>}
      {success && <div className="admin-business-users__message admin-business-users__message--success">{success}</div>}

      {showForm && (
        <form className="admin-business-users__form" onSubmit={handleSubmit}>
          <div>
            <h3>Add user to {businessName}</h3>
            <p>
              Enter the same email the person will use for login. New users receive a Supabase invitation; existing users are simply assigned to this business.
            </p>
          </div>

          <div className="admin-business-users__fields">
            <label>
              <span>Email *</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="manager@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label>
              <span>Role *</span>
              <select value={role} onChange={(event) => setRole(event.target.value as BusinessUserRole)}>
                <option value="ADMIN">ADMIN</option>
                <option value="OWNER">OWNER</option>
              </select>
            </label>
          </div>

          <div className="admin-business-users__form-actions">
            <button type="submit" disabled={saving}>{saving ? "Adding..." : "Add / Invite User"}</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="admin-business-users__status">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="admin-business-users__status">No users are assigned to this business yet.</div>
      ) : (
        <div className="admin-business-users__table-wrap">
          <table className="admin-business-users__table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Added</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.mappingId}>
                  <td>{user.email || user.userId}</td>
                  <td><span className="admin-business-users__role">{user.role}</span></td>
                  <td>{user.isActive ? "Active" : "Inactive"}</td>
                  <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
