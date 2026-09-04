-- ============================================================
-- PLATFORM ROOT ADMIN + MULTI-BUSINESS ACCESS
-- Run after business_catalog_admin_rls.sql.
-- Replace <ROOT_AUTH_USER_UUID> at the bottom before running.
-- ============================================================

CREATE TABLE IF NOT EXISTS business_catalog.platform_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('ROOT_ADMIN')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

GRANT SELECT ON business_catalog.platform_users TO authenticated;
ALTER TABLE business_catalog.platform_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Platform users can read own role" ON business_catalog.platform_users;
CREATE POLICY "Platform users can read own role"
ON business_catalog.platform_users
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION business_catalog.is_root_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = business_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM business_catalog.platform_users pu
    WHERE pu.user_id = auth.uid()
      AND pu.role = 'ROOT_ADMIN'
      AND pu.is_active = TRUE
  );
$$;

GRANT EXECUTE ON FUNCTION business_catalog.is_root_admin() TO authenticated;

CREATE OR REPLACE FUNCTION business_catalog.can_manage_business(target_business_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = business_catalog, public
AS $$
  SELECT business_catalog.is_root_admin()
    OR EXISTS (
      SELECT 1 FROM business_catalog.business_users bu
      WHERE bu.business_id = target_business_id
        AND bu.user_id = auth.uid()
        AND bu.is_active = TRUE
        AND bu.role IN ('OWNER','ADMIN')
    );
$$;

GRANT EXECUTE ON FUNCTION business_catalog.can_manage_business(UUID) TO authenticated;

-- Root admin can list every business. Existing public select policy can remain.
DROP POLICY IF EXISTS "Root admin read all businesses" ON business_catalog.businesses;
CREATE POLICY "Root admin read all businesses"
ON business_catalog.businesses
FOR SELECT TO authenticated
USING (business_catalog.is_root_admin());

-- Users may read memberships only for themselves; root may read all mappings.
DROP POLICY IF EXISTS "Users can read own business memberships" ON business_catalog.business_users;
DROP POLICY IF EXISTS "Users can view own business memberships" ON business_catalog.business_users;
DROP POLICY IF EXISTS "Users and root can read business memberships" ON business_catalog.business_users;
CREATE POLICY "Users and root can read business memberships"
ON business_catalog.business_users
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR business_catalog.is_root_admin());

-- Replace the old helper so all existing tenant write policies automatically
-- grant access to ROOT_ADMIN as well as assigned business admins.
CREATE OR REPLACE FUNCTION business_catalog.is_business_admin(target_business_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = business_catalog, public
AS $$
  SELECT business_catalog.can_manage_business(target_business_id);
$$;

GRANT EXECUTE ON FUNCTION business_catalog.is_business_admin(UUID) TO authenticated;

-- IMPORTANT: set your actual Supabase Auth UUID before running this line.
-- INSERT INTO business_catalog.platform_users (user_id, role, is_active)
-- VALUES ('<ROOT_AUTH_USER_UUID>', 'ROOT_ADMIN', TRUE)
-- ON CONFLICT (user_id) DO UPDATE SET role='ROOT_ADMIN', is_active=TRUE;
