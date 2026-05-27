-- Prevent users from setting has_paid on their own profile (payment is verified server-side).

create or replace function public.prevent_self_has_paid_update ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'authenticated'
    and new.has_paid is true
    and (old.has_paid is distinct from true) then
    raise exception 'has_paid can only be set after payment verification';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_has_paid_guard on public.profiles;

create trigger profiles_has_paid_guard
  before update on public.profiles
  for each row
  execute function public.prevent_self_has_paid_update ();
