import { Link } from "@tanstack/react-router";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Logo } from "./Logo";
import { useStore } from "@/lib/store";

const NAV = [
  { to: "/catalogo", label: "Peças" },
  { to: "/moda-circular", label: "Moda circular" },
  { to: "/regras", label: "Regras" },
  { to: "/contato", label: "Contato" },
] as const;

export function Layout({ children }: { children: ReactNode }) {
  const cart = useStore((s) => s.cart);
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-3 items-center px-5 py-4">
          <button className="justify-self-start md:hidden" aria-label="Abrir menu" onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
          <nav className="hidden gap-6 md:flex" aria-label="Principal">
            {NAV.slice(0, 2).map((n) => <Link key={n.to} to={n.to} className="eyebrow hover:text-accent" activeProps={{ className: "text-accent" }}>{n.label}</Link>)}
          </nav>
          <div className="justify-self-center"><Logo /></div>
          <div className="flex items-center gap-6 justify-self-end">
            <nav className="hidden gap-6 md:flex">{NAV.slice(2).map((n) => <Link key={n.to} to={n.to} className="eyebrow hover:text-accent" activeProps={{ className: "text-accent" }}>{n.label}</Link>)}</nav>
            <Link to="/carrinho" className="relative" aria-label={`Sacola, ${cart.length} itens`}>
              <ShoppingBag size={20} strokeWidth={1.4} />
              {cart.length > 0 && <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[0.6rem] text-accent-foreground">{cart.length}</span>}
            </Link>
          </div>
        </div>
        {open && (
          <nav className="flex flex-col gap-4 border-t border-border px-5 py-5 md:hidden">
            {NAV.map((n) => <Link key={n.to} to={n.to} className="eyebrow" onClick={() => setOpen(false)}>{n.label}</Link>)}
          </nav>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="mt-24 border-t border-border">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-3">
          <div><Logo small /><p className="mt-4 max-w-xs text-sm text-muted-foreground">Peças de segunda mão selecionadas com carinho. Cada uma é única.</p></div>
          <div className="flex flex-col gap-2 text-sm">
            <span className="eyebrow mb-2 text-accent">Loja</span>
            <Link to="/catalogo" className="hover:text-accent">Todas as peças</Link>
            <Link to="/regras" className="hover:text-accent">Regras e direitos</Link>
            <Link to="/moda-circular" className="hover:text-accent">Sobre moda circular</Link>
            <Link to="/contato" className="hover:text-accent">Contato pelo Direct</Link>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <span className="eyebrow mb-2 text-accent">Legal</span>
            <Link to="/privacidade" className="hover:text-accent">Privacidade e termos</Link>
            <p className="text-muted-foreground">Entrega ou retirada a combinar pelo Instagram Direct.</p>
          </div>
        </div>
        <p className="pb-8 text-center text-xs text-muted-foreground">© BelaMira Moda Circular</p>
      </footer>
    </div>
  );
}

export function PageTitle({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-5 pb-10 pt-14 text-center md:pt-20">
      {eyebrow && <p className="eyebrow text-accent">{eyebrow}</p>}
      <h1 className="mt-3 text-4xl md:text-5xl">{title}</h1>
      {children && <div className="mt-4 text-muted-foreground">{children}</div>}
    </div>
  );
}