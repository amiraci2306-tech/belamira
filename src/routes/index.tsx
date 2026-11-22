import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { ProductCard } from "@/components/site/ProductCard";
import { Photo } from "@/components/site/Photo";
import { CATEGORIES } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => seo("BelaMira Moda Circular | Peças únicas de segunda mão", "Seu próximo look favorito está aqui. Blusas, croppeds, vestidos e conjuntos de segunda mão — cada peça é única."),
  component: Home,
});

function Home() {
  const products = useStore((s) => s.products);
  const heroImg = products.find((p) => p.images.main)?.images.main;
  const shelf = products.filter((p) => p.availability === "disponivel").slice(0, 6);
  return (
    <Layout>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pt-10 md:grid-cols-[1.1fr_1fr] md:pt-16">
        <div className="order-2 md:order-1">
          <p className="eyebrow text-accent">Moda circular · Peças únicas</p>
          <h1 className="mt-5 text-5xl leading-[1.02] md:text-7xl">Seu próximo look <em className="text-accent">favorito</em> está aqui</h1>
          <p className="mt-6 max-w-md text-muted-foreground">Roupas de segunda mão escolhidas a dedo, com condição descrita de forma transparente. Uma unidade de cada.</p>
          <Link to="/catalogo" className="btn btn-primary mt-8">Explorar peças</Link>
        </div>
        <div className="order-1 aspect-[4/5] overflow-hidden rounded-[2rem] shadow-soft md:order-2">
          <Photo src={heroImg} alt="Editorial BelaMira" label="Editorial em breve" />
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-5" aria-labelledby="cat">
        <h2 id="cat" className="eyebrow text-center text-muted-foreground">Categorias</h2>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} to="/catalogo" search={{ categoria: c.slug }} className="rounded-full border border-border px-5 py-2 font-serif text-lg transition hover:border-accent hover:text-accent">{c.name}</Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-5">
        <div className="flex items-end justify-between">
          <h2 className="text-4xl">Vitrine</h2>
          <Link to="/catalogo" className="eyebrow hover:text-accent">Ver todas</Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-8">
          {shelf.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-3xl px-5 text-center">
        <p className="eyebrow text-accent">Como comprar</p>
        <p className="mt-4 font-serif text-2xl md:text-3xl">Escolha sua peça, monte a sacola e finalize o atendimento pelo Instagram Direct. Pagamento confirmado após validação.</p>
        <Link to="/regras" className="btn btn-outline mt-8">Ler as regrinhas</Link>
      </section>
    </Layout>
  );
}