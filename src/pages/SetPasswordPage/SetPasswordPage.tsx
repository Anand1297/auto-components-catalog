import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import businessService from "../../services/BusinessService";
import platformAccessService from "../../services/PlatformAccessService";
import "./SetPasswordPage.css";

export default function SetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw new Error("This invite link is invalid or has expired. Please ask the root admin for a new invitation.");
      if (mounted) setReady(true);
    })().catch((err) => {
      if (mounted) setError(err instanceof Error ? err.message : "Unable to verify invitation.");
    });
    return () => { mounted = false; };
  }, []);

  async function destinationFor(userId: string) {
    if (await platformAccessService.isRootAdmin(userId)) return "/admin";
    const businesses = await businessService.getMyBusinesses();
    if (!businesses.length) return "/login";
    return `/admin/business/${businesses[0].slug}`;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const { data, error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError || !data.user) throw updateError ?? new Error("Unable to save password.");
      navigate(await destinationFor(data.user.id), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="set-password-page">
      <div className="set-password-card">
        <div className="set-password-card__brand">Business Catalog</div>
        <h1>Create your password</h1>
        <p>Use this password with the email address that received your business invitation.</p>

        {error && <div className="set-password-card__error">{error}</div>}

        {ready && (
          <form onSubmit={handleSubmit}>
            <label>
              <span>New password</span>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} autoComplete="new-password" required />
            </label>
            <label>
              <span>Confirm password</span>
              <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} autoComplete="new-password" required />
            </label>
            <button type="submit" disabled={saving}>{saving ? "Saving..." : "Set Password & Continue"}</button>
          </form>
        )}

        {!ready && <Link to="/login">Back to login</Link>}
      </div>
    </main>
  );
}
