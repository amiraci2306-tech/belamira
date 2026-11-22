import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Layout, PageTitle } from "@/components/site/Layout";
import { DirectCta } from "@/components/site/DirectCta";
import { formatBRL, STORE_RULES } from "@/lib/catalog";
import { buildOrder, orderMessage, type Order } from "@/lib/cart";
import { PAYMENTS_ENABLED } from "@/lib/payments";
import { getState, newOrderId, setState, useStore } from "@/lib/store";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/checkout")({
  head: () => seo("Checkout | BelaMira Moda Circular", "Registre seu pedido e finalize o atendimento pelo Instagram Direct."),
  component: Checkout,
});

function Checkout() {
  const cart = useStore((s) => s.cart);
  const products = useStore((s) => s.products);
  const items = products.filter((p) => cart.includes(p.id));
  const [name, setName] = useState("");
  const [method, setMethod] = useState<"pix" | "cartao">("pix");
  const [agree, setAgree] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const s = getState();
    const chosen = s.products.filter((p) => s.cart.includes(p.id));
    if (chosen.some((p) => p.availability !== "disponivel")) return setError("Alguma peça não está mais disponível. Revise a sacola.");
    const o = buildOrder(newOrderId(), chosen, name.trim(), method);
    setState((st) => ({
      ...st, cart: [], orders: [o, ...st.orders],
      products: st.products.map((p) => (o.items.some((i) => i.productId === p.id) ? { ...p, availability: "reservada" as const } : p)),
    }));
    setOrder(o);
  };

  if (order) return (
    <Layout>
      <PageTitle eyebrow={`Pedido ${order.id}`} title="Pedido registrado">
        <p>Status: <strong className="text-accent">Aguardando pagamento</strong>. Pagamento confirmado após validação.</p>
      </PageTitle>
      <div className="mx-auto max-w-md px-5">
        <p className="mb-6 text-center text-sm text-muted-foreground">A disponibilidade e a forma de entrega/retirada são confirmadas no atendimento. Nenhuma cobrança foi feita por este site.</p>
        <DirectCta message={orderMessage(order, formatBRL)} />
      </div>
    </Layout>
  );

  const total = items.reduce((s, p) => s + p.price, 0);
  return (
    <Layout>
      <PageTitle eyebrow="Checkout" title="Finalizar pedido" />
      {items.length === 0 ? <p className="text-center">Sua sacola está vazia. <Link to="/catalogo" className="underline">Ver peças</Link></p> : (
        <form onSubmit={submit} className="mx-auto grid max-w-5xl gap-10 px-5 md:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            <fieldset>
              <legend className="eyebrow mb-3 text-accent">Seus dados</legend>
              <label className="text-sm">Nome (como aparece no Instagram)<input required maxLength={80} className="field mt-1" value={name} onChange={(e) => setName(e.target.value)} /></label>
              <p className="mt-2 text-xs text-muted-foreground">Pedimos só o essencial. Endereço e demais dados são combinados pelo Direct.</p>
            </fieldset>
            <fieldset>
              <legend className="eyebrow mb-3 text-accent">Pagamento previsto</legend>
              {([["pix", "Pix"], ["cartao", "Cartão de crédito"]] as const).map(([v, l]) => (
                <label key={v} className={`mb-2 flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${method === v ? "border-primary" : "border-border"}`}>
                  <input type="radio" name="pay" checked={method === v} onChange={() => setMethod(v)} /> {l}
                </label>
              ))}
              <p className="mt-2 rounded-xl bg-secondary p-4 text-sm">{PAYMENTS_ENABLED ? "" : "O pagamento online ainda não está ativo. As instruções de pagamento são enviadas pela BelaMira no Direct. Pagamento confirmado após validação."}</p>
            </fieldset>
            <fieldset className="rounded-2xl border border-border p-5">
              <legend className="eyebrow px-2 text-accent">Regrinhas da loja</legend>
              <ul className="list-disc space-y-1 pl-5 text-sm">{STORE_RULES.map((r) => <li key={r}>{r}</li>)}</ul>
              <p className="mt-3 text-xs text-muted-foreground">As regras internas não eliminam os direitos do Código de Defesa do Consumidor, incluindo o direito de arrependimento em compras fora do estabelecimento. <Link to="/regras" className="underline">Saiba mais</Link></p>
              <label className="mt-4 flex items-start gap-2 text-sm"><input type="checkbox" required checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1" /> Li as regrinhas e entendo que se trata de peças usadas/segunda mão.</label>
            </fieldset>
          </div>
          <aside className="h-fit rounded-2xl bg-card p-6 shadow-soft">
            <h2 className="text-2xl">Resumo</h2>
            <ul className="mt-4 space-y-2 text-sm">{items.map((p) => <li key={p.id} className="flex justify-between gap-2"><span>{p.name} · {p.size}</span><span>{formatBRL(p.price)}</span></li>)}</ul>
            <div className="mt-4 flex justify-between border-t border-border pt-4"><span>Total das peças</span><strong>{formatBRL(total)}</strong></div>
            <p className="mt-1 text-xs text-muted-foreground">Entrega/retirada a combinar pelo Direct.</p>
            {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
            <button type="submit" disabled={!agree} className="btn btn-primary mt-6 w-full">Registrar pedido</button>
          </aside>
        </form>
      )}
    </Layout>
  );
}