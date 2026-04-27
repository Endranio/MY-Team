create table if not exists public.contacts (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    phone text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.contacts enable row level security;

-- Policies
create policy "Public contacts are viewable by everyone"
on public.contacts for select
to public
using (true);

create policy "Admins can insert contacts"
on public.contacts for insert
to public
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update contacts"
on public.contacts for update
to public
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete contacts"
on public.contacts for delete
to public
using (public.has_role(auth.uid(), 'admin'));

-- Set up Realtime
alter publication supabase_realtime add table public.contacts;

-- Add updated_at trigger (uses existing function from initial migration)
create trigger update_contacts_updated_at
before update on public.contacts
for each row
execute function public.update_updated_at_column();
