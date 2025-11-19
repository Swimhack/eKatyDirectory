-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create users table (extends auth.users)
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  name text not null,
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  role text check (role in ('user', 'admin')) default 'user',
  avatar_url text
);

-- Create restaurants table
create table public.restaurants (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  address text not null,
  lat decimal not null,
  lng decimal not null,
  phone text,
  website text,
  categories text[] default '{}',
  hours jsonb,
  price_level integer check (price_level in (1, 2, 3, 4)) default 2,
  photos text[] default '{}',
  featured boolean default false,
  source text,
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  rating decimal,
  review_count integer default 0
);

-- Create reviews table
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references public.restaurants on delete cascade not null,
  user_id uuid references public.users on delete cascade not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  text text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create favorites table
create table public.favorites (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  restaurant_id uuid references public.restaurants on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, restaurant_id)
);

-- Create spins table
create table public.spins (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete set null,
  restaurant_id uuid references public.restaurants on delete cascade not null,
  spin_params jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better performance
create index restaurants_location_idx on public.restaurants (lat, lng);
create index restaurants_categories_idx on public.restaurants using gin (categories);
create index restaurants_featured_idx on public.restaurants (featured);
create index restaurants_rating_idx on public.restaurants (rating desc);
create index reviews_restaurant_idx on public.reviews (restaurant_id);
create index reviews_user_idx on public.reviews (user_id);
create index favorites_user_idx on public.favorites (user_id);
create index spins_created_at_idx on public.spins (created_at desc);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.restaurants enable row level security;
alter table public.reviews enable row level security;
alter table public.favorites enable row level security;
alter table public.spins enable row level security;

-- Create policies
-- Users can read their own data
create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

-- Restaurants are publicly readable
create policy "Anyone can view restaurants" on public.restaurants for select using (true);

-- Reviews are publicly readable, but only the author can create/update/delete
create policy "Anyone can view reviews" on public.reviews for select using (true);
create policy "Users can create reviews" on public.reviews for insert with check (auth.uid() = user_id);
create policy "Users can update own reviews" on public.reviews for update using (auth.uid() = user_id);
create policy "Users can delete own reviews" on public.reviews for delete using (auth.uid() = user_id);

-- Favorites are private to the user
create policy "Users can view own favorites" on public.favorites for select using (auth.uid() = user_id);
create policy "Users can create favorites" on public.favorites for insert with check (auth.uid() = user_id);
create policy "Users can delete own favorites" on public.favorites for delete using (auth.uid() = user_id);

-- Spins are publicly readable for analytics, but user-specific for logged-in users
create policy "Anyone can create spins" on public.spins for insert using (true);
create policy "Anyone can view spins" on public.spins for select using (true);

-- Function to automatically create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, name, email)
  values (new.id, new.raw_user_meta_data->>'name', new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create user profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update restaurant rating when reviews change
create or replace function update_restaurant_rating()
returns trigger as $$
begin
  update public.restaurants
  set 
    rating = (
      select avg(rating)
      from public.reviews
      where restaurant_id = coalesce(new.restaurant_id, old.restaurant_id)
    ),
    review_count = (
      select count(*)
      from public.reviews
      where restaurant_id = coalesce(new.restaurant_id, old.restaurant_id)
    )
  where id = coalesce(new.restaurant_id, old.restaurant_id);
  
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

-- Triggers to update restaurant ratings
create trigger update_restaurant_rating_on_insert
  after insert on public.reviews
  for each row execute procedure update_restaurant_rating();

create trigger update_restaurant_rating_on_update
  after update on public.reviews
  for each row execute procedure update_restaurant_rating();

create trigger update_restaurant_rating_on_delete
  after delete on public.reviews
  for each row execute procedure update_restaurant_rating();