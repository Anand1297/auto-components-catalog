import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { supabase } from "../../../lib/supabase";

import "./AdminLoginPage.css";

function AdminLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    checkingExistingSession,
    setCheckingExistingSession,
  ] = useState(true);

  useEffect(() => {
    let mounted = true;

    const redirectExistingAdmin =
      async () => {
        try {
          const {
            data: { session },
          } =
            await supabase.auth.getSession();

          if (!session?.user) {
            return;
          }

          const {
            data: adminUser,
            error: adminError,
          } = await supabase
            .from("admin_users")
            .select("id")
            .eq(
              "user_id",
              session.user.id,
            )
            .maybeSingle();

          if (
            !adminError &&
            adminUser &&
            mounted
          ) {
            navigate(
              "/admin/products",
              {
                replace: true,
              },
            );
          }
        } catch (error) {
          console.error(
            "Failed to check existing admin session:",
            error,
          );
        } finally {
          if (mounted) {
            setCheckingExistingSession(
              false,
            );
          }
        }
      };

    void redirectExistingAdmin();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const {
        data,
        error: loginError,
      } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        setError(
          "Invalid email or password.",
        );

        return;
      }

      const userId =
        data.user?.id;

      if (!userId) {
        setError(
          "Unable to verify user.",
        );

        await supabase.auth.signOut();

        return;
      }

      /*
       * Verify that the authenticated
       * user exists in admin_users.
       */
      const {
        data: adminUser,
        error: adminError,
      } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq(
          "user_id",
          userId,
        )
        .maybeSingle();

      if (adminError) {
        console.error(
          "Failed to verify admin:",
          adminError,
        );

        setError(
          "Unable to verify admin access.",
        );

        await supabase.auth.signOut();

        return;
      }

      if (!adminUser) {
        setError(
          "You do not have admin access.",
        );

        await supabase.auth.signOut();

        return;
      }

      navigate(
        "/admin/products",
        {
          replace: true,
        },
      );
    } catch (error) {
      console.error(
        "Admin login failed:",
        error,
      );

      setError(
        "Unable to login. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingExistingSession) {
    return (
      <main className="admin-login-page">
        <div className="admin-login">
          Checking admin session...
        </div>
      </main>
    );
  }

  return (
    <main className="admin-login-page">

      <div className="admin-login">

        <div className="admin-login__brand">
          Tarpan Auto Agencies
        </div>

        <div className="admin-login__header">

          <h1>
            Admin Login
          </h1>

          <p>
            Sign in to manage the product catalog.
          </p>

        </div>

        <form
          className="admin-login__form"
          onSubmit={handleSubmit}
        >

          <div className="admin-login__field">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
              placeholder="Enter your email"
              autoComplete="email"
              disabled={loading}
              required
            />

          </div>

          <div className="admin-login__field">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value,
                )
              }
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={loading}
              required
            />

          </div>

          {error && (
            <div
              className="admin-login__error"
              role="alert"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="admin-login__button"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>

        </form>

        <div className="admin-login__back">

          <Link to="/">
            ← Back to Customer Catalog
          </Link>

        </div>

      </div>

    </main>
  );
}

export default AdminLoginPage;