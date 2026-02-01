-- Reviews table
create table reviews (
  id uuid default uuid_generate_v4() primary key,
  user_name text not null,
  content text not null,
  rating integer default 5 check (rating >= 1 and rating <= 5),
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table reviews enable row level security;
create policy "Public read reviews" on reviews for select using (true);
create policy "Admin all reviews" on reviews for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
