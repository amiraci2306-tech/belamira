import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageTitle } from "@/components/site/Layout";
import { DirectCta } from "@/components/site/DirectCta";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/contato")({
  head: () => seo("Contato | BelaMira Moda Circular", "Fale com a BelaMira pelo Instagram Direct: pedidos, dúvidas e combinações."),
  component: () => (
    <Layout>
      <PageTitle eyebrow="Contato" title="Fale pelo Direct"><p>Pedidos e combinações exclusivamente pelo Instagram Direct. Entrega ou retirada a combinar.</p></PageTitle>
      <div className="mx-auto max-w-md px-5"><DirectCta label="Abrir Instagram Direct" /></div>
    </Layout>
  ),
});