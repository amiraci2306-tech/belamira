import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/site/Layout";
import { Photo } from "@/components/site/Photo";
import { SEED_PRODUCTS, formatBRL, CATEGORIES } from "@/lib/catalog";
import { addToCart } from "@/lib/cart";
import { setState, getState, useStore } from "@/lib/store";

export const Route = createFileRoute("/produto/$slug")({
  head: ({ params }) => {
    const p = SEED_PRODUCTS.find((x) => x.slug === params.slug);
    const title = p ? `${p.name} — ${formatBRL(p.price)} | BelaMira` : "Peça | BelaMira Moda Circular";
    const d = p ? `${p.description} Tamanho ${p.size}. Peça única.` : "Peça única da BelaMira Moda Circular.";
    return { meta: [{ title }, { name: "description", content: d }, { property: "og:title", content: title }, { property: "og:description", content: d }, { property: "og:type", content: "product" }, { name: "twitter:card", content: "summary_large_image" }] };
  },
  component: ProductPage,
});

const SLOTS = [["main", "Principal"], ["front", "Frente"], ["back", "Costas"], ["detail", "Detalhes"]] as const;

function ProductPage() {
  const { slug } = Route.useParams();
  const products = useStore((s) => s.products);
  const cart = useStore((s) => s.cart);
  const p = products.find((x) => x.slug === slug);
  const [active, setActive] = useState<(typeof SLOTS)[number][0]>("main");
  const [msg, setMsg] = useState("");
  if (!p) return <Layout><p className="py-32 text-center">Peça não encontrada. <Link to="/catalogo" className="underline">Ver catálogo</Link></p></Layout>;
  const inCart = cart.includes(p.id);
  const add = () => {
    const r = addToCart(getState().cart, p);
    if (r.error) return setMsg(r.error);
    setState((s) => ({ ...s, cart: r.cart })); setMsg("Peça adicionada à sacola.");
  };
  return (
    <Layout>
      <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-8 md:grid-cols-2 md:pt-14">
        <div>
          <div className="aspect-[3/4] overflow-hidden rounded-[1.5rem]"><Photo src={p.images[active]} alt={`${p.name} — ${SLOTS.find((s) => s[0] === active)?.[1]}`} tone={p.color} label={SLOTS.find((s) => s[0] === active)?.[1]} /></div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {SLOTS.map(([k, l]) => (
              <button key={k} onClick={() => setActive(k)} aria-label={`Ver foto: ${l}`} className={`aspect-square overflow-hidden rounded-lg ring-offset-2 ring-offset-background ${active === k ? "ring-1 ring-accent" : ""}`}>
                <Photo src={p.images[k]} alt={l} label={l} />
              </button>
            ))}
          </div>
        </div>
        <div className="md:pt-6">
          <p className="eyebrow text-accent">{CATEGORIES.find((c) => c.slug === p.category)?.name} · {p.brand ?? "Sem marca informada"}</p>
          <h1 className="mt-3 text-4xl md:text-5xl">{p.name}</h1>
          <p className="mt-4 text-2xl">{formatBRL(p.price)}</p>
          <dl className="mt-8 grid grid-cols-2 gap-y-4 border-y border-border py-6 text-sm">
            <dt className="eyebrow text-[0.6rem] text-muted-foreground">Tamanho</dt><dd>{p.size}</dd>
            <dt className="eyebrow text-[0.6rem] text-muted-foreground">Condição</dt><dd>{p.condition}</dd>
            <dt className="eyebrow text-[0.6rem] text-muted-foreground">Disponibilidade</dt><dd className="capitalize">{p.availability === "disponivel" ? "Disponível" : p.availability}</dd>
          </dl>
          <p className="mt-6 leading-relaxed">{p.description}</p>
          {p.fitNote && <p className="mt-4 rounded-xl bg-secondary p-4 text-sm"><strong className="font-medium">Tamanho e forma: </strong>{p.fitNote}</p>}
          {p.notice && <p className="mt-4 rounded-xl border border-accent/40 p-4 text-sm text-accent">{p.notice}</p>}
          <p className="mt-4 text-sm text-muted-foreground">Peça única: existe apenas uma unidade. Roupa de segunda mão — a disponibilidade é confirmada no atendimento pelo Direct.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {inCart ? <Link to="/carrinho" className="btn btn-primary">Ver sacola</Link>
              : <button onClick={add} disabled={p.availability !== "disponivel"} className="btn btn-primary">Adicionar à sacola</button>}
            <Link to="/catalogo" className="btn btn-outline">Continuar vendo</Link>
          </div>
          {msg && <p role="status" className="mt-3 text-sm text-accent">{msg}</p>}
        </div>
      </div>
    </Layout>
  );
}