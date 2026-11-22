// Único meio de pagamento previsto: Pix manual validado pela loja.
// Este módulo NÃO cria cobranças nem exibe comprovantes como confirmação.
export type PaymentMethod = "pix";
export const PAYMENTS_ENABLED = false;
export const PAYMENT_INSTRUCTIONS =
  "Pagamento somente via Pix. Solicite os dados da cobrança pelo Instagram Direct. O pedido só é confirmado como pago depois da conferência do recebimento pela BelaMira.";
