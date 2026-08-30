-- Ebyan CMS production setup (run in Supabase SQL Editor after reviewing)
create table if not exists public.site_content (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create table if not exists public.site_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  price numeric not null default 400,
  image_url text,
  description text,
  benefits jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);
create table if not exists public.site_pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  body jsonb not null default '{}'::jsonb,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.site_content enable row level security;
alter table public.site_products enable row level security;
alter table public.site_pages enable row level security;
alter table public.admin_users enable row level security;

-- Public storefront can read published content.
create policy "public read site content" on public.site_content for select using (true);
create policy "public read active products" on public.site_products for select using (active = true);
create policy "public read published pages" on public.site_pages for select using (published = true);

-- Admins can manage CMS records. Add the admin user's UUID to admin_users first.
create policy "admins manage site content" on public.site_content for all
using (exists(select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists(select 1 from public.admin_users a where a.user_id = auth.uid()));

create policy "admins manage products" on public.site_products for all
using (exists(select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists(select 1 from public.admin_users a where a.user_id = auth.uid()));

create policy "admins manage pages" on public.site_pages for all
using (exists(select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists(select 1 from public.admin_users a where a.user_id = auth.uid()));

-- After creating your admin auth user, insert its UUID:
-- insert into public.admin_users(user_id) values ('YOUR-ADMIN-AUTH-USER-UUID');
