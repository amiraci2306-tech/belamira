import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Layout, PageTitle } from "@/components/site/Layout";
import { DirectCta } from "@/components/site/DirectCta";
import { formatBRL, STORE_RULES } from "@/lib/catalog";
import { PAYMENT_INSTRUCTIONS } from "@/lib/payments";
import { cloud } from "@/lib/cloud";
import { refreshCatalog } from "@/lib/cloudCatalog";
import { useAuthUser } from "@/lib/useAuthUser";
import { setState, useStore } from "@/lib/store";

export const Route = createFileRoute("/checkout")({ component: Checkout });
type Delivery = "retirada" | "correios";
function Checkout() {
  const { user, loading } = useAuthUser();
  const cart = useStore(s => s.cart);
  const products = useStore(s => s.products);
  const items = products.filter(p => cart.includes(p.id));
  const [name,setName] = useState("");
  const [delivery,setDelivery] = useState<Delivery>("retirada");
  const [cep,setCep] = useState("");
  const [agree,setAgree] = useState(false);
  const [orderId,setOrderId] = useState<string | null>(null);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState("");
  const total = items.reduce((sum,p)=>sum+p.price,0);
  const unavailable = items.some(p=>p.availability!=="disponivel");
  const freightPending = delivery==="correios";
  const validCep = cep.replace(/\D/g,"").length===8;
  const quoteMessage = [
    "Olá, BelaMira! Gostaria de uma cotação de frete REAL pelos Correios.",
    "CEP de destino: " + cep.replace(/\D/g,""),
    ...items.map(p=>"- "+p.name+" (tam. "+p.size+"): "+formatBRL(p.price)),
    "Subtotal das peças: " + formatBRL(total),
    "Aguardarei a consulta aos Correios e o valor final antes de confirmar o Pix.",
  ].join("\n");
  async function submit(e: FormEvent) {
    e.preventDefault();
    if(!cloud || !user) {setError("Entre na sua conta para registrar um pedido.");return;}
    if(freightPending) {setError("É preciso obter a cotação real dos Correios antes de fechar a compra.");return;}
    if(unavailable || items.length===0) {setError("Atualize sua sacola: há peças indisponíveis.");return;}
    setBusy(true);setError("");
    const {data,error:rpcError}=await cloud.rpc("create_pickup_order", {
      p_product_ids:items.map(p=>p.id),p_customer_name:name.trim(),
    });
    if(rpcError)setError(rpcError.message);
    else {
      setOrderId(String(data));
      setState(s=>({...s,cart:[]}));
      await refreshCatalog();
    }
    setBusy(false);
  }
  if(orderId) return <Layout>
    <PageTitle eyebrow={"Pedido "+orderId.slice(0,8)} title="Pedido registrado" />
    <div className="mx-auto max-w-xl space-y-5 px-5 text-center">
      <p className="rounded-2xl bg-secondary p-5">Seu pedido foi reservado no sistema para retirada em Nova Viçosa. <strong>Pagamento aguardando conferência.</strong> Nenhum Pix foi cobrado automaticamente.</p>
      <p>{PAYMENT_INSTRUCTIONS}</p>
      <p>Envie pelo Direct o número do pedido <strong>{orderId}</strong> e combine a retirada.</p>
      <DirectCta message={"Olá, BelaMira! Registrei o pedido "+orderId+" e gostaria de receber as instruções para pagamento via Pix e retirada."} />
      <Link to="/minha-conta" className="btn btn-outline">Acompanhar meus pedidos</Link>
    </div>
  </Layout>;
  return <Layout>
    <PageTitle eyebrow="Sua compra" title="Finalizar pedido" />
    {items.length===0 ? <p className="text-center">Sua sacola está vazia. <Link to="/catalogo" className="underline">Ver catálogo</Link></p> :
    <div className="mx-auto grid max-w-5xl gap-10 px-5 md:grid-cols-[1fr_360px]">
      <form onSubmit={submit} id="belamira-checkout" className="space-y-8">
        <section className="rounded-2xl bg-card p-5">
          <h2 className="mb-3 text-2xl">Identificação</h2>
          {loading ? <p>Verificando seu acesso...</p> :
            !cloud ? <p className="text-sm">O cadastro ainda não foi ativado. Para fazer um pedido, fale com a BelaMira pelo Direct.</p> :
            !user ? <p className="text-sm">Para registrar um pedido, <Link to="/entrar" className="underline">entre ou crie sua conta</Link>.</p> :
            <p className="mb-3 text-xs text-muted-foreground">Conectada como {user.email}</p>}
          <label className="block text-sm">Nome para o pedido<input required minLength={2} className="field mt-1" value={name} onChange={e=>setName(e.target.value)} /></label>
        </section>
        <section className="rounded-2xl bg-card p-5">
          <h2 className="mb-4 text-2xl">Entrega</h2>
          <label className="mb-3 flex items-start gap-3 rounded-xl border p-4 text-sm">
            <input type="radio" name="delivery" checked={delivery==="retirada"} onChange={()=>setDelivery("retirada")} />
            <span><strong>Retirar em Nova Viçosa</strong><span className="mt-1 block text-xs text-muted-foreground">Sem cobrança de frete dos Correios. Horário e ponto de retirada a combinar pelo Direct.</span></span>
          </label>
          <label className="flex items-start gap-3 rounded-xl border p-4 text-sm">
            <input type="radio" name="delivery" checked={delivery==="correios"} onChange={()=>setDelivery("correios")} />
            <span><strong>Enviar pelos Correios</strong><span className="mt-1 block text-xs text-muted-foreground">Para localidades fora de Nova Viçosa, o valor depende da cotação efetiva dos Correios.</span></span>
          </label>
          {freightPending && <div className="mt-4 rounded-xl border border-border p-4">
            <label className="block text-sm">CEP de destino<input required inputMode="numeric" maxLength={9} className="field mt-1" placeholder="00000-000" value={cep} onChange={e=>setCep(e.target.value)} /></label>
            <p className="mt-3 text-sm">Frete: <strong>a calcular pelos Correios</strong>. A conexão para cotação automática ainda depende de credenciais, CEP de origem e medidas reais da encomenda. Nenhum valor será estimado.</p>
            {validCep && <div className="mt-3"><DirectCta message={quoteMessage} label="Solicitar cotação pelo Direct" /></div>}
          </div>}
        </section>
        <section className="rounded-2xl bg-card p-5">
          <h2 className="mb-3 text-2xl">Pagamento</h2>
          <p className="rounded-lg border border-border p-4"><strong>Somente Pix</strong></p>
          <p className="mt-3 text-sm text-muted-foreground">{PAYMENT_INSTRUCTIONS}</p>
        </section>
        <section className="rounded-2xl bg-card p-5">
          <h2 className="mb-3 text-2xl">Regras da loja</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm">{STORE_RULES.map(x=><li key={x}>{x}</li>)}</ul>
          <p className="mt-3 text-xs">As regras não eliminam os direitos previstos no Código de Defesa do Consumidor. <Link className="underline" to="/regras">Ler as regras completas</Link>.</p>
          <label className="mt-4 flex gap-3 text-sm"><input type="checkbox" required checked={agree} onChange={e=>setAgree(e.target.checked)} />Li e concordo com as regras.</label>
        </section>
      </form>
      <aside className="h-fit rounded-2xl bg-card p-6 shadow-soft">
        <h2 className="text-3xl">Resumo</h2>
        <ul className="mt-4 space-y-3 text-sm">{items.map(p=><li key={p.id} className="flex justify-between gap-3"><span>{p.name} · Tam. {p.size}</span><span className="whitespace-nowrap">{formatBRL(p.price)}</span></li>)}</ul>
        <p className="mt-4 flex justify-between border-t pt-4"><span>Subtotal</span><strong>{formatBRL(total)}</strong></p>
        <p className="mt-2 flex justify-between text-sm"><span>Frete</span><strong>{freightPending?"A calcular":"Retirada"}</strong></p>
        {freightPending ? <p className="mt-4 text-sm">O valor final não pode ser calculado antes da cotação real. Solicite o frete acima e confirme sua compra pelo Direct.</p> :
        <p className="mt-4 text-sm">Valor das peças para retirada: {formatBRL(total)}. Pix após orientação no Direct.</p>}
        {error && <p role="alert" className="mt-4 rounded-xl bg-secondary p-3 text-sm">{error}</p>}
        {freightPending ? <p className="mt-5 text-xs text-muted-foreground">Checkout bloqueado até a cotação do frete. Não há cobrança automática.</p> :
        <button form="belamira-checkout" type="submit" disabled={!agree||!user||!cloud||busy||unavailable} className="btn btn-primary mt-6 w-full">{busy?"Registrando...":"Registrar pedido para Pix"}</button>}
      </aside>
    </div>}
  </Layout>;
}
