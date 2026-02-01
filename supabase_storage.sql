-- Create storage bucket for payment proofs
insert into storage.buckets (id, name, public) 
values ('payment_proofs', 'payment_proofs', true)
on conflict (id) do nothing;

-- Storage Policies
create policy "Public Access Proofs" on storage.objects 
  for select using ( bucket_id = 'payment_proofs' );

create policy "Authenticated User Upload Proofs" on storage.objects 
  for insert with check ( bucket_id = 'payment_proofs' and auth.role() = 'authenticated' );

create policy "Admin Update Proofs" on storage.objects 
  for update using ( bucket_id = 'payment_proofs' and exists (select 1 from profiles where id = auth.uid() and role = 'admin') );

create policy "Admin Delete Proofs" on storage.objects 
  for delete using ( bucket_id = 'payment_proofs' and exists (select 1 from profiles where id = auth.uid() and role = 'admin') );
