# BelaMira Moda Circular — Android e iPhone

Aplicativo Android independente que abre **a loja já publicada** em https://belamira-modacircular.lovable.app/. Não substitui nem sincroniza a base de código da loja: o catálogo, login, preços, pedidos e atualizações continuam dependendo do site remoto e da conexão com a internet.

## Android

O workflow GitHub Actions `Gerar aplicativo Android BelaMira` compila a pasta `mobile/android` com Gradle e disponibiliza o arquivo `app-debug.apk` no artefato `BelaMira-Moda-Circular-Android`. Após baixar o ZIP de artefatos do GitHub e extrair o APK, é possível instalá-lo manualmente no Android, autorizando apenas a instalação de aplicativos dessa origem se o sistema solicitar. Esta compilação é uma **versão de teste** assinada com chave de depuração; não é destinada à Play Store. Não compartilhe APKs alterados por terceiros.

O app usa Android WebView, permite seleção de imagens/arquivos, mantém login via cookies e abre links externos no aplicativo correspondente. A conexão HTTPS é obrigatória. Disponível para Android 7.0 ou superior.

## iPhone / iPad

O Android APK não funciona no iPhone. No **Safari**, abra https://belamira-modacircular.lovable.app/, toque em **Compartilhar** e em **Adicionar à Tela de Início**. Nas versões recentes do iOS, a opção **Abrir como App da Web** pode aparecer. Toque em **Adicionar**. Essa instalação pela tela inicial não é um arquivo IPA nem significa publicação na App Store.

A criação de um aplicativo iOS distribuível por arquivo IPA requer computador Mac com Xcode, configuração de assinatura Apple e método autorizado de distribuição (como TestFlight ou App Store). Não é seguro fornecer um perfil de configuração não assinado como substituto.

## Limitações

Este aplicativo carrega o endereço web publicado, e não possui catálogo offline. Compras, Pix, dados pessoais, segurança e regras de negócio são administrados no serviço web original. Testar login, upload, navegação e checkout em aparelho físico antes de distribuir comercialmente.
