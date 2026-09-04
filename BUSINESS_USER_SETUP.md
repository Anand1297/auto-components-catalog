# Business User Setup

## What this adds

A ROOT_ADMIN can open a business workspace and use **Business Users** to assign multiple login users to that business.

Example:

```text
ABC Furniture
- root@example.com          OWNER (root admin)
- manager@example.com       ADMIN
- sales@example.com         ADMIN
```

Each email is a real Supabase Authentication identity. Authorization comes from `business_catalog.business_users`.

## Deploy Edge Functions

```bash
npx supabase functions deploy create-business-user
npx supabase functions deploy list-business-users
```

No new custom secret is required. These functions use Supabase's built-in `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` environment variables.

## Configure invite redirect URLs

In Supabase Dashboard open:

**Authentication → URL Configuration → Redirect URLs**

Add local development if needed:

```text
http://localhost:5173/set-password
```

Add your production application URL:

```text
https://YOUR-DOMAIN.com/set-password
```

## User flow

1. ROOT_ADMIN opens `/admin/business/<business-slug>/users`.
2. Click **+ Add User**.
3. Enter the email the person will use to log in.
4. Choose `ADMIN` or `OWNER`.
5. If the email is new, Supabase sends an invitation.
6. The invited user opens the email and lands on `/set-password`.
7. The user creates a password.
8. The app redirects to the assigned business dashboard.

If the email already exists in Supabase Auth, no duplicate user is created. The existing Auth user is simply mapped to the selected business and can use their existing password.

A single Auth user may belong to more than one business because `business_users` has one mapping per `(business_id, user_id)`.
