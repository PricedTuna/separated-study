-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Create tables

create table documents (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table decks (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table cards (
  id uuid default gen_random_uuid() primary key,
  deck_id uuid references decks(id) on delete cascade not null,
  document_id uuid references documents(id) on delete set null,
  front text not null,
  back text not null,
  last_result text default 'unseen',
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS

alter table documents enable row level security;
create policy "Users own documents" on documents for all using (auth.uid() = user_id);

alter table decks enable row level security;
create policy "Users own decks" on decks for all using (auth.uid() = user_id);

alter table cards enable row level security;
create policy "Users own cards" on cards for all using (auth.uid() = user_id);

-- Triggers for auto-updating updated_at

create or replace function update_updated_at()
returns trigger as $$ begin new.updated_at = now(); return new; end; $$ language plpgsql;

create trigger update_documents_updated_at before update on documents for each row execute function update_updated_at();
create trigger update_decks_updated_at before update on decks for each row execute function update_updated_at();
create trigger update_cards_updated_at before update on cards for each row execute function update_updated_at();