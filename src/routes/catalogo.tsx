import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Layout, PageTitle } from "@/components/site/Layout";
import { ProductCard } from "@/components/site/ProductCard";
import { CATEGORIES, type CategorySlug } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { seo } from "@/lib/seo";

const search = z.object({ categoria: z.string().optional() });
export const Route = createFileRoute("/catalogo")({
  validateSearch: search,
  head: () => seo("Catálogo | BelaMira Moda Circular", "Todas as peças únicas da BelaMira: filtre por categoria, marca, tamanho e preço."),
  component: Catalog,
});

function Catalog() {
  const { categoria } = Route.useSearch();
  const navigate = Route.useNavigate();
  const products = useStore((s) => s.products);
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("");
  const [size, setSize] = useState("");
  const [max, setMax] = useState("");
  const [sort, setSort] = useState("recentes");
  const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))] as string[];
  const sizes = [...new Set(products.map((p) => p.size))];

  const list = useMemo(() => {
    let r = products.filter((p) =>
      (!categoria || (categoria === "novidades" ? p.isNew : p.category === categoria)) &&
      (!brand || p.brand === brand) && (!size || p.size === size) &&
      (!max || p.price <= Number(max) * 100) &&
      (!q || `${p.name} ${p.description} ${p.brand ?? ""}`.toLowerCase().includes(q.toLowerCase())));
    if (sort === "menor") r = [...r].sort((a, b) => a.price - b.price);
    if (sort === "maior") r = [...r].sort((a, b) => b.price - a.price);
    if (sort === "recentes") r = [...r].sort((a, b) => Number(b.id) - Number(a.id));
    return r;
  }, [products, categoria, brand, size, max, q, sort]);

  const setCat = (c?: CategorySlug) => navigate({ search: { categoria: c } });
  return (
    <Layout>
      <PageTitle eyebrow="Catálogo" title={CATEGORIES.find((c) => c.slug === categoria)?.name ?? "Todas as peças"} />
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Chip active={!categoria} onClick={() => setCat()}>Todas</Chip>
          {CATEGORIES.map((c) => <Chip key={c.slug} active={categoria === c.slug} onClick={() => setCat(c.slug)}>{c.name}</Chip>)}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
          <input aria-label="Buscar" placeholder="Buscar peça" className="field col-span-2 md:col-span-1" value={q} onChange={(e) => setQ(e.target.value)} />
          <select aria-label="Marca" className="field" value={brand} onChange={(e) => setBrand(e.target.value)}><option value="">Todas as marcas</option>{brands.map((b) => <option key={b}>{b}</option>)}</select>
          <select aria-label="Tamanho" className="field" value={size} onChange={(e) => setSize(e.target.value)}><option value="">Todos os tamanhos</option>{sizes.map((b) => <option key={b}>{b}</option>)}</select>
          <input aria-label="Preço máximo em reais" type="number" min={0} placeholder="Até R$" className="field" value={max} onChange={(e) => setMax(e.target.value)} />
          <select aria-label="Ordenar" className="field" value={sort} onChange={(e) => setSort(e.target.value)}><option value="recentes">Mais recentes</option><option value="menor">Menor preço</option><option value="maior">Maior preço</option></select>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">{list.length} peça(s)</p>
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-8 lg:grid-cols-4">
          {list.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
        {list.length === 0 && <p className="py-16 text-center text-muted-foreground">Nenhuma peça encontrada com esses filtros.</p>}
      </div>
    </Layout>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} aria-pressed={active} className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition ${active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-accent"}`}>{children}</button>;
}