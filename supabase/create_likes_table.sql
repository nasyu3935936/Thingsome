-- Likes table for Thingsome
-- Run this SQL in your Supabase SQL editor or psql against the project's database.

create table if not exists public.likes (
  id bigint generated always as identity primary key,
  from_user_id uuid not null,
  to_user_id uuid not null,
  room_id bigint null,
  created_at timestamptz not null default now()
);

-- Prevent duplicate likes from same user to same target (optional)
create unique index if not exists likes_from_to_unique on public.likes (from_user_id, to_user_id);

-- Index for fast lookup of received likes
create index if not exists likes_to_user_idx on public.likes (to_user_id);
-- Add foreign key constraints if the referenced tables exist.
-- These blocks check for existing constraints and target tables before adding to avoid errors on repeated runs.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_likes_from_user'
  ) AND EXISTS (
    SELECT 1 FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'auth' AND c.relname = 'users'
  ) THEN
    ALTER TABLE public.likes
      ADD CONSTRAINT fk_likes_from_user FOREIGN KEY (from_user_id) REFERENCES auth.users (id) ON DELETE CASCADE;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_likes_to_user'
  ) AND EXISTS (
    SELECT 1 FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'auth' AND c.relname = 'users'
  ) THEN
    ALTER TABLE public.likes
      ADD CONSTRAINT fk_likes_to_user FOREIGN KEY (to_user_id) REFERENCES auth.users (id) ON DELETE CASCADE;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_likes_room'
  ) AND EXISTS (
    SELECT 1 FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'chat_rooms'
  ) THEN
    ALTER TABLE public.likes
      ADD CONSTRAINT fk_likes_room FOREIGN KEY (room_id) REFERENCES public.chat_rooms (id) ON DELETE SET NULL;
  END IF;
END$$;

-- Ensure an index on room_id for lookups
create index if not exists likes_room_idx on public.likes (room_id);
