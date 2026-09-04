-- Business management support for the generic catalog admin.
-- Safe to run after business_catalog_admin_rls.sql.

ALTER TABLE business_catalog.business_users ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON business_catalog.business_users TO authenticated;

DROP POLICY IF EXISTS "Users can view own business memberships" ON business_catalog.business_users;
CREATE POLICY "Users can view own business memberships"
ON business_catalog.business_users
FOR SELECT TO authenticated
USING (user_id = auth.uid() AND is_active = TRUE);
