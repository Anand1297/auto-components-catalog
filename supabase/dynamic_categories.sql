-- ============================================================
-- Dynamic category support
-- Run this in Supabase SQL Editor.
-- ============================================================

-- 1. Add an optional image URL used by the customer home page.
alter table auto_components_catalog.categories
add column if not exists image_url text;

-- 2. Make sure the API roles can use the schema/table.
grant usage
on schema auto_components_catalog
to anon, authenticated;

grant select
on auto_components_catalog.categories
to anon, authenticated;

grant insert, update, delete
on auto_components_catalog.categories
to authenticated;

-- 3. Enable RLS.
alter table auto_components_catalog.categories
enable row level security;

-- 4. Public/customer catalog can read categories.
drop policy if exists
"Anyone can read categories"
on auto_components_catalog.categories;

create policy
"Anyone can read categories"
on auto_components_catalog.categories
for select
to anon, authenticated
using (true);

-- 5. Only admins can create categories.
drop policy if exists
"Admins can insert categories"
on auto_components_catalog.categories;

create policy
"Admins can insert categories"
on auto_components_catalog.categories
for insert
to authenticated
with check (
  auto_components_catalog.is_admin()
);

-- 6. Only admins can rename a category,
--    move it Interior <-> Exterior,
--    or change its image URL.
drop policy if exists
"Admins can update categories"
on auto_components_catalog.categories;

create policy
"Admins can update categories"
on auto_components_catalog.categories
for update
to authenticated
using (
  auto_components_catalog.is_admin()
)
with check (
  auto_components_catalog.is_admin()
);

-- 7. Only admins can delete categories.
drop policy if exists
"Admins can delete categories"
on auto_components_catalog.categories;

create policy
"Admins can delete categories"
on auto_components_catalog.categories
for delete
to authenticated
using (
  auto_components_catalog.is_admin()
);

-- Optional: apply the old static category images
-- to matching existing rows.
update auto_components_catalog.categories
set image_url = case
  when lower(name) = 'floor mats'
    then '/categories/default.png'
  when lower(name) = 'seat covers'
    then '/categories/download.png'
  when lower(name) = 'steering covers'
    then '/categories/default1.png'
  when lower(name) = 'body covers'
    then '/categories/sih.png'
  when lower(name) = 'mud flaps'
    then '/categories/not_Upload.png'
  when lower(name) = 'sun visors'
    then '/categories/default2.png'
  else image_url
end
where image_url is null;

-- Check the result.
select
  id,
  name,
  type,
  image_url
from auto_components_catalog.categories
order by type, name;
