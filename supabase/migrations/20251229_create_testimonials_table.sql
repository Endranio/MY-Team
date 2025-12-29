-- Create testimonials table
create table public.testimonials (
  id uuid not null default gen_random_uuid (),
  author_name text not null,
  author_role text not null,
  content text not null,
  rating integer not null default 5 check (rating >= 1 and rating <= 5),
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  constraint testimonials_pkey primary key (id)
);

-- RLS Policies
alter table public.testimonials enable row level security;

-- Everyone can view active testimonials
create policy "Everyone can view active testimonials"
  on public.testimonials for select
  using (is_active = true);

-- Only admins can manage testimonials
create policy "Admins can manage testimonials"
  on public.testimonials for all
  to authenticated
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
    )
  );

-- Insert some sample data
insert into public.testimonials (author_name, author_role, content, rating, is_active) values 
('Sarah Martinez', 'Pro Gamer', 'Komunitas gaming terbaik yang pernah saya ikuti! Acara-acaranya luar biasa dan saya membuat banyak teman di sini.', 5, true),
('Alex Chen', 'Esports Player', 'Turnamen-turnamennya terorganisir dengan baik dan hadiah-hadiahnya luar biasa. MY Team membantu saya meningkatkan skill secara signifikan!', 5, true),
('David Thompson', 'Casual Gamer', 'Platform yang menakjubkan dengan komunitas yang mendukung. Tim dukungan 24/7 selalu membantu dan responsif!', 5, true);
