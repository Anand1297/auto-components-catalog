# Category image upload setup

## 1. Run SQL

Run:

`supabase/category_image_upload.sql`

in the Supabase SQL Editor.

This adds:

- `categories.image_url`
- `categories.image_key`

The URL is shown by the customer website.
The key is used to safely delete an old R2 image when an admin replaces/deletes it.

## 2. Deploy the new Edge Functions

From the project root:

```bash
supabase functions deploy upload-category-image
supabase functions deploy delete-category-image
```

The functions use the same R2 secrets as the existing product image functions:

- R2_ACCOUNT_ID
- R2_BUCKET_NAME
- R2_PUBLIC_URL
- R2_ACCESS_KEY_ID
- R2_SECRET_ACCESS_KEY

If those are already configured as Supabase Function secrets for product images, no new R2 credentials are needed.

## 3. Admin behavior

Admin > Categories now supports both:

- Category Image URL
- Upload From Device

If a local image is selected, it is uploaded to:

`categories/<category-name>/<timestamp>_<filename>`

in Cloudflare R2.

A local file takes priority over a typed image URL.

When an R2-managed category image is replaced or a category is deleted, the old R2 image is also cleaned up where possible.

## 4. Branding

The visible application brand and browser title were updated to:

`Tarpan Auto Agencies`
