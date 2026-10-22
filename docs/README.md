# Documentação do Locvia

Este diretório reúne as **decisões de produto, marca, experiência e implementação** adotadas no projeto Locvia até **22/10/2026**. Serve como referência para desenvolver a plataforma definitiva sem confundir funcionalidades da demonstração com funcionalidades operacionais.

## Índice

| Documento | O que contém |
| --- | --- |
| [Arquitetura-alvo — API PHP](./arquitetura-api-php.md) | Domínios, endpoints, autenticação, transações, WebSockets e workers assíncronos |
| [Orçamentos: emissão e integração](./orcamentos.md) | Formulário, cálculo em centavos, visualização, PDF A4 pelo navegador e contratos de API futuros |
| [Financeiro, Conta e Contatos](./financeiro-conta-contatos.md) | Modelo de caixa, privacidade, conta, assinatura e canais configuráveis |
| [Responsividade da demo](./responsividade.md) | Largura automática e validação das sete telas em desktop, tablet e mobile |
| [Identidade visual](./identidade-visual.md) | Wordmark oficial `locvia.`, cores, tipografia, favicon e regras de aplicação |
| [Visão do produto](./visao-do-produto.md) | Público-alvo, problema que o Locvia resolve, posicionamento e escopo |
| [Experiência e regras de aluguel](./experiencia-e-regras.md) | Navegação, ações diárias, disponibilidade, cadastros e estados dos aluguéis |
| [Demonstração e implementação](./demonstracao-e-implementacao.md) | Arquivos, implantação, comportamento da demo, personalização e limitações |
| [Checklist de homologação](./checklist-de-homologacao.md) | Validações manuais recomendadas em desktop e mobile |

## Decisões técnicas para o SaaS

- **API operacional em PHP**, rotas públicas HTTPS autenticadas, REST/JSON versionado e regras de negócio sempre validadas no backend.
- **Interface em HTML, CSS e JavaScript puros** consumindo a API, com WebSockets (WSS) e workers PHP assíncronos **quando houver necessidade real**.
- **Financeiro da locadora separado do faturamento da assinatura do Locvia**; no protótipo ambos são demonstrativos e não há pagamentos externos.
- Contatos de suporte futuros gerenciados na plataforma; WhatsApp/Telegram/telefone só aparecem ativos na demo quando há destino válido configurado.

## Princípios estabelecidos

1. **Ferramenta de bolso:** a interface deve ajudar a resolver tarefas, não obrigar o empreendedor a operar um ERP complexo.
2. **Linguagem simples:** preferir **alugar**, **aluguel**, **itens**, **separar**, **retirada** e **devolução** nas ações visíveis.
3. **Atenção à disponibilidade:** o usuário precisa saber **o que tem disponível**, **quem está com seus itens** e **o que fazer hoje**.
4. **Abrangência:** começar pelas necessidades de pequenos negócios de festas/eventos, preservando aplicação a livros, equipamentos, ferramentas e veículos.
5. **Marca institucional estável:** `locvia.` em negrito, texto grafite e **ponto índigo #455CD4**. A cor configurável da locadora modifica a UI, **não o ponto do logo institucional**.
6. **Desenvolvimento gradual:** a demo é estática, sem base de dados persistente; o produto operacional e o SaaS multiempresa são evoluções futuras, não capacidades já entregues.
7. **Mobile-first e acessibilidade:** priorizar tarefas rápidas, controles claros, busca e feedback visível.

## Estrutura do repositório

- `site/index.html` — site de apresentação.
- `site/demo/` — aplicação demonstrativa navegável.
- `site/ajuda/` — FAQ e Central de Ajuda.
- `site/assets/locvia-brand.css` — **fonte compartilhada dos estilos do wordmark**.
- `site/assets/favicon.svg` — ícone reduzido usado nas abas; ponto já usa índigo.
- `Dockerfile`, `compose.yaml` e `nginx.conf` — publicação estática.
- `README.md` (raiz) — instruções para subir e atualizar no homelab.

## Como manter esta documentação

Ao mudar comportamentos na demo, atualize a seção correspondente e o [checklist](./checklist-de-homologacao.md) no mesmo PR/commit. Registre claramente se o recurso está **implementado na demo**, **definido como requisito** ou **planejado para o SaaS**. Evite descrever um protótipo como serviço disponível comercialmente.
