// Arquitetura de pagamento preparada para PSP brasileiro (Mercado Pago ou Asaas).
// DESABILITADO: nenhuma cobrança real acontece. A integração real deve rodar no servidor
// (createServerFn), com credenciais guardadas como segredos — nunca no navegador.
export type PspProvider = "mercadopago" | "asaas";
export interface PaymentGateway {
  provider: PspProvider;
  createCharge(orderId: string, amountCents: number, method: "pix" | "cartao"): Promise<{ checkoutUrl: string }>;
}
export const PAYMENTS_ENABLED = false;
export function getGateway(): PaymentGateway | null {
  return null; // Ativar somente após a proprietária configurar a conta do PSP.
}