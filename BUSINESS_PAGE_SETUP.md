# Business Management setup

The admin UI now includes `/admin/businesses` and a `create-business` Edge Function.

## Deploy the new function

```bash
npx supabase functions deploy create-business
```

## Optional SQL refresh

`supabase/business_catalog_admin_rls.sql` already contains the required membership SELECT policy. The added `supabase/business_management.sql` is a small idempotent helper if you want to re-apply the membership policy.

## Runtime behavior

- Business selection is now URL-driven through `/catalog/:businessSlug` and `/admin/business/:businessSlug`.
- `/admin/businesses` lists all businesses linked to the logged-in Supabase user.
- Creating a business creates the `businesses` row, an OWNER mapping in `business_users`, and a default `site_config` row.
- Business switching / URL-based tenant resolution is the next step after this page is tested.
