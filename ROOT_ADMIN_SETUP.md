# Root Admin Setup

This version separates platform administration from business administration.

## 1. Run the existing tenant RLS

Run `supabase/business_catalog_admin_rls.sql` if it has not already been applied.

## 2. Create the platform root-admin model

Open `supabase/platform_root_admin.sql`, replace `<ROOT_AUTH_USER_UUID>` in the commented INSERT example with your Supabase Authentication user UUID, uncomment the INSERT, and run the script in the Supabase SQL editor.

The root user is global because of `platform_users`. `business_users` remains the business-level authorization table.

## 3. Deploy root-only business creation

```bash
npx supabase functions deploy create-business
```

The function now rejects any authenticated user who is not an active `ROOT_ADMIN`.

## 4. Routes

- `/` - platform landing page
- `/login` - shared admin login
- `/admin` - root platform dashboard (root only)
- `/admin/businesses` - create/list all businesses (root only)
- `/admin/business/:businessSlug` - business dashboard
- `/catalog/:businessSlug` - public customer catalog

A normal business user is redirected after login to the first business assigned through `business_users`. A root admin is redirected to `/admin` and may open any business.

## 5. Business creation

When ROOT_ADMIN creates a business, `create-business` creates:

1. `businesses`
2. default `site_config`
3. `business_users` mapping for the root user with role `OWNER`

Business-user creation/assignment is the next platform feature; until that screen is added, existing test users can still be mapped to businesses through `business_users`.

## Business Users / Supabase Auth invitations

The root admin can manage users for a selected business at:

```text
/admin/business/:businessSlug/users
```

Deploy the two additional Edge Functions:

```bash
npx supabase functions deploy create-business-user
npx supabase functions deploy list-business-users
```

`create-business-user` is ROOT_ADMIN-only. It behaves as follows:

- If the email does not yet exist in Supabase Auth, Supabase sends an invitation email and the new Auth UUID is added to `business_catalog.business_users`.
- If the email already exists in Supabase Auth, no duplicate Auth user is created; that Auth UUID is mapped to the selected business.
- The same Auth user may be mapped to multiple businesses through multiple `business_users` rows.

For invitation password setup, add your application URL to **Supabase Dashboard → Authentication → URL Configuration → Redirect URLs**. During local development include:

```text
http://localhost:5173/set-password
```

For production include your real application URL, for example:

```text
https://your-domain.com/set-password
```

The invite link sends the user to `/set-password`, where they choose their own password. After saving it, the app redirects them to their assigned business dashboard.
