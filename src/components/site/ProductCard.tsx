import { Link } from "@tanstack/react-router";
import { Photo } from "./Photo";
import { formatBRL, type Product } from "@/lib/catalog";

export function ProductCard({ product }: { product: Product }) {
  const sold = product.availability !== "disponivel";
  return (
    <Link to="/produto/$slug" params={{ slug: product.slug }} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
        <Photo src={product.images.main} alt={product.name} tone={product.color} className="transition-transform duration-700 group-hover:scale-[1.03]" />
        {sold && <span className="eyebrow absolute left-3 top-3 rounded-full bg-background px-3 py-1 text-[0.55rem]">{product.availability === "vendida" ? "Vendida" : "Reservada"}</span>}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {(["front", "back"] as const).map((k) => (
          <div key={k} className="aspect-square overflow-hidden rounded-lg">
            <Photo src={product.images[k]} alt={`${product.name} — ${k === "front" ? "frente" : "costas"}`} label={k === "front" ? "Frente" : "Costas"} />
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-[0.55rem] text-muted-foreground">{product.brand ?? "Peça única"} · Tam. {product.size}</p>
          <h3 className="mt-1 font-serif text-xl leading-tight group-hover:text-accent">{product.name}</h3>
        </div>
        <p className="whitespace-nowrap text-sm">{formatBRL(product.price)}</p>
      </div>
    </Link>
  );
}