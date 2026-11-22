import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageTitle } from "@/components/site/Layout";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/privacidade")({
  head: () => seo("Privacidade e termos | BelaMira Moda Circular", "Como a BelaMira trata seus dados (LGPD) e termos de uso do site."),
  component: () => (
    <Layout>
      <PageTitle eyebrow="Legal" title="Privacidade e termos"><p>Texto base, sujeito a validação pela proprietária.</p></PageTitle>
      <div className="mx-auto max-w-2xl space-y-8 px-5 text-muted-foreground">
        <section><h2 className="text-2xl text-foreground">Dados coletados</h2><p className="mt-2">No pedido pedimos apenas o nome. Endereço, contato e pagamento são tratados no atendimento pelo Instagram Direct, somente para concluir a compra.</p></section>
        <section><h2 className="text-2xl text-foreground">Seus direitos (LGPD)</h2><p className="mt-2">Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento pelo Direct.</p></section>
        <section><h2 className="text-2xl text-foreground">Termos</h2><p className="mt-2">As peças são usadas, de segunda mão e únicas. Preços em reais (R$). O registro do pedido não confirma pagamento nem disponibilidade, que são validados no atendimento. Os direitos do Código de Defesa do Consumidor são preservados.</p></section>
      </div>
    </Layout>
  ),
});