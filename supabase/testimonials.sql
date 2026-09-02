-- Run this once in the Supabase SQL Editor.
-- It creates dynamic testimonials, adds default testimonials,
-- allows public read access, and restricts add/delete to admins.

create table if not exists auto_components_catalog.testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  company_name text not null,
  message text not null,
  created_at timestamptz not null default now(),

  constraint testimonials_customer_name_length
    check (char_length(customer_name) between 1 and 100),

  constraint testimonials_company_name_length
    check (char_length(company_name) between 1 and 120),

  constraint testimonials_message_length
    check (char_length(message) between 1 and 500)
);

alter table auto_components_catalog.testimonials
  enable row level security;

grant usage
on schema auto_components_catalog
TO anon, authenticated;

grant select
on auto_components_catalog.testimonials
TO anon, authenticated;

grant insert, delete
on auto_components_catalog.testimonials
TO authenticated;

-- Recreate policies safely if this script is rerun.
drop policy if exists "Anyone can read testimonials"
on auto_components_catalog.testimonials;

drop policy if exists "Admins can insert testimonials"
on auto_components_catalog.testimonials;

drop policy if exists "Admins can delete testimonials"
on auto_components_catalog.testimonials;

create policy "Anyone can read testimonials"
on auto_components_catalog.testimonials
for select
to anon, authenticated
using (true);

create policy "Admins can insert testimonials"
on auto_components_catalog.testimonials
for insert
to authenticated
with check (auto_components_catalog.is_admin());

create policy "Admins can delete testimonials"
on auto_components_catalog.testimonials
for delete
to authenticated
using (auto_components_catalog.is_admin());

-- Add default testimonials only when the table is empty.
insert into auto_components_catalog.testimonials (
  customer_name,
  company_name,
  message
)
select *
from (
  values
    (
      'Rahul Sharma',
      'ABC Motors',
      'The product quality is excellent and the catalog makes it very easy to find the right accessories.'
    ),
    (
      'Amit Patel',
      'Patel Auto',
      'A great range of interior and exterior accessories with clear product information.'
    ),
    (
      'Vikas Mehta',
      'Mehta Automobiles',
      'The products are reliable and the overall experience has been smooth and convenient.'
    ),
    (
      'Suresh Kumar',
      'Kumar Car Accessories',
      'Good variety of products with useful compatibility information for different cars.'
    )
) as defaults(customer_name, company_name, message)
where not exists (
  select 1
  from auto_components_catalog.testimonials
);
