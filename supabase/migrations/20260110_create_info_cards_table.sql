-- Create info_cards table for landing page Features section
create table public.info_cards (
  id uuid not null default gen_random_uuid(),
  title text not null,
  description text,
  prize_image_url text,
  contact_email text,
  contact_whatsapp text,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint info_cards_pkey primary key (id)
);

-- RLS Policies
alter table public.info_cards enable row level security;

-- Everyone can view active info_cards
create policy "Everyone can view active info_cards"
  on public.info_cards for select
  using (is_active = true);

-- Only admins can manage info_cards
create policy "Admins can manage info_cards"
  on public.info_cards for all
  to authenticated
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
    )
  );

-- Insert sample data
insert into public.info_cards (title, description, prize_image_url, contact_email, contact_whatsapp, is_active, display_order) values 
('Info Turnamen', 'Bergabunglah dengan turnamen gaming terbesar kami! Kompetisi seru dengan hadiah menarik menanti Anda.', null, 'myteam@example.com', '6281234567890', true, 1);

