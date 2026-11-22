import { useSyncExternalStore } from "react";
import { SEED_PRODUCTS, type Product } from "./catalog";
import type { Order } from "./cart";

// O carrinho é um rascunho local. Produtos e pedidos REAIS ficam no Supabase.
// Sem backend configurado, nenhum pedido é lançado como venda confirmada.
export interface Settings { instagramUrl: string; exchangePolicy: string; originCep?: string }
interface State { products: Product[]; orders: Order[]; cart: string[]; settings: Settings; cloudLoaded: boolean }
const KEY = "belamira:cart:v2";
const initial: State = {
  products: SEED_PRODUCTS, orders: [], cart: [],
  settings: { instagramUrl: "", exchangePolicy: "", originCep: "" }, cloudLoaded: false,
};
let state: State = initial;
let hydrated = false;
const listeners = new Set<() => void>();
function emit() { listeners.forEach((listener) => listener()); }
function persist() {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(KEY, JSON.stringify({ cart: state.cart })); } catch {}
}
export function hydrateStore() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const obj = JSON.parse(localStorage.getItem(KEY) || "{}");
    if (Array.isArray(obj.cart)) state = { ...state, cart: obj.cart.filter((v: unknown) => typeof v === "string") };
  } catch {}
  emit();
}
export function setState(fn: (s: State) => State) {
  state = fn(state); persist(); emit();
}
export function getState() { return state; }
export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    (listener) => { listeners.add(listener); return () => listeners.delete(listener); },
    () => selector(state), () => selector(initial),
  );
}
export function replaceCloudCatalog(products: Product[]) {
  setState(s => ({ ...s, products, cloudLoaded: true,
    cart: s.cart.filter(id => products.some(p => p.id === id && p.availability === "disponivel")) }));
}
export function setCloudSettings(settings: Partial<Settings>) {
  setState(s => ({ ...s, settings: { ...s.settings, ...settings } }));
}
