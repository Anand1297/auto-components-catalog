-- Run this once in Supabase SQL Editor.

alter table auto_components_catalog.categories
add column if not exists image_url text;

alter table auto_components_catalog.categories
add column if not exists image_key text;

grant usage
on schema auto_components_catalog
to anon, authenticated;

grant select
on auto_components_catalog.categories
to anon, authenticated;

grant insert, update, delete
on auto_components_catalog.categories
to authenticated;

alter table auto_components_catalog.categories
enable row level security;

drop policy if exists
"Anyone can read categories"
on auto_components_catalog.categories;

create policy
"Anyone can read categories"
on auto_components_catalog.categories
for select
to anon, authenticated
using (true);

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

select
  id,
  name,
  type,
  image_url,
  image_key
from auto_components_catalog.categories
order by type, name;
