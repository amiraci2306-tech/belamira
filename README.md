# BelaMira Moda Circular — Loja

Repositório para atualização da loja no Lovable. Base original importada do projeto Lovable com 13 produtos, identidade visual, catálogo, sacola e regras.

## Funcionalidades incluídas

- Área da cliente (/entrar e /minha-conta): cadastro por e-mail, login, recuperação de senha, nome, telefone, endereços e histórico de pedidos.
- Painel da administradora (/admin): cadastro, edição e exclusão de produtos; marca, descrição, estado, tamanho, valor em reais, disponibilidade, fotos principal/frente/costas/detalhes, peso e dimensões.
- Importação controlada do catálogo inicial de 13 peças, somente quando o banco estiver vazio.
- Pedidos para retirada local com autenticação e reserva atômica de peças únicas, bloqueando uma segunda compra simultânea.
- Pagamento EXCLUSIVAMENTE PIX: não há cobrança automática. O pedido aguarda conferência real da entrada do dinheiro na conta; a administradora pode confirmar ou cancelar.
- Para envios fora de Nova Viçosa, solicitar cotação pelos Correios com CEP de destino. Sem integração contratada, o checkout de envio permanece bloqueado; não há preços fictícios.
- Atendimento exclusivamente pelo Instagram Direct. Condicional não é oferecida; direitos do consumidor preservados.

## Atenção: código ainda não é loja operacional

O repositório contém as telas, a lógica e o SQL, porém ainda é preciso ligar e configurar banco de dados seguro, autenticação, armazenamento de fotos e eventual cotação oficial dos Correios. O recebimento automático Pix não está conectado. Não divulgue a loja para compras reais antes de testar e configurar tudo.

## Configuração do banco no Lovable

1. Conecte um projeto Supabase ao Lovable. No SQL Editor do banco, execute uma vez o arquivo supabase/migrations/20261122_belamira_loja.sql.
2. Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no ambiente do projeto usando as credenciais públicas do Supabase. Use .env.example como modelo. Nunca envie chave service_role, senha ou token de pagamento ao GitHub.
3. Acesse /entrar, crie sua conta e confirme seu e-mail.
4. Em Supabase Authentication > Users, copie a UUID do seu usuário. No SQL Editor, atribua manualmente a função admin utilizando a instrução do final da migração SQL. Não há administrador fixo, nem senha padrão.
5. Acesse /admin e importe as 13 peças se o banco estiver vazio. Envie fotos aprovadas de cada peça, preencha dados e clique em Salvar produto.
6. Configure o link real do Instagram, CEP real de origem, política da loja e, se desejar, uma chave Pix somente na área protegida da administradora.
7. Teste cadastro de clientes, login, reset de senha, edição de fotos, acesso negado a usuário comum, atualização em outro navegador, pedido e confirmação manual de Pix.

## Logística

Nova Viçosa: opção de retirada local, combinada pelo Direct, sem frete postal.

Outras localidades: os Correios precisam fornecer uma cotação real usando CEP de origem e destino, peso e medidas da embalagem. A integração de cotação automática ainda exige credenciais e serviço legítimo; está pendente. O sistema não soma um frete inventado.

## Desenvolvimento

Projeto TanStack Start, React, TypeScript e Tailwind.
Instale Bun; execute bun install, bun run test, bun run build e bun run dev. O bun.lock veio da versão inicial e poderá ser atualizado com a nova dependência Supabase.

## Sincronização com Lovable

GitHub: https://github.com/amiraci2306-tech/belamira
Projeto Lovable inicial: https://lovable.dev/projects/3bf127d8-80a9-4569-b86e-d69d774eebc3

O repositório NÃO atualiza automaticamente o projeto Lovable anterior. No Lovable, use GitHub/integrações e verifique se é possível sincronizar este repositório com o projeto existente. Caso não seja possível, importe um projeto novo e migre/teste as configurações antes de trocar a loja publicada.

## Segurança

O repositório está público. Não salve senhas, CPFs das clientes, dados de cartão, chaves de servidor ou credenciais financeiras nele. O papel admin e as operações de estoque/pedido são protegidos por RLS e funções do Supabase. Confira as políticas antes de operar.
