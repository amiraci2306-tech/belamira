import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Layout, PageTitle } from "@/components/site/Layout";
import { cloud, isAdmin } from "@/lib/cloud";
import { useAuthUser } from "@/lib/useAuthUser";
import { formatBRL } from "@/lib/catalog";

export const Route = createFileRoute("/minha-conta")({ component: Account });
type MyOrder = { id: string; created_at: string; status: string; total_cents: number; order_items: Array<{ product_name: string; size: string }> };
type Address = { id: string; label: string; recipient: string; postal_code: string; street: string; number: string; complement: string | null; district: string; city: string; state: string };
const cleanAddress = { label: "Principal", recipient: "", postal_code: "", street: "", number: "", complement: "", district: "", city: "", state: "BA" };
function Account() {
  const { user, loading } = useAuthUser();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [address, setAddress] = useState(cleanAddress);
  const [admin, setAdmin] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!cloud || !user) return;
    let active = true;
    Promise.all([
      cloud.from("profiles").select("full_name,phone").eq("user_id",user.id).maybeSingle(),
      cloud.from("orders").select("id,created_at,status,total_cents,order_items(product_name,size)").eq("user_id",user.id).order("created_at",{ascending:false}),
      cloud.from("addresses").select("*").eq("user_id",user.id),
      isAdmin(user.id),
    ]).then(([profile, purchases, delivery, adminFlag]) => {
      if (!active) return;
      setName(profile.data?.full_name || user.user_metadata?.full_name || "");
      setPhone(profile.data?.phone || "");
      setOrders((purchases.data || []) as unknown as MyOrder[]);
      setAddresses((delivery.data || []) as Address[]);
      setAdmin(adminFlag);
    }).catch(e => { if (active) setMessage(e instanceof Error ? e.message : "Erro ao carregar dados."); });
    return () => { active = false; };
  }, [user]);
  async function saveProfile(e: FormEvent) {
    e.preventDefault(); if (!cloud || !user) return;
    const {error}=await cloud.from("profiles").upsert({user_id:user.id,full_name:name.trim(),phone:phone.trim()||null});
    setMessage(error ? error.message : "Dados atualizados.");
  }
  async function saveAddress(e: FormEvent) {
    e.preventDefault(); if (!cloud || !user) return;
    const a = { ...address, postal_code:address.postal_code.replace(/\D/g,""), user_id:user.id };
    if (a.postal_code.length !== 8) {setMessage("Informe CEP com 8 dígitos.");return;}
    const {data,error}=await cloud.from("addresses").insert(a).select().single();
    if (error) setMessage(error.message);
    else { setAddresses(v => [...v,data as Address]); setAddress(cleanAddress); setMessage("Endereço salvo."); }
  }
  async function removeAddress(id:string) {
    if(!cloud) return;
    const {error}=await cloud.from("addresses").delete().eq("id",id);
    if (error) setMessage(error.message); else setAddresses(xs=>xs.filter(a=>a.id!==id));
  }
  if(loading) return <Layout><p className="p-12 text-center">Carregando...</p></Layout>;
  if(!user) return <Layout><PageTitle title="Minha conta" eyebrow="BelaMira" /><p className="text-center"><Link to="/entrar" className="btn btn-primary">Entrar ou criar conta</Link></p></Layout>;
  return <Layout><PageTitle title="Minha conta" eyebrow="Bem-vinda à BelaMira" />
    <div className="mx-auto grid max-w-5xl gap-8 px-5 md:grid-cols-2">
      <section className="rounded-2xl bg-card p-6 shadow-soft">
        <h2 className="text-3xl">Meus dados</h2>
        <p className="mb-5 mt-2 text-sm text-muted-foreground">{user.email}</p>
        <form onSubmit={saveProfile} className="space-y-4">
          <label className="block text-sm">Nome<input className="field mt-1" value={name} required onChange={e=>setName(e.target.value)} /></label>
          <label className="block text-sm">Telefone (opcional)<input className="field mt-1" value={phone} onChange={e=>setPhone(e.target.value)} /></label>
          <button className="btn btn-primary">Salvar dados</button>
        </form>
        {admin && <p className="mt-5"><Link to="/admin" className="btn btn-outline">Painel da administradora</Link></p>}
        <button className="mt-6 text-sm underline" onClick={() => void cloud?.auth.signOut().then(()=>window.location.assign("/"))}>Sair da conta</button>
      </section>
      <section className="rounded-2xl bg-card p-6 shadow-soft">
        <h2 className="text-3xl">Meus endereços</h2>
        <div className="my-3 space-y-2">{addresses.map(a=><div key={a.id} className="rounded-xl border p-3 text-sm">{a.label}: {a.street}, {a.number}, {a.city}/{a.state} — CEP {a.postal_code} <button className="ml-2 underline" onClick={()=>void removeAddress(a.id)}>Excluir</button></div>)}</div>
        <form onSubmit={saveAddress} className="grid grid-cols-2 gap-3">
          {(["label","recipient","postal_code","street","number","complement","district","city","state"] as const).map(k=><label key={k} className={"text-xs "+(["street","recipient"].includes(k)?"col-span-2":"")}>{({label:"Identificação",recipient:"Destinatária",postal_code:"CEP",street:"Rua",number:"Número",complement:"Complemento",district:"Bairro",city:"Cidade",state:"UF"})[k]}
            <input className="field mt-1" maxLength={k==="state"?2:120} required={k!=="complement"} value={address[k]} onChange={e=>setAddress(s=>({...s,[k]:e.target.value}))} /></label>)}
          <button className="btn btn-outline col-span-2">Adicionar endereço</button>
        </form>
      </section>
      <section className="rounded-2xl bg-card p-6 shadow-soft md:col-span-2">
        <h2 className="text-3xl">Meus pedidos</h2>
        {orders.length===0 ? <p className="mt-4 text-muted-foreground">Nenhum pedido ainda.</p> : <div className="mt-4 space-y-3">{orders.map(o=><div key={o.id} className="flex flex-wrap justify-between gap-4 rounded-xl border p-4"><div><p className="text-sm font-medium">Pedido {o.id.slice(0,8)} · {new Date(o.created_at).toLocaleDateString("pt-BR")}</p><p className="text-xs">{o.order_items?.map(i=>i.product_name+" (tam. "+i.size+")").join(", ")}</p></div><div className="text-right text-sm"><p>{o.status.replaceAll("_"," ")}</p><p>{formatBRL(o.total_cents)}</p></div></div>)}</div>}
      </section>
    </div>
    {message && <p role="status" className="mx-auto mt-6 max-w-5xl rounded-lg bg-secondary p-4 text-sm">{message}</p>}
  </Layout>;
}
