import { cn } from "@/lib/utils";

// Placeholder editorial neutro: NÃO mostra roupa; apenas indica a foto pendente.
export function Photo({ src, alt, tone, label, className }: { src?: string | undefined; alt: string; tone?: string | undefined; label?: string | undefined; className?: string | undefined }) {
  if (src) return <img src={src} alt={alt} loading="lazy" className={cn("h-full w-full object-cover", className)} />;
  return (
    <div role="img" aria-label={`${alt} — foto em breve`} className={cn("relative flex h-full w-full items-center justify-center bg-secondary", className)}>
      {tone && <span aria-hidden className="absolute bottom-0 left-0 h-1.5 w-full" style={{ background: tone }} />}
      <div className="text-center">
        <p className="font-serif text-2xl italic text-muted-foreground">BelaMira</p>
        <p className="eyebrow mt-1 text-[0.55rem] text-muted-foreground">{label ?? "Foto em breve"}</p>
      </div>
    </div>
  );
}