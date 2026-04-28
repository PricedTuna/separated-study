-- Nueva tabla folders con anidación
create table folders (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  parent_id uuid references folders(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Agregar folder_id a documents
alter table documents add column folder_id uuid references folders(id) on delete set null;

-- RLS para folders
alter table folders enable row level security;
create policy "Users own folders" on folders for all using (auth.uid() = user_id);

-- Trigger para actualizar updated_at en folders
create or replace function update_updated_at()
returns trigger as $$ begin new.updated_at = now(); return new; end; $$ language plpgsql;

create trigger update_folders_updated_at before update on folders for each row execute function update_updated_at();