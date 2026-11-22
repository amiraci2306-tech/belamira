// Serviço de dados local (MVP). Mesma interface poderá ser trocada por backend
// (tabelas products, categories, orders, order_items, product_images, settings).
import { useSyncExternalStore } from "react";
import { SEED_PRODUCTS, type Product } from "./catalog";
import type { Order } from "./cart";

export interface Settings { instagramUrl: string; exchangePolicy: string }
interface State { products: Product[]; orders: Order[]; cart: string[]; settings: Settings }

const KEY = "belamira:v1";
const initial: State = { products: SEED_PRODUCTS, orders: [], cart: [], settings: { instagramUrl: "", exchangePolicy: "" } };
let state: State = initial;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() { listeners.forEach((l) => l()); }
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* armazenamento cheio */ }
}
export function hydrateStore() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...initial, ...JSON.parse(raw) };
  } catch { /* ignora */ }
  emit();
}
export function setState(fn: (s: State) => State) { state = fn(state); persist(); emit(); }
export function getState() { return state; }

export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => sel(state),
    () => sel(initial),
  );
}
export function newOrderId() {
  return "BM-" + Date.now().toString(36).toUpperCase().slice(-6);
}