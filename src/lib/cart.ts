import type { Product } from "./catalog";
export type OrderStatus = "AGUARDANDO_PAGAMENTO" | "PAGO" | "CANCELADO";
export interface OrderItem { productId: string; name: string; size: string; price: number }
export interface Order {
  id: string; createdAt: string; status: OrderStatus;
  customerName: string; paymentMethod: "pix"; items: OrderItem[]; total: number;
}
export function addToCart(cart: string[], product: Product): { cart: string[]; error?: string } {
  if (product.availability !== "disponivel") return { cart, error: "Esta peça não está disponível." };
  if (cart.includes(product.id)) return { cart, error: "Peça única: ela já está na sua sacola." };
  return { cart: [...cart, product.id] };
}
export function buildOrder(id: string, products: Product[], customerName: string, paymentMethod: "pix"): Order {
  const unique = products.filter((p, i, a) => a.findIndex((x) => x.id === p.id) === i);
  const items = unique.map((p) => ({ productId: p.id, name: p.name, size: p.size, price: p.price }));
  return { id, createdAt: new Date().toISOString(), status: "AGUARDANDO_PAGAMENTO",
    customerName, paymentMethod, items, total: items.reduce((s, i) => s + i.price, 0) };
}
export function orderMessage(o: { items: OrderItem[]; total: number; paymentMethod: string; customerName?: string; id?: string }, fmt: (n: number) => string) {
  return [
    "Olá, BelaMira! Gostaria de confirmar meu pedido:",
    ...(o.id ? ["Pedido: " + o.id] : []),
    ...o.items.map((i) => "• " + i.name + " (tam. " + i.size + ") — " + fmt(i.price)),
    "Subtotal das peças: " + fmt(o.total),
    "Pagamento: Pix, a confirmar pelo Direct.",
    "Entrega/retirada: conforme disponibilidade e frete.",
    ...(o.customerName ? ["Nome: " + o.customerName] : []),
  ].join("\n");
}
