-- ============================================================
-- BUSINESS CATALOG ADMIN MEMBERSHIP + TENANT-SCOPED RLS
-- Run after the base business_catalog schema exists.
-- ============================================================

CREATE TABLE IF NOT EXISTS business_catalog.business_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES business_catalog.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'ADMIN' CHECK (role IN ('OWNER','ADMIN')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (business_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_business_users_user
  ON business_catalog.business_users(user_id);
CREATE INDEX IF NOT EXISTS idx_business_users_business
  ON business_catalog.business_users(business_id);

GRANT SELECT ON business_catalog.business_users TO authenticated;

ALTER TABLE business_catalog.business_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own business memberships" ON business_catalog.business_users;
CREATE POLICY "Users can read own business memberships"
ON business_catalog.business_users
FOR SELECT TO authenticated
USING (user_id = auth.uid() AND is_active = TRUE);

-- Helper used by write policies.
CREATE OR REPLACE FUNCTION business_catalog.is_business_admin(target_business_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = business_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM business_catalog.business_users bu
    WHERE bu.business_id = target_business_id
      AND bu.user_id = auth.uid()
      AND bu.is_active = TRUE
      AND bu.role IN ('OWNER','ADMIN')
  );
$$;

GRANT EXECUTE ON FUNCTION business_catalog.is_business_admin(UUID) TO authenticated;

-- Direct tenant-owned tables.
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['businesses','categories','brands','products','attributes','banners','site_config','testimonials']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Admin insert %1$s" ON business_catalog.%1$I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Admin update %1$s" ON business_catalog.%1$I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Admin delete %1$s" ON business_catalog.%1$I', t);

    IF t = 'businesses' THEN
      EXECUTE format('CREATE POLICY "Admin update %1$s" ON business_catalog.%1$I FOR UPDATE TO authenticated USING (business_catalog.is_business_admin(id)) WITH CHECK (business_catalog.is_business_admin(id))', t);
    ELSE
      EXECUTE format('CREATE POLICY "Admin insert %1$s" ON business_catalog.%1$I FOR INSERT TO authenticated WITH CHECK (business_catalog.is_business_admin(business_id))', t);
      EXECUTE format('CREATE POLICY "Admin update %1$s" ON business_catalog.%1$I FOR UPDATE TO authenticated USING (business_catalog.is_business_admin(business_id)) WITH CHECK (business_catalog.is_business_admin(business_id))', t);
      EXECUTE format('CREATE POLICY "Admin delete %1$s" ON business_catalog.%1$I FOR DELETE TO authenticated USING (business_catalog.is_business_admin(business_id))', t);
    END IF;
  END LOOP;
END $$;

-- Child tables where business_id lives on the parent.
DROP POLICY IF EXISTS "Admin manage product categories" ON business_catalog.product_categories;
CREATE POLICY "Admin manage product categories"
ON business_catalog.product_categories
FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM business_catalog.products p WHERE p.id = product_id AND business_catalog.is_business_admin(p.business_id))
)
WITH CHECK (
  EXISTS (SELECT 1 FROM business_catalog.products p WHERE p.id = product_id AND business_catalog.is_business_admin(p.business_id))
);

DROP POLICY IF EXISTS "Admin manage product images" ON business_catalog.product_images;
CREATE POLICY "Admin manage product images"
ON business_catalog.product_images
FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM business_catalog.products p WHERE p.id = product_id AND business_catalog.is_business_admin(p.business_id))
)
WITH CHECK (
  EXISTS (SELECT 1 FROM business_catalog.products p WHERE p.id = product_id AND business_catalog.is_business_admin(p.business_id))
);

DROP POLICY IF EXISTS "Admin manage attribute options" ON business_catalog.attribute_options;
CREATE POLICY "Admin manage attribute options"
ON business_catalog.attribute_options
FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM business_catalog.attributes a WHERE a.id = attribute_id AND business_catalog.is_business_admin(a.business_id))
)
WITH CHECK (
  EXISTS (SELECT 1 FROM business_catalog.attributes a WHERE a.id = attribute_id AND business_catalog.is_business_admin(a.business_id))
);

DROP POLICY IF EXISTS "Admin manage product attribute values" ON business_catalog.product_attribute_values;
CREATE POLICY "Admin manage product attribute values"
ON business_catalog.product_attribute_values
FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM business_catalog.products p WHERE p.id = product_id AND business_catalog.is_business_admin(p.business_id))
)
WITH CHECK (
  EXISTS (SELECT 1 FROM business_catalog.products p WHERE p.id = product_id AND business_catalog.is_business_admin(p.business_id))
);

GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA business_catalog TO authenticated;
