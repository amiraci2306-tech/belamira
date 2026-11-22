-- BelaMira Moda Circular — estrutura segura para produção (Supabase).
-- Executar uma vez no SQL Editor do projeto Supabase conectado ao Lovable.
-- NÃO concede papel de administradora a qualquer cadastro automaticamente.
create extension if not exists pgcrypto;

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'customer')) default 'customer'
);
create or replace function public.is_admin(p_user_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select coalesce(exists(select 1 from public.user_roles
    where user_id = p_user_id and role = 'admin'), false);
$$;
revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to anon, authenticated;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  created_at timestamptz not null default now()
);
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Endereço principal',
  recipient text not null,
  postal_code text not null,
  street text not null,
  number text not null,
  complement text,
  district text not null,
  city text not null,
  state text not null,
  created_at timestamptz not null default now()
);
create or replace function public.on_user_created()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles(user_id) values(new.id) on conflict do nothing;
  insert into public.user_roles(user_id,role) values(new.id,'customer') on conflict do nothing;
  return new;
end;$$;
drop trigger if exists on_belamira_auth_user_created on auth.users;
create trigger on_belamira_auth_user_created after insert on auth.users
for each row execute function public.on_user_created();

create table if not exists public.products (
  id text primary key,
  slug text not null unique,
  name text not null,
  brand text,
  category text not null check(category in ('blusas','croppeds','vestidos','conjuntos','macaquinhos','shorts')),
  is_new boolean not null default true,
  size text not null,
  condition text not null,
  price_cents integer not null check(price_cents > 0),
  color text not null default 'oklch(0.95 0.02 75)',
  description text not null,
  fit_note text,
  notice text,
  availability text not null default 'disponivel'
    check(availability in ('disponivel','reservada','vendida')),
  images jsonb not null default '{"main":"","front":"","back":"","detail":""}'::jsonb
    check (jsonb_typeof(images) = 'object'),
  weight_g integer check(weight_g > 0),
  length_cm numeric(7,2) check(length_cm > 0),
  width_cm numeric(7,2) check(width_cm > 0),
  height_cm numeric(7,2) check(height_cm > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  customer_name text not null,
  status text not null default 'AGUARDANDO_PAGAMENTO'
    check(status in ('AGUARDANDO_PAGAMENTO','PAGO','CANCELADO')),
  payment_method text not null default 'pix' check(payment_method = 'pix'),
  shipping_mode text not null default 'retirada' check(shipping_mode in ('retirada','correios')),
  shipping_cents integer check(shipping_cents >= 0),
  subtotal_cents integer not null check(subtotal_cents >= 0),
  total_cents integer not null check(total_cents >= 0),
  shipping_postal_code text,
  payment_verified_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null references public.products(id) on delete restrict,
  product_name text not null,
  size text not null,
  price_cents integer not null check(price_cents >= 0),
  unique(order_id, product_id)
);
create table if not exists public.store_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);
create index if not exists idx_belamira_addresses_user on public.addresses(user_id);
create index if not exists idx_belamira_orders_user on public.orders(user_id,created_at desc);
create index if not exists idx_belamira_orderitems_order on public.order_items(order_id);

alter table public.user_roles enable row level security;
alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.store_settings enable row level security;

create policy "Role read own" on public.user_roles for select to authenticated
using (user_id = (select auth.uid()) or public.is_admin((select auth.uid())));
create policy "Profiles read own or admin" on public.profiles for select to authenticated
using (user_id = (select auth.uid()) or public.is_admin((select auth.uid())));
create policy "Profiles insert own" on public.profiles for insert to authenticated
with check (user_id = (select auth.uid()));
create policy "Profiles update own" on public.profiles for update to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "Addresses own read" on public.addresses for select to authenticated
using (user_id = (select auth.uid()) or public.is_admin((select auth.uid())));
create policy "Addresses own insert" on public.addresses for insert to authenticated
with check (user_id = (select auth.uid()));
create policy "Addresses own update" on public.addresses for update to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Addresses own delete" on public.addresses for delete to authenticated
using (user_id = (select auth.uid()));

create policy "Products public catalog" on public.products for select to anon, authenticated
using (is_active or public.is_admin((select auth.uid())));
create policy "Products admin insert" on public.products for insert to authenticated
with check(public.is_admin((select auth.uid())));
create policy "Products admin update" on public.products for update to authenticated
using(public.is_admin((select auth.uid()))) with check(public.is_admin((select auth.uid())));
create policy "Products admin delete" on public.products for delete to authenticated
using(public.is_admin((select auth.uid())));

create policy "Orders read owner or admin" on public.orders for select to authenticated
using(user_id = (select auth.uid()) or public.is_admin((select auth.uid())));
create policy "Orders admin update" on public.orders for update to authenticated
using(public.is_admin((select auth.uid()))) with check(public.is_admin((select auth.uid())));
create policy "Order items read owner or admin" on public.order_items for select to authenticated
using(exists(select 1 from public.orders o where o.id = order_id
  and (o.user_id = (select auth.uid()) or public.is_admin((select auth.uid())))));
