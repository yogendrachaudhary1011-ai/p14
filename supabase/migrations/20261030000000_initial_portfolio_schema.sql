-- Supabase schema for the portfolio CMS.
-- All data access stays on the server and uses SUPABASE_SECRET_KEY.
create table if not exists public.app_documents (
  collection_name text not null,
  id text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (collection_name, id),
  constraint app_documents_collection_name_check check (
    collection_name in (
      'site_settings', 'pages', 'projects', 'experience', 'education',
      'navigation', 'social_links', 'admin_users', 'sessions', 'media',
      'backups', 'system_metadata'
    )
  )
);

create index if not exists app_documents_collection_order_idx
  on public.app_documents (collection_name, ((data ->> 'order')));
create index if not exists app_documents_collection_created_idx
  on public.app_documents (collection_name, ((data ->> 'createdAt')));
create index if not exists app_documents_data_gin_idx
  on public.app_documents using gin (data jsonb_path_ops);

alter table public.app_documents enable row level security;
revoke all on public.app_documents from anon, authenticated;
grant select, insert, update, delete on public.app_documents to service_role;

create or replace function public.cms_apply_document_batch(p_operations jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  operation jsonb;
  collection_name text;
  document_id text;
  action text;
  document_data jsonb;
  affected_rows integer;
begin
  if jsonb_typeof(p_operations) <> 'array' then
    raise exception 'p_operations must be a JSON array';
  end if;

  for operation in select value from jsonb_array_elements(p_operations) as item(value)
  loop
    collection_name := operation ->> 'collection';
    document_id := operation ->> 'id';
    action := operation ->> 'op';
    document_data := coalesce(operation -> 'data', '{}'::jsonb);

    if collection_name not in (
      'site_settings', 'pages', 'projects', 'experience', 'education',
      'navigation', 'social_links', 'admin_users', 'sessions', 'media',
      'backups', 'system_metadata'
    ) or document_id is null then
      raise exception 'Unsupported document collection or missing document id';
    end if;

    if action = 'set' then
      insert into public.app_documents (collection_name, id, data, updated_at)
      values (collection_name, document_id, document_data, now())
      on conflict (collection_name, id) do update
        set data = case
          when coalesce((operation ->> 'merge')::boolean, false)
            then public.app_documents.data || excluded.data
          else excluded.data
        end,
        updated_at = now();
    elsif action = 'update' then
      update public.app_documents
        set data = data || document_data,
            updated_at = now()
        where public.app_documents.collection_name = collection_name
          and public.app_documents.id = document_id;
      get diagnostics affected_rows = row_count;
      if affected_rows = 0 then
        raise exception 'Document not found: %/%', collection_name, document_id;
      end if;
    elsif action = 'delete' then
      delete from public.app_documents
        where public.app_documents.collection_name = collection_name
          and public.app_documents.id = document_id;
    else
      raise exception 'Unsupported document batch operation';
    end if;
  end loop;
end;
$$;

revoke all on function public.cms_apply_document_batch(jsonb) from public, anon, authenticated;
grant execute on function public.cms_apply_document_batch(jsonb) to service_role;

-- The bucket holds public portfolio media. Uploads and deletes still require the server secret key.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-media',
  'portfolio-media',
  true,
  4194304,
  array['image/jpeg','image/jpg','image/png','image/webp','image/gif','image/svg+xml','application/pdf','video/mp4','video/webm']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
