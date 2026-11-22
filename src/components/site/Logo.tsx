import { Link } from "@tanstack/react-router";
export function Logo({ small }: { small?: boolean }) {
  return (
    <Link to="/" className="inline-flex flex-col items-center leading-none" aria-label="BelaMira Moda Circular — início">
      <span className={small ? "font-serif text-2xl" : "font-serif text-3xl md:text-4xl"}>BelaMira</span>
      <span className="eyebrow mt-1 text-[0.5rem] text-accent">Moda Circular</span>
    </Link>
  );
}