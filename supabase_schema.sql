-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Users)
create table profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  phone text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for profiles
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Trigger for new user
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    'user'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- OTT APPS
create table ott_apps (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  logo_url text,
  active boolean default true,
  recommended boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- OTT PLANS
create table ott_plans (
  id uuid default uuid_generate_v4() primary key,
  app_id uuid references ott_apps(id) on delete cascade not null,
  name text not null, -- e.g. "Monthly", "Yearly"
  price numeric not null,
  details text, -- JSON or text description of benefits
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ORDERS
create table orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  plan_id uuid references ott_plans(id) not null,
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  payment_proof_url text,
  credentials text, -- Stores ID/Pass/Note
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PAYMENT SETTINGS (Single row config)
create table payment_config (
  id uuid default uuid_generate_v4() primary key,
  upi_id text,
  qr_code_url text,
  whatsapp_number text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS for Apps/Plans (Public Read, Admin Write)
alter table ott_apps enable row level security;
create policy "Public read apps" on ott_apps for select using (true);
create policy "Admin all apps" on ott_apps for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

alter table ott_plans enable row level security;
create policy "Public read plans" on ott_plans for select using (true);
create policy "Admin all plans" on ott_plans for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- RLS for Orders (User Read Own, Admin Read All, User Insert, Admin Update)
alter table orders enable row level security;
create policy "User view own orders" on orders for select using (auth.uid() = user_id);
create policy "Admin view all orders" on orders for select using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "User create order" on orders for insert with check (auth.uid() = user_id);
create policy "Admin update order" on orders for update using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admin delete order" on orders for delete using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- RLS for Payment Config (Public Read, Admin Write)
alter table payment_config enable row level security;
create policy "Public read config" on payment_config for select using (true);
create policy "Admin write config" on payment_config for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- SEED DATA (Optional)
insert into payment_config (upi_id, whatsapp_number) values ('admin@upi', '919876543210');
