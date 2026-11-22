import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageTitle } from "@/components/site/Layout";
import { RULES_INTRO, STORE_RULES } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/regras")({
  head: () => seo("Regras da loja | BelaMira Moda Circular", "Regrinhas da BelaMira para organizar as vendas de peças únicas, e seus direitos como consumidora."),
  component: Rules,
});

function Rules() {
  const policy = useStore((s) => s.settings.exchangePolicy);
  return (
    <Layout>
      <PageTitle eyebrow="Regrinhas" title="Regras da loja"><p>{RULES_INTRO}</p></PageTitle>
      <div className="mx-auto max-w-2xl space-y-12 px-5">
        <ol className="space-y-5">{STORE_RULES.map((r, i) => <li key={r} className="flex gap-5 border-b border-border pb-5"><span className="font-serif text-3xl text-accent">{i + 1}</span><p className="pt-2">{r}</p></li>)}</ol>
        <section><h2 className="text-3xl">Seus direitos</h2>
          <p className="mt-3 text-muted-foreground">Vendas online estão sujeitas ao direito de arrependimento previsto em lei (art. 49 do Código de Defesa do Consumidor). As regras internas da loja não eliminam os direitos garantidos pelo CDC. Trata-se de venda de roupas usadas, de segunda mão: a condição de cada peça é descrita com transparência.</p></section>
        <section><h2 className="text-3xl">Trocas e devoluções</h2>
          <p className="mt-3 text-muted-foreground">{policy || "Política de trocas e devoluções em validação. Em caso de dúvida, fale com a BelaMira pelo Instagram Direct."}</p></section>
      </div>
    </Layout>
  );
}