create policy "Settings public except Pix" on public.store_settings for select to anon, authenticated
using(key <> 'pix_key' or public.is_admin((select auth.uid())));
create policy "Settings admin insert" on public.store_settings for insert to authenticated
with check(public.is_admin((select auth.uid())));
create policy "Settings admin update" on public.store_settings for update to authenticated
using(public.is_admin((select auth.uid()))) with check(public.is_admin((select auth.uid())));
create policy "Settings admin delete" on public.store_settings for delete to authenticated
using(public.is_admin((select auth.uid())));

-- Pedido com retirada presencial: banco calcula preços, bloqueia produtos e reserva.
-- O frete Correios ainda requer integração real: NÃO é aceito por esta função.
create or replace function public.create_pickup_order(
  p_product_ids text[], p_customer_name text
) returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_order uuid;
  v_id text;
  v_p public.products%rowtype;
  v_sum integer := 0;
begin
  if v_user is null then raise exception 'Faça login para comprar.'; end if;
  if length(trim(coalesce(p_customer_name,''))) < 2 then
    raise exception 'Informe o nome da cliente.';
  end if;
  if p_product_ids is null or array_length(p_product_ids,1) is null
     or array_length(p_product_ids,1) > 20 then
    raise exception 'Sacola vazia ou grande demais.';
  end if;
  if (select count(distinct x) from unnest(p_product_ids) as x)
       <> array_length(p_product_ids,1) then
    raise exception 'Peça repetida na sacola.';
  end if;
  insert into public.orders(user_id,customer_name,shipping_mode,
    shipping_cents,subtotal_cents,total_cents)
  values(v_user,trim(p_customer_name),'retirada',0,0,0)
  returning id into v_order;
  -- Locks em ordem estável reduzem deadlock em compras simultâneas.
  for v_id in select unnest(p_product_ids) order by 1 loop
    select * into v_p from public.products where id=v_id for update;
    if not found or v_p.availability <> 'disponivel' or not v_p.is_active then
      raise exception 'Peça indisponível. Atualize a sacola.';
    end if;
    insert into public.order_items(order_id,product_id,product_name,size,price_cents)
    values(v_order,v_p.id,v_p.name,v_p.size,v_p.price_cents);
    update public.products set availability='reservada',updated_at=now()
      where id=v_id;
    v_sum := v_sum + v_p.price_cents;
  end loop;
  update public.orders set subtotal_cents=v_sum,total_cents=v_sum where id=v_order;
  return v_order;
end;
$$;
revoke all on function public.create_pickup_order(text[],text) from public, anon;
grant execute on function public.create_pickup_order(text[],text) to authenticated;

create or replace function public.admin_set_order_status(p_order uuid,p_status text)
returns void language plpgsql security definer set search_path = ''
as $$
declare v_previous text;
begin
  if not public.is_admin(auth.uid()) then raise exception 'Acesso negado.'; end if;
  if p_status not in ('PAGO','CANCELADO') then raise exception 'Status inválido.'; end if;
  select status into v_previous from public.orders where id=p_order for update;
  if not found then raise exception 'Pedido não encontrado.'; end if;
  if v_previous = 'CANCELADO' then raise exception 'Pedido cancelado não pode ser confirmado.'; end if;
  if v_previous = 'PAGO' and p_status = 'CANCELADO' then
    raise exception 'Faça estorno e procedimento administrativo antes de cancelar um pedido pago.';
  end if;
  update public.orders set status=p_status,
    payment_verified_at = case when p_status='PAGO' then now() else null end
  where id=p_order;
  update public.products p set
    availability=case when p_status='PAGO' then 'vendida' else 'disponivel' end,
    updated_at=now()
  from public.order_items i where i.order_id=p_order and i.product_id=p.id;
end;
$$;
revoke all on function public.admin_set_order_status(uuid,text) from public, anon;
grant execute on function public.admin_set_order_status(uuid,text) to authenticated;

-- Armazenamento apenas de imagens públicas de catálogo.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('product-images','product-images',true,5242880,
  array['image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;
create policy "Belamira public product photos" on storage.objects
  for select to anon,authenticated using(bucket_id='product-images');
create policy "Belamira admin upload photos" on storage.objects
  for insert to authenticated with check(
    bucket_id='product-images' and public.is_admin((select auth.uid())));
create policy "Belamira admin update photos" on storage.objects
  for update to authenticated using(
    bucket_id='product-images' and public.is_admin((select auth.uid())))
  with check(bucket_id='product-images' and public.is_admin((select auth.uid())));
create policy "Belamira admin delete photos" on storage.objects
  for delete to authenticated using(
    bucket_id='product-images' and public.is_admin((select auth.uid())));

-- Configure manualmente a administradora APÓS criar a conta e verificar seu email.
-- Execute no SQL Editor substituindo pela UUID real (NÃO coloque ID no código):
-- insert into public.user_roles(user_id,role)
-- values('UUID-DA-ADMINISTRADORA','admin')
-- on conflict(user_id) do update set role='admin';

-- Para produtos em estoque, importar o catálogo de 13 peças via painel da admin.
-- Instrução de pagamento: configurar sua chave Pix SOMENTE no painel protegido.
