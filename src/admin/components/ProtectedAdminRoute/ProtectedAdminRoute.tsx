import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  Navigate,
  useLocation,
} from "react-router-dom";

import { supabase } from "../../../lib/supabase";

interface ProtectedAdminRouteProps {
  children: ReactNode;
}

function ProtectedAdminRoute({
  children,
}: ProtectedAdminRouteProps) {
  const location = useLocation();

  const [checkingAuth, setCheckingAuth] =
    useState(true);

  const [isAdmin, setIsAdmin] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAdminAccess = async () => {
      try {
        setCheckingAuth(true);

        // 1. Check whether a Supabase session exists
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session?.user) {
          if (mounted) {
            setIsAdmin(false);
          }

          return;
        }

        // 2. Check whether logged-in user is an admin
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

        if (adminError) {
          throw adminError;
        }

        if (mounted) {
          setIsAdmin(Boolean(adminUser));
        }
      } catch (error) {
        console.error(
          "Failed to verify admin access:",
          error,
        );

        if (mounted) {
          setIsAdmin(false);
        }
      } finally {
        if (mounted) {
          setCheckingAuth(false);
        }
      }
    };

    void checkAdminAccess();

    return () => {
      mounted = false;
    };
  }, []);

  // Don't redirect while Supabase is still being checked.
  if (checkingAuth) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Checking admin access...
      </div>
    );
  }

  // Not logged in OR not an admin
  if (!isAdmin) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return <>{children}</>;
}

export default ProtectedAdminRoute;