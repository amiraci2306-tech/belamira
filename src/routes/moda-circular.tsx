import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout, PageTitle } from "@/components/site/Layout";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/moda-circular")({
  head: () => seo("Sobre moda circular | BelaMira", "Por que escolher peças de segunda mão: mais estilo, menos desperdício."),
  component: () => (
    <Layout>
      <PageTitle eyebrow="Sobre" title="Moda circular" />
      <div className="mx-auto max-w-2xl space-y-6 px-5 text-lg leading-relaxed">
        <p>Moda circular é dar uma nova vida a roupas que ainda têm muita história para contar. Em vez de descartar, a peça circula e encontra uma nova dona.</p>
        <p>Na BelaMira, cada peça é única: uma unidade, selecionada e descrita com transparência — tamanho, forma e condição.</p>
        <p>Comprar de segunda mão é um jeito leve de renovar o guarda-roupa, gastar menos e consumir com mais consciência.</p>
        <Link to="/catalogo" className="btn btn-primary">Explorar peças</Link>
      </div>
    </Layout>
  ),
});