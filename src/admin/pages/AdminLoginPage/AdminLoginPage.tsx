import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import platformAccessService from "../../../services/PlatformAccessService";
import businessService from "../../../services/BusinessService";
import "./AdminLoginPage.css";

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingExistingSession, setCheckingExistingSession] = useState(true);

  const resolveDestination = async (userId: string) => {
    if (await platformAccessService.isRootAdmin(userId)) return "/admin";
    const businesses = await businessService.getMyBusinesses();
    if (!businesses.length) throw new Error("No business is assigned to this user.");
    return `/admin/business/${businesses[0].slug}`;
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const destination = await resolveDestination(session.user.id);
      if (mounted) navigate(destination, { replace: true });
    })().catch(console.error).finally(() => { if (mounted) setCheckingExistingSession(false); });
    return () => { mounted = false; };
  }, [navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (loginError || !data.user) throw new Error("Invalid email or password.");
      const destination = await resolveDestination(data.user.id);
      navigate(destination, { replace: true });
    } catch (err) {
      console.error("Admin login failed:", err);
      setError(err instanceof Error ? err.message : "Unable to login. Please try again.");
      if (err instanceof Error && err.message.includes("No business")) await supabase.auth.signOut();
    } finally { setLoading(false); }
  };

  if (checkingExistingSession) return <main className="admin-login-page"><div className="admin-login">Checking admin session...</div></main>;

  return (
    <main className="admin-login-page">
      <div className="admin-login">
        <div className="admin-login__brand">Business Catalog</div>
        <div className="admin-login__header"><h1>Admin Login</h1><p>Sign in to manage your assigned business catalog.</p></div>
        <form className="admin-login__form" onSubmit={handleSubmit}>
          <div className="admin-login__field"><label htmlFor="email">Email</label><input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" autoComplete="email" disabled={loading} required /></div>
          <div className="admin-login__field"><label htmlFor="password">Password</label><input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" disabled={loading} required /></div>
          {error && <div className="admin-login__error" role="alert">{error}</div>}
          <button type="submit" className="admin-login__button" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</button>
        </form>
        <div className="admin-login__back"><Link to="/">← Back to Platform</Link></div>
      </div>
    </main>
  );
}
export default AdminLoginPage;
