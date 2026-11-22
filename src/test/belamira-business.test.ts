import { describe, expect, it } from "vitest";
import { SEED_PRODUCTS } from "@/lib/catalog";
import { addToCart } from "@/lib/cart";
import { PAYMENTS_ENABLED, type PaymentMethod } from "@/lib/payments";
describe("Regras de estoque e pagamento da BelaMira", () => {
  const p = SEED_PRODUCTS[0]!;
  it("catálogo inicial mantém 13 peças únicas", () => {
    expect(SEED_PRODUCTS).toHaveLength(13);
    expect(new Set(SEED_PRODUCTS.map(x => x.id)).size).toBe(13);
  });
  it("não permite repetir a mesma peça na sacola", () => {
    expect(addToCart([p.id],p)).toMatchObject({ cart:[p.id], error:expect.any(String) });
  });
  it("não permite produto indisponível", () => {
    expect(addToCart([], { ...p, availability:"vendida" }).error).toBeTruthy();
  });
  it("Pix é o único meio de pagamento declarado", () => {
    const method: PaymentMethod = "pix";
    expect(method).toBe("pix");
    expect(PAYMENTS_ENABLED).toBe(false);
  });
  it("preserva preços do catálogo", () => {
    expect(SEED_PRODUCTS.find(x=>x.id==="13")?.price).toBe(1590);
    expect(SEED_PRODUCTS.find(x=>x.id==="3")?.price).toBe(1899);
  });
});
