-- Record payments made before an account exists (matched by email on signup).

create table public.payment_grants (
  email text primary key,
  stripe_session_id text not null,
  created_at timestamptz not null default now()
);

alter table public.payment_grants enable row level security;

create or replace function public.handle_new_user ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text;
begin
  normalized_email := lower(trim(new.email));

  insert into public.profiles (id, email)
  values (new.id, new.email);

  if exists (
    select 1 from public.payment_grants where email = normalized_email
  ) then
    update public.profiles
    set has_paid = true
    where id = new.id;

    delete from public.payment_grants where email = normalized_email;
  end if;

  return new;
end;
$$;
