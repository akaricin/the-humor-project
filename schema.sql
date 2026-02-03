create table public.images (
  id uuid not null default gen_random_uuid (),
  created_datetime_utc timestamp with time zone not null default now(),
  modified_datetime_utc timestamp with time zone null,
  url character varying null,
  is_common_use boolean null default false,
  profile_id uuid null default auth.uid (),
  additional_context character varying null,
  is_public boolean null default false,
  image_description text null,
  celebrity_recognition text null,
  embedding public.vector null,
  constraint images_pkey primary key (id),
  constraint images_profile_id_fkey foreign KEY (profile_id) references profiles (id) on delete set null
) TABLESPACE pg_default;

create index IF not exists idx_images_is_common_use on public.images using btree (is_common_use) TABLESPACE pg_default
where
  (is_common_use = true);

create index IF not exists idx_images_is_public on public.images using btree (is_public) TABLESPACE pg_default
where
  (is_public = true);

create index IF not exists idx_images_profile_id on public.images using btree (profile_id) TABLESPACE pg_default;