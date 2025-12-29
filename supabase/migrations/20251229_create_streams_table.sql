-- Create streams table
create table public.streams (
  id uuid not null default gen_random_uuid (),
  title text not null,
  stream_url text not null,
  platform text not null default 'youtube',
  thumbnail_url text null,
  is_live boolean not null default false,
  created_at timestamp with time zone not null default now(),
  constraint streams_pkey primary key (id)
);

-- RLS Policies
alter table public.streams enable row level security;

-- Everyone can view streams
create policy "Everyone can view streams"
  on public.streams for select
  using (true);

-- Only admins can insert/update/delete streams
create policy "Admins can manage streams"
  on public.streams for all
  to authenticated
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
    )
  );

-- Insert some dummy data for preview
insert into public.streams (title, stream_url, platform, is_live, thumbnail_url) values 
('My Team Championship Finals', 'https://youtube.com', 'youtube', true, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000'),
('Weekly Community Scrims', 'https://twitch.tv', 'twitch', false, 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1000'),
('Pro Player Interview', 'https://youtube.com', 'youtube', false, 'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?auto=format&fit=crop&q=80&w=1000');
