import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout, PageTitle } from "@/components/site/Layout";
import { Photo } from "@/components/site/Photo";
import { formatBRL } from "@/lib/catalog";
import { setState, useStore } from "@/lib/store";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/carrinho")({
  head: () => seo("Sacola | BelaMira Moda Circular", "Revise as peças únicas escolhidas antes de finalizar pelo Instagram Direct."),
  component: Cart,
});

function Cart() {
  const cart = useStore((s) => s.cart);
  const products = useStore((s) => s.products);
  const items = products.filter((p) => cart.includes(p.id));
  const total = items.reduce((s, p) => s + p.price, 0);
  const remove = (id: string) => setState((s) => ({ ...s, cart: s.cart.filter((x) => x !== id) }));
  return (
    <Layout>
      <PageTitle eyebrow="Sua sacola" title="Sacola" />
      <div className="mx-auto max-w-3xl px-5">
        {items.length === 0 ? (
          <div className="text-center"><p className="text-muted-foreground">Sua sacola está vazia.</p><Link to="/catalogo" className="btn btn-primary mt-6">Explorar peças</Link></div>
        ) : (
          <>
            <ul className="divide-y divide-border border-y border-border">
              {items.map((p) => (
                <li key={p.id} className="flex items-center gap-4 py-5">
                  <div className="h-24 w-20 shrink-0 overflow-hidden rounded-lg"><Photo src={p.images.main} alt={p.name} tone={p.color} label=" " /></div>
                  <div className="flex-1">
                    <p className="font-serif text-xl">{p.name}</p>
                    <p className="text-sm text-muted-foreground">Tam. {p.size} · Quantidade: 1 (peça única)</p>
                    {p.availability !== "disponivel" && <p className="text-sm text-destructive">Esta peça não está mais disponível.</p>}
                  </div>
                  <div className="text-right"><p>{formatBRL(p.price)}</p><button onClick={() => remove(p.id)} className="mt-1 text-xs underline hover:text-accent">Remover</button></div>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex justify-between text-lg"><span>Total das peças</span><span>{formatBRL(total)}</span></div>
            <p className="mt-2 text-sm text-muted-foreground">Entrega ou retirada: a combinar pelo Direct.</p>
            <Link to="/checkout" className="btn btn-primary mt-8 w-full">Ir para o checkout</Link>
          </>
        )}
      </div>
    </Layout>
  );
}