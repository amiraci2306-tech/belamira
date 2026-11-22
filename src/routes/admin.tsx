import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Layout, PageTitle } from "@/components/site/Layout";
import { Photo } from "@/components/site/Photo";
import { CATEGORIES, SEED_PRODUCTS, formatBRL, type Product, type ProductImages } from "@/lib/catalog";
import { cloud, isAdmin } from "@/lib/cloud";
import { productToRow, refreshCatalog } from "@/lib/cloudCatalog";
import { useAuthUser } from "@/lib/useAuthUser";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin")({ component: Admin });
type Tab = "produtos" | "pedidos" | "config";
type Slot = keyof ProductImages;
type AdminOrder = { id: string; created_at: string; customer_name: string; status: string;
  subtotal_cents: number; total_cents: number; shipping_mode: string;
  order_items: Array<{ product_name: string; size: string; price_cents: number }> };
const slots: Array<{ key: Slot; label: string }> = [
  { key: "main", label: "Principal" }, { key: "front", label: "Frente" },
  { key: "back", label: "Costas" }, { key: "detail", label: "Detalhes" },
];
const emptyImages: ProductImages = { main: "", front: "", back: "", detail: "" };
function freshProduct(): Product {
  return {
    id: crypto.randomUUID(), slug: "", name: "", brand: null, category: "blusas",
    isNew: true, size: "P", condition: "Usada — condição a descrever",
    price: 0, color: "oklch(0.95 0.02 75)", description: "",
    availability: "disponivel", images: { ...emptyImages },
  };
}
function slugify(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function moneyToCents(s: string) {
  const num = Number(s.replace(/[R$\s]/g, "").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(num) ? Math.round(num * 100) : 0;
}
type Metrics = { weightG: string; lengthCm: string; widthCm: string; heightCm: string };
const emptyMetrics: Metrics = { weightG: "", lengthCm: "", widthCm: "", heightCm: "" };

function Admin() {
  const { user, loading } = useAuthUser();
  const products = useStore(s => s.products);
  const cloudLoaded = useStore(s => s.cloudLoaded);
  const [allowed, setAllowed] = useState<boolean | undefined>(undefined);
  const [tab, setTab] = useState<Tab>("produtos");
  const [productSearch, setProductSearch] = useState("");
  const [productAvailability, setProductAvailability] = useState<"todas" | Product["availability"]>("todas");
  const [draft, setDraft] = useState<Product | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [metrics, setMetrics] = useState<Metrics>(emptyMetrics);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [settings, setSettings] = useState({ instagram_url: "", origin_cep: "", exchange_policy: "", pix_key: "" });

  useEffect(() => {
    if (!user || !cloud) { setAllowed(false); return; }
    let active = true;
    void isAdmin(user.id).then(async yes => {
      if (!active) return;
      setAllowed(yes);
      if (yes) {
        await refreshCatalog();
        await loadOrders();
        const { data, error } = await cloud!.from("store_settings").select("key,value");
        if (active && !error) {
          const next = Object.fromEntries((data || []).map(s => [s.key,s.value]));
          setSettings(s => ({ ...s, ...next }));
        }
      }
    }).catch(e => { if(active){setAllowed(false);setMessage(String(e));} });
    return () => { active = false; };
  }, [user]);

  async function loadOrders() {
    if (!cloud) return;
    const { data,error } = await cloud.from("orders")
      .select("id,created_at,customer_name,status,subtotal_cents,total_cents,shipping_mode,order_items(product_name,size,price_cents)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    setOrders((data || []) as unknown as AdminOrder[]);
  }

  function newPiece() {
    setDraft(freshProduct()); setPriceInput(""); setMetrics(emptyMetrics); setMessage("");
    setTab("produtos");
  }
  async function editPiece(p: Product) {
    setDraft({ ...p, images: { ...p.images } });
    setPriceInput((p.price / 100).toFixed(2).replace(".",","));
    setMetrics(emptyMetrics); setMessage("");
    if (cloud) {
      const { data } = await cloud.from("products")
        .select("weight_g,length_cm,width_cm,height_cm").eq("id",p.id).maybeSingle();
      if (data) setMetrics({
        weightG: String(data.weight_g || ""), lengthCm: String(data.length_cm || ""),
        widthCm: String(data.width_cm || ""), heightCm: String(data.height_cm || ""),
      });
    }
  }
  function change<K extends keyof Product>(key: K, value: Product[K]) {
    setDraft(d => d ? { ...d, [key]: value } : null);
  }
  async function uploadPhoto(e: ChangeEvent<HTMLInputElement>, slot: Slot) {
    const file = e.target.files?.[0];
    if (!cloud || !draft || !file) return;
    if (!["image/jpeg","image/png","image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setMessage("Foto inválida. Envie JPEG, PNG ou WebP com até 5 MB."); return;
    }
    setBusy(true); setMessage("");
    try {
      const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = "products/" + draft.id + "/" + slot + "-" + crypto.randomUUID() + "." + ext;
      const { error } = await cloud.storage.from("product-images").upload(path,file,{
        contentType: file.type, cacheControl: "3600", upsert: false,
      });
      if (error) throw error;
      const { data } = cloud.storage.from("product-images").getPublicUrl(path);
      change("images", { ...draft.images, [slot]: data.publicUrl });
      setMessage("Foto enviada. Clique em Salvar produto para publicar a alteração.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível enviar a foto."); }
    finally { setBusy(false); e.target.value = ""; }
  }
  async function saveProduct(e: FormEvent) {
    e.preventDefault(); if (!cloud || !draft) return;
    const price = moneyToCents(priceInput);
    if (price <= 0) { setMessage("Informe um preço válido em reais."); return; }
    if (!draft.name.trim() || !draft.size.trim() || !draft.description.trim()) {
      setMessage("Informe nome, tamanho e descrição."); return;
    }
    setBusy(true); setMessage("");
    try {
      const p: Product = {
        ...draft, price,
        slug: draft.slug || slugify(draft.name) + "-" + draft.id.slice(0,6),
        name: draft.name.trim(), size: draft.size.trim(),
      };
      const toMetric = (n:string) => {
        const v=Number(n.replace(",","."));
        return n && Number.isFinite(v) && v>0 ? v : null;
      };
      const {error}=await cloud.from("products").upsert(productToRow(p,{
        weightG: toMetric(metrics.weightG), lengthCm: toMetric(metrics.lengthCm),
        widthCm: toMetric(metrics.widthCm), heightCm: toMetric(metrics.heightCm),
      }),{onConflict:"id"});
      if(error) throw error;
      await refreshCatalog(); setDraft(null); setMessage("Produto salvo e publicado no catálogo.");
    } catch (err) {setMessage(err instanceof Error ? err.message : "Erro ao salvar.");}
    finally {setBusy(false);}
  }
  async function deleteProduct() {
    if (!cloud || !draft || !window.confirm("Excluir esta peça do catálogo? Pedidos antigos podem impedir exclusão. Para ocultar, marque como vendida.")) return;
    setBusy(true);
    const {error}=await cloud.from("products").delete().eq("id",draft.id);
    if(error) setMessage(error.message);
    else { setDraft(null);await refreshCatalog();setMessage("Produto excluído."); }
    setBusy(false);
  }
  async function importOriginal() {
    if (!cloud || !window.confirm("Importar as 13 peças originais? Faça isso somente se o banco estiver vazio.")) return;
    setBusy(true);
    const {data,error}=await cloud.from("products").select("id").limit(1);
    if(error) setMessage(error.message);
    else if(data?.length) setMessage("Importação bloqueada: já existem produtos no banco. Use Adicionar produto.");
    else {
      const {error:insertError}=await cloud.from("products").insert(SEED_PRODUCTS.map(p=>productToRow(p)));
      if(insertError) setMessage(insertError.message);
      else { await refreshCatalog();setMessage("13 peças importadas. Adicione as fotos de catálogo em cada produto."); }
    }
    setBusy(false);
  }
  async function updateOrder(id:string,status:"PAGO"|"CANCELADO") {
    if(!cloud || !window.confirm(status==="PAGO" ? "Você conferiu a entrada do Pix na sua conta?" : "Cancelar este pedido e devolver as peças ao estoque?"))return;
    setBusy(true);
    const {error}=await cloud.rpc("admin_set_order_status",{p_order:id,p_status:status});
    if(error)setMessage(error.message);
    else { await Promise.all([loadOrders(),refreshCatalog()]);setMessage("Pedido atualizado."); }
    setBusy(false);
  }
  async function saveSettings(e:FormEvent) {
    e.preventDefault();if(!cloud)return;
    const cep=settings.origin_cep.replace(/\D/g,"");
    if(cep.length!==0&&cep.length!==8){setMessage("O CEP de origem deve ter 8 dígitos.");return;}
    setBusy(true);
    const rows=Object.entries({...settings,origin_cep:cep}).map(([key,value])=>({key,value}));
    const {error}=await cloud.from("store_settings").upsert(rows,{onConflict:"key"});
    setMessage(error ? error.message : "Configurações salvas.");
    setBusy(false);
  }

  const normalizedSearch = productSearch.trim().toLocaleLowerCase("pt-BR");
  const visibleProducts = products.filter(p =>
    (productAvailability === "todas" || p.availability === productAvailability) &&
    (!normalizedSearch || [p.name, p.brand || "", p.size, p.category, p.description]
      .some(value => value.toLocaleLowerCase("pt-BR").includes(normalizedSearch)))
  );
  const productCounts = {
    disponivel: products.filter(p => p.availability === "disponivel").length,
    reservada: products.filter(p => p.availability === "reservada").length,
    vendida: products.filter(p => p.availability === "vendida").length,
  };
  if (loading || allowed===undefined && Boolean(user)) return <Layout><p className="p-12 text-center">Verificando acesso...</p></Layout>;
  if(!cloud) return <Layout><PageTitle eyebrow="Administração" title="Configuração necessária" /><p className="mx-auto max-w-xl px-5 text-center">O painel exige banco e login seguros. Configure o Supabase e execute a migração documentada no README do GitHub. Não há senha de administradora pré-definida.</p></Layout>;
  if(!user) return <Layout><PageTitle title="Área administrativa" /><p className="text-center"><Link to="/entrar" className="btn btn-primary">Entrar com minha conta</Link></p></Layout>;
  if(!allowed) return <Layout><PageTitle title="Acesso restrito" /><p className="mx-auto max-w-xl px-5 text-center">Sua conta está autenticada, mas não recebeu permissão de administradora. O proprietário do banco deve conceder o papel admin, conforme o README.</p></Layout>;
  return <Layout>
    <PageTitle eyebrow="Acesso exclusivo" title="Administração BelaMira"><p>Gerencie as peças, os pedidos e as informações da loja.</p></PageTitle>
    <div className="mx-auto max-w-6xl px-5">
      <nav className="mb-8 flex flex-wrap gap-2" aria-label="Administração">
        {(["produtos","pedidos","config"] as const).map(t=><button type="button" key={t}
          className={"btn " + (tab===t?"btn-primary":"btn-outline")}
          onClick={()=>{setTab(t);setDraft(null);setMessage("");}}>
          {t==="produtos"?"Produtos":t==="pedidos"?"Pedidos":"Configurações"}</button>)}
      </nav>
      {message && <p role="status" className="mb-6 rounded-xl bg-secondary p-4 text-sm">{message}</p>}
      {tab==="produtos" && <div>
        {!draft && <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p>{cloudLoaded?products.length+" peças cadastradas":"Carregando peças..."}</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn btn-outline" disabled={busy} onClick={()=>void importOriginal()}>Importar 13 peças iniciais</button>
              <button type="button" className="btn btn-primary" onClick={newPiece}>Adicionar produto</button>
            </div>
          </div>
          <div className="mb-6 grid gap-3 md:grid-cols-[1fr_220px]">
            <label className="text-sm">Buscar peças
              <input className="field mt-1" value={productSearch} onChange={e=>setProductSearch(e.target.value)}
                placeholder="Nome, marca, tamanho ou categoria" type="search" />
            </label>
            <label className="text-sm">Disponibilidade
              <select className="field mt-1" value={productAvailability}
                onChange={e=>setProductAvailability(e.target.value as typeof productAvailability)}>
                <option value="todas">Todas as peças</option>
                <option value="disponivel">Disponíveis ({productCounts.disponivel})</option>
                <option value="reservada">Reservadas ({productCounts.reservada})</option>
                <option value="vendida">Vendidas ({productCounts.vendida})</option>
              </select>
            </label>
          </div>
          <p className="mb-4 text-sm text-muted-foreground" role="status">
            Exibindo {visibleProducts.length} de {products.length} peças.
            {productCounts.disponivel} disponíveis, {productCounts.reservada} reservadas e {productCounts.vendida} vendidas.
          </p>
          {visibleProducts.length === 0 && <p className="rounded-xl bg-secondary p-4 text-sm">
            Nenhum produto corresponde aos filtros selecionados.
          </p>}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map(p=><article key={p.id} className="rounded-2xl bg-card p-4 shadow-soft">
              <div className="aspect-[4/3] overflow-hidden rounded-xl"><Photo src={p.images.main} alt={p.name} tone={p.color}/></div>
              <p className="mt-2 text-xs text-muted-foreground">
                {(["main","front","back","detail"] as const).filter(slot=>Boolean(p.images[slot])).length} de 4 fotos cadastradas
              </p>
              <h2 className="mt-3 text-2xl">{p.name}</h2>
              <p className="text-sm">Tam. {p.size} · {formatBRL(p.price)} · {p.availability}</p>
              <button type="button" className="btn btn-outline mt-3" onClick={()=>void editPiece(p)}>Editar peça e fotos</button>
            </article>)}
          </div>
        </>}
        {draft && <form onSubmit={saveProduct} className="rounded-3xl bg-card p-6 shadow-soft">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-3xl">{draft.slug?"Editar peça":"Novo produto"}</h2>
            <button type="button" className="text-sm underline" onClick={()=>setDraft(null)}>Voltar</button>
          </div>
          <h3 className="mb-3 text-2xl">Fotografias do produto</h3>
          <p className="mb-4 text-sm text-muted-foreground">Envie fotos reais da peça em estilo de catálogo: principal, frente, costas e detalhes. Até 5 MB por imagem. A foto só aparecerá na loja após salvar o produto.</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {slots.map(({key,label})=><div key={key} className="rounded-xl border border-border p-3">
              <div className="aspect-square overflow-hidden rounded-lg"><Photo src={draft.images[key]} alt={label} tone={draft.color} label={label} /></div>
              <label className="mt-3 block text-sm">{label}<input type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 w-full text-xs" disabled={busy} onChange={e=>void uploadPhoto(e,key)} /></label>
              {draft.images[key] && <button type="button" className="mt-2 text-xs underline" onClick={()=>change("images",{...draft.images,[key]:""})}>Remover do anúncio</button>}
            </div>)}
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <label className="text-sm">Nome da peça<input required className="field mt-1" maxLength={120} value={draft.name} onChange={e=>change("name",e.target.value)} /></label>
            <label className="text-sm">Marca (opcional)<input className="field mt-1" value={draft.brand||""} onChange={e=>change("brand",e.target.value||null)} /></label>
            <label className="text-sm">Valor em R$<input required inputMode="decimal" className="field mt-1" placeholder="15,90" value={priceInput} onChange={e=>setPriceInput(e.target.value)} /></label>
            <label className="text-sm">Tamanho da etiqueta<input required className="field mt-1" value={draft.size} onChange={e=>change("size",e.target.value)} /></label>
            <label className="text-sm">Categoria<select className="field mt-1" value={draft.category} onChange={e=>change("category",e.target.value as Product["category"])}>{CATEGORIES.filter(c=>c.slug!=="novidades").map(c=><option key={c.slug} value={c.slug}>{c.name}</option>)}</select></label>
            <label className="text-sm">Disponibilidade<select className="field mt-1" value={draft.availability} onChange={e=>change("availability",e.target.value as Product["availability"])}><option value="disponivel">Disponível</option><option value="reservada">Reservada</option><option value="vendida">Vendida</option></select></label>
            <label className="text-sm">Estado de conservação<input required className="field mt-1" value={draft.condition} onChange={e=>change("condition",e.target.value)} /></label>
            <label className="text-sm">Forma / observação de tamanho<input className="field mt-1" value={draft.fitNote||""} onChange={e=>change("fitNote",e.target.value)} /></label>
            <label className="text-sm md:col-span-2">Descrição detalhada<textarea required className="field mt-1 min-h-28" value={draft.description} onChange={e=>change("description",e.target.value)} /></label>
            <label className="text-sm md:col-span-2">Aviso sobre a peça (opcional)<textarea className="field mt-1 min-h-20" value={draft.notice||""} onChange={e=>change("notice",e.target.value)} /></label>
            <div className="md:col-span-2">
              <h3 className="mb-2 text-2xl">Dados para frete dos Correios</h3>
              <p className="mb-3 text-xs text-muted-foreground">Medidas reais da encomenda embalada. Sem esses dados e sem integração habilitada, não é possível calcular o frete automaticamente.</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {(["weightG","lengthCm","widthCm","heightCm"] as const).map(k=><label key={k} className="text-xs">{({weightG:"Peso (g)",lengthCm:"Comprimento (cm)",widthCm:"Largura (cm)",heightCm:"Altura (cm)"})[k]}<input inputMode="decimal" className="field mt-1" value={metrics[k]} onChange={e=>setMetrics(m=>({...m,[k]:e.target.value}))} /></label>)}
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="submit" disabled={busy} className="btn btn-primary">{busy?"Aguarde...":"Salvar produto"}</button>
            {draft.slug && <button type="button" disabled={busy} className="btn btn-outline" onClick={()=>void deleteProduct()}>Excluir produto</button>}
          </div>
        </form>}
      </div>}
      {tab==="pedidos" && <section className="space-y-4">
        <h2 className="text-3xl">Pedidos recebidos</h2>
        <p className="text-sm text-muted-foreground">Confirme um Pix SOMENTE depois de verificar a entrada do dinheiro na sua conta. O site não faz cobrança automática.</p>
        {orders.length===0 && <p>Nenhum pedido registrado no banco.</p>}
        {orders.map(o=><article key={o.id} className="rounded-2xl bg-card p-5 shadow-soft">
          <p className="text-sm">{o.customer_name} · {new Date(o.created_at).toLocaleDateString("pt-BR")}</p>
          <h3 className="text-2xl">{o.id.slice(0,8)} — {o.status.replaceAll("_"," ")}</h3>
          <p className="text-sm">{o.order_items.map(i=>i.product_name+" (tam. "+i.size+")").join(" · ")}</p>
          <p className="mt-2 font-medium">{formatBRL(o.total_cents)} · Pagamento Pix · {o.shipping_mode==="retirada"?"Retirada a combinar":"Correios"}</p>
          {o.status==="AGUARDANDO_PAGAMENTO" && <div className="mt-4 flex flex-wrap gap-2">
            <button disabled={busy} className="btn btn-primary" onClick={()=>void updateOrder(o.id,"PAGO")}>Confirmar Pix recebido</button>
            <button disabled={busy} className="btn btn-outline" onClick={()=>void updateOrder(o.id,"CANCELADO")}>Cancelar pedido</button>
          </div>}
        </article>)}
      </section>}
      {tab==="config" && <form onSubmit={saveSettings} className="mx-auto max-w-2xl space-y-5 rounded-2xl bg-card p-6 shadow-soft">
        <h2 className="text-3xl">Configurações da loja</h2>
        <label className="block text-sm">Link oficial do Instagram da loja<input type="url" className="field mt-1" placeholder="https://www.instagram.com/..." value={settings.instagram_url} onChange={e=>setSettings(s=>({...s,instagram_url:e.target.value}))} /></label>
        <label className="block text-sm">CEP de origem dos envios<input inputMode="numeric" className="field mt-1" placeholder="00000000" value={settings.origin_cep} onChange={e=>setSettings(s=>({...s,origin_cep:e.target.value}))} /></label>
        <label className="block text-sm">Política de troca / devolução<textarea className="field mt-1 min-h-24" value={settings.exchange_policy} onChange={e=>setSettings(s=>({...s,exchange_policy:e.target.value}))} /></label>
        <label className="block text-sm">Chave Pix (somente administradora)<input type="password" autoComplete="off" className="field mt-1" value={settings.pix_key} onChange={e=>setSettings(s=>({...s,pix_key:e.target.value}))} />
          <span className="mt-1 block text-xs text-muted-foreground">Não aparece para as clientes automaticamente. As instruções de pagamento são fornecidas pelo Direct até existir integração real.</span></label>
        <button disabled={busy} className="btn btn-primary">Salvar configurações</button>
      </form>}
    </div>
  </Layout>;
}
