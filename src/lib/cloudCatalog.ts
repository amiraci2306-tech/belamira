import type { Product, ProductImages } from "./catalog";
import { cloud } from "./cloud";
import { replaceCloudCatalog, setCloudSettings } from "./store";

type RecordRow = { [key: string]: unknown };
const emptyImages: ProductImages = { main: "", front: "", back: "", detail: "" };

export function rowToProduct(r: RecordRow): Product {
  return {
    id: String(r.id), slug: String(r.slug), name: String(r.name),
    brand: r.brand ? String(r.brand) : null,
    category: r.category as Product["category"],
    isNew: Boolean(r.is_new), size: String(r.size),
    condition: String(r.condition), price: Number(r.price_cents),
    color: String(r.color || "oklch(0.95 0.02 75)"),
    description: String(r.description),
    availability: r.availability as Product["availability"],
    images: { ...emptyImages, ...((r.images || {}) as object) },
    ...(r.fit_note ? { fitNote: String(r.fit_note) } : {}),
    ...(r.notice ? { notice: String(r.notice) } : {}),
  };
}
export function productToRow(p: Product, metrics?: {
  weightG?: number | null; lengthCm?: number | null; widthCm?: number | null; heightCm?: number | null
}) {
  return {
    id: p.id, slug: p.slug, name: p.name, brand: p.brand,
    category: p.category, is_new: p.isNew, size: p.size, condition: p.condition,
    price_cents: p.price, color: p.color, description: p.description,
    fit_note: p.fitNote || null, notice: p.notice || null,
    availability: p.availability, images: p.images,
    ...(metrics ? {
      weight_g: metrics.weightG || null, length_cm: metrics.lengthCm || null,
      width_cm: metrics.widthCm || null, height_cm: metrics.heightCm || null,
    } : {}),
  };
}
export async function refreshCatalog() {
  if (!cloud) return;
  const { data, error } = await cloud.from("products").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  replaceCloudCatalog((data || []).map(rowToProduct));
}
export async function refreshPublicSettings() {
  if (!cloud) return;
  const { data, error } = await cloud.from("store_settings").select("key,value")
    .in("key", ["instagram_url", "exchange_policy", "origin_cep"]);
  if (error) throw error;
  const settings = Object.fromEntries((data || []).map(x => [x.key, x.value]));
  setCloudSettings({
    instagramUrl: String(settings.instagram_url || ""),
    exchangePolicy: String(settings.exchange_policy || ""),
    originCep: String(settings.origin_cep || ""),
  });
}
export function startCloudSync() {
  if (!cloud) return () => {};
  void refreshCatalog().catch((e) => console.error("Erro ao atualizar catálogo", e));
  void refreshPublicSettings().catch((e) => console.error("Erro ao atualizar configurações", e));
  const channel = cloud.channel("belamira-catalogo")
    .on("postgres_changes", { event: "*", schema: "public", table: "products" },
      () => { void refreshCatalog().catch(console.error); })
    .subscribe();
  return () => { void cloud.removeChannel(channel); };
}
