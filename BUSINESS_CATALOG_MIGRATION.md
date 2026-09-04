# Business Catalog branch conversion

This branch now targets the Supabase `business_catalog` schema.

## Required environment variables

Keep your existing Supabase values locally and add:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Do not commit `.env.local`.

## Supabase setup

1. Expose the `business_catalog` schema in Supabase Data API settings.
2. Run the base `business_catalog` schema/seed SQL created earlier.
3. Run `supabase/business_catalog_admin_rls.sql`.
4. Create/sign up the admin in Supabase Auth.
5. Add that auth user to `business_catalog.business_users` for the Tarpan business.

Example after replacing the values:

```sql
INSERT INTO business_catalog.business_users (business_id, user_id, role)
SELECT b.id, '<AUTH_USER_UUID>', 'OWNER'
FROM business_catalog.businesses b
WHERE b.slug = 'tarpan-auto';
```

## R2 image upload

The branch uses these Edge Functions:

- `upload-product-image`
- `delete-product-image`

Set Supabase Edge Function secrets:

- `R2_ACCOUNT_ID`
- `R2_BUCKET_NAME=business-catalog-assets`
- `R2_PUBLIC_URL=https://<your-r2-development-or-custom-domain>`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`

Then redeploy both Edge Functions. Product images are stored using this structure:

```text
{business-slug}/products/{product-id}/{uuid}.{ext}
```

Example:

```text
tarpan-auto/products/6a4c.../2d81....webp
```

No R2 folders need to be created manually.

## Main conversion

- Supabase client schema changed from `auto_components_catalog` to `business_catalog`.
- Business is resolved dynamically from the `businessSlug` route parameter.
- Homepage banners load from `banners`.
- Categories are dynamic/self-referencing rather than hardcoded Interior/Exterior.
- Products support brand, multiple category mappings, dynamic attributes, selling price and stock status.
- Product filtering uses dynamic business attributes.
- Product detail renders dynamic attributes.
- Admin access is business-scoped through `business_users`.
- Admin add/edit product writes `products`, `product_categories`, and `product_attribute_values`.
- R2 product image rows use `storage_key`, `storage_provider`, `sort_order`, and `is_primary`.

## Run locally

```bash
npm install
npm run dev
```

Then test customer pages first, followed by `/login` and `/admin/products`.
