# Locvia — site institucional e demonstração

Site de apresentação da **Locvia**, ferramenta para organizar aluguéis de itens, começando por festas e eventos, com uma demonstração interativa **estática**.

- Landing page: `/`
- Demonstração: `/demo/`
- Central de Ajuda / FAQ: `/ajuda/`
- Health check: `/healthz`
- Decisões de produto, marca e implementação: [`docs/`](./docs/README.md)
- Implementação: HTML, CSS e JavaScript puro; Nginx; Docker Compose
- Não exige banco de dados, Node.js, API, credenciais ou etapa de compilação.

> **Importante:** a demonstração utiliza dados fictícios que existem apenas na memória da aba atual (recarregar reinicia os exemplos). Ela não cadastra clientes reais, não envia orçamentos, não processa pagamentos e não se conecta ao SaaS de produção. A landing page apresenta a proposta do produto; funcionalidades do SaaS devem ser validadas antes de sua comercialização.

## Demonstração — fluxo centrado no aluguel

A página pública em `/demo/` apresenta a operação de um pequeno negócio que aluga itens. Começa com **Festas e decoração**, mas permite trocar o tipo de empresa pelo seletor **Testar com**:

- **Festas e decoração:** painéis, cadeiras, mesas e acessórios
- **Livros:** exemplares e coleções
- **Equipamentos:** ferramentas e equipamentos audiovisuais
- **Veículos:** bicicletas, motos e utilitários

Cada opção tem dados fictícios independentes na aba do navegador.

### Jornada demonstrável

1. Na tela **Hoje**, confira as ações em **Para não esquecer**: separar itens, registrar retirada e registrar devolução (inclusive atrasada).
2. Clique em **Novo aluguel**; escolha cliente, retirada e devolução previstas.
3. Escolha um item e quantidade. A interface mostra quantas unidades existem **para todo o intervalo**.
4. Quando não há unidades, a tela explica quem está com os itens e impede a inclusão na quantidade indisponível.
5. Confirme o aluguel. Ele passa a ficar **Reservado**.
6. Abra o registro e use **Marcar separado → Registrar retirada → Registrar devolução**.
7. Ao registrar a devolução, a disponibilidade das unidades é liberada. Consulte em **Meus itens** pelo intervalo escolhido.

**Caso de teste:** no negócio Festas, o **Painel redondo areia** tem uma unidade ainda com Mariana Costa, com devolução atrasada. Tente alugá-lo para amanhã: o sistema não deixa. Na página Hoje, registre a devolução do aluguel **A-101**; tente novamente para ver a unidade liberada.

A checagem considera **datas inclusivas e quantidade máxima ocupada por dia**, respeitando reservas, itens separados e itens em mãos de clientes. Um aluguel com devolução vencida continua bloqueando a unidade até o registro do retorno. Quantidades de locações futuras só bloqueiam datas sobrepostas; registros devolvidos ou cancelados liberam o período.

### Acervo: cartões, lista e detalhes

Na área **Meus itens**, o botão de visualização alterna entre **cartões compactos** e **lista** na mesma sessão. Os cartões usam várias colunas no computador e duas colunas em celulares comuns (três colunas em larguras intermediárias), preservando a leitura mesmo em telas pequenas.

- Clique ou toque na área principal de um item para abrir **Detalhes**, onde são exibidos quantidade total, disponibilidade no período selecionado, aluguéis que ocupam o item, histórico e as ações **Editar item** e **Excluir**.
- No modo lista, tocar na linha também abre o detalhe. Os botões de edição e exclusão continuam disponíveis diretamente na listagem.
- O botão principal da tela Meus itens é **Novo item** (não Novo aluguel).
- A busca, as datas de disponibilidade e a alternância de layout funcionam nas duas visualizações.
- A opção de visualização é mantida enquanto a demo estiver aberta; recarregar restaura o layout inicial, como os demais estados demonstrativos.

### Clientes e itens — CRUD demonstrativo

As áreas **Clientes** e **Meus itens** permitem **criar, consultar, editar e excluir** registros em formulários próprios:

- Clientes: nome, telefone, e-mail e observações.
- Itens: nome, categoria, quantidade total e valor por aluguel.
- Edição de cliente e item reflete nas demais telas da demonstração.
- Exclusões exigem confirmação; clientes ou itens referenciados por qualquer aluguel, mesmo concluído ou cancelado, **não podem ser excluídos**, preservando o histórico.
- A redução da quantidade de um item é bloqueada se ficar abaixo do máximo comprometido por aluguéis ativos em períodos sobrepostos. Itens entregues ainda não devolvidos continuam comprometidos.
- O valor registrado no aluguel é preservado mesmo que o preço de referência do item seja posteriormente alterado.

### Identidade visual e logotipo demonstrativos

Na área **Configurações → Dados do negócio**, cada cenário oferece personalização visual independente, aplicada ao front-end da demonstração:

- **Logotipo:** carregar arquivo PNG/JPG/WebP (máximo **5 MiB**, mínimo **128 × 128 px**, máximo **4096 × 4096 px**, recomendação 512 × 512 px), ver imagem atual, trocar ou remover. Um editor usa o canvas do navegador para arrastar, aproximar e recortar o arquivo na proporção **1:1**. O resultado é um PNG **320 × 320 px** gerado localmente, armazenado apenas em memória. O arquivo original não é enviado ao servidor.
- **Onde aparece:** identificação da locadora no menu lateral, avatar compacto no cabeçalho mobile e prévia de Configurações. O logotipo institucional da Locvia não é substituído.
- **Cor de destaque:** oito opções predefinidas ou código hexadecimal `#RRGGBB`, com cor do texto do botão ajustada automaticamente segundo a luminância da cor selecionada.
- **Tema:** claro ou escuro, aplicado à navegação, formulários, painéis e diálogos.
- **Acessibilidade:** alternância de um modo com controles maiores, foco de teclado reforçado, fonte aumentada em áreas importantes e menos movimento. Não constitui certificação de conformidade com WCAG.
- **Experiência:** alterações visuais são exibidas imediatamente, sem necessidade de salvar; nome do negócio e preferências de aluguel continuam com botão **Salvar preferências**.

**Importante:** como toda a demo, imagem, cor e preferências visuais são mantidas **somente na memória da aba**; basta atualizar a página para retornar ao padrão. Não faça upload de documentos pessoais ou logotipos confidenciais na demonstração pública. Os limites de arquivos são validações do front-end, não regras de armazenamento ou upload do produto definitivo.

### Configurações

O menu **Configurações** foi pensado para o empreendedor que administra o negócio sozinho e evita preferências sem utilidade:

- **Dados do negócio:** nome de exibição na interface.
- **Rotina de aluguel:** antecedência para a tarefa de separação no painel **Hoje** e duração sugerida para novos aluguéis.
- **Demonstração:** restauração do cenário fictício após confirmação, sem alterar os demais cenários.
- **Sobre esta versão:** descrição do que funciona na demo e limites em relação ao produto futuro.

As preferências e cadastros são independentes entre os cenários (festas, livros, equipamentos e veículos) e **não são persistidos**. Recarregar a página restaura os exemplos.

**Limitações:** este comportamento é uma simulação front-end. O navegador não compartilha informações com outros usuários ou abas e não oferece proteção transacional real, autenticação, banco de dados nem sincronização. Em produção, a disponibilidade deve ser revalidada no servidor sob controle de concorrência para evitar dois usuários reservarem a última unidade simultaneamente. Também serão necessárias regras para devoluções parciais, manutenção, avarias e períodos de preparação entre aluguéis.

## Central de Ajuda — /ajuda/

A FAQ é publicada **no mesmo container**, sem API, banco de dados nem configuração de DNS adicional. Fica acessível em:

- **Principal:** `https://locvia.com.br/ajuda/`
- **Na demo:** ícone `?` visível no topo e link **Central de Ajuda** no menu lateral
- **Nos cartões de Meus itens:** texto **Detalhes ›** indica que tocar no item abre um painel. No modo lista, também aparece **Detalhes ›**, preservando a seta em telas pequenas.

Conteúdo da ajuda: primeiros passos, como cadastrar e editar itens e clientes, disponibilidades sobrepostas, acompanhamento de aluguéis, entrega/devolução, atrasos, configurações e limitações da demo. Inclui busca instantânea, categorias navegáveis, perguntas expansíveis, links diretos às telas da demo e contato por e-mail.

**Opcional — subdomínio `ajuda.locvia.com.br`:** o Nginx também reconhece `ajuda.locvia.com.br` e `faq.locvia.com.br` e os redireciona para `https://locvia.com.br/ajuda/`. Para ativar, no **Cloudflare Zero Trust → Tunnels → seu túnel existente → Published applications/Public Hostnames**, adicione `ajuda.locvia.com.br` apontando para **o mesmo serviço** do Locvia (`http://locvia-site:80` se estiverem na mesma rede Docker, ou o endereço privado que seu Tunnel já utiliza). O Cloudflare cria ou solicita o DNS desse hostname. Essa etapa é opcional; o endereço `/ajuda/` já funciona depois do deploy.

O Nginx usa `Cache-Control: no-store` tanto em `/demo/` como em `/ajuda/` para evitar arquivos JS/CSS desatualizados durante os ciclos de teste. A landing page não é alterada pela inclusão da ajuda.

## Requisitos

- Docker Engine e plugin Docker Compose
- Cloudflare Tunnel já operacional no homelab (para publicação externa)
- Porta TCP 8086 livre no host, ou outra definida no arquivo `.env`

## Subir no homelab

```bash
git clone https://github.com/uillaneduardo/locvia-site.git
cd locvia-site
docker compose up -d --build
docker compose ps
curl -fsS http://127.0.0.1:8086/healthz
```

Acesse na rede local do host:

- http://127.0.0.1:8086/
- http://127.0.0.1:8086/demo/
- http://127.0.0.1:8086/ajuda/

Se precisar de outra porta, crie um arquivo `.env` na raiz:

```env
LOCVIA_PORT=8087
```

Execute novamente `docker compose up -d`. A porta é vinculada a **127.0.0.1** por padrão: o serviço não fica exposto diretamente na interface pública do homelab.

## Publicar pelo Cloudflare Tunnel existente

**Não é necessário instalar outro cloudflared nem criar outro túnel.** Acrescente um *Public Hostname* à configuração do túnel que já está funcionando:

- **Hostname:** `locvia.com.br`
- **Service Type:** HTTP
- **Service URL:** depende de onde seu cloudflared está executando (veja abaixo).

### Cenário A — cloudflared instalado diretamente no host

Aponte o serviço para `http://localhost:8086` (ou sua `LOCVIA_PORT`). O host da aplicação e o cloudflared precisam ser a mesma máquina.

### Cenário B — cloudflared executando em container

Dentro do container do cloudflared, `localhost` é o **próprio container**, não o host Docker. Conecte o container Locvia à mesma rede Docker já utilizada pelo cloudflared:

```bash
docker network ls
docker network connect NOME_DA_REDE_DO_TUNNEL locvia-site
```

No *Public Hostname*, use `http://locvia-site:80` como Service URL.

A conexão via `docker network connect` pode precisar ser refeita caso o container Locvia seja recriado. Para torná-la persistente, adicione a rede externa existente ao Compose (substitua `NOME_DA_REDE_DO_TUNNEL` pelo nome real):

```yaml
services:
  locvia-site:
    networks:
      - default
      - cloudflare

networks:
  cloudflare:
    external: true
    name: NOME_DA_REDE_DO_TUNNEL
```

Esse trecho é um **exemplo de alteração no compose.yaml**, não um segundo arquivo Compose para executar isoladamente. Não crie uma rede nova se o cloudflared já participa de uma rede compartilhável. Caso o cloudflared rode em outra VM, use um endereço privado que ele consiga alcançar e adeque o bind da porta com cuidado.

Opcionalmente, crie também o hostname `www.locvia.com.br`, apontando-o para o mesmo serviço, e configure o redirecionamento canônico pelo Cloudflare. DNS e certificados públicos são gerenciados pelo Cloudflare, não pelo container. **Publicação no domínio exige que você faça essa configuração no seu túnel existente.**

## Atualizar e acompanhar

```bash
git pull --ff-only
docker compose up -d --build
docker compose logs --tail=100
```

Para parar:

```bash
docker compose down
```

**Cache do protótipo:** o Nginx utiliza `Cache-Control: no-store` nas rotas de `/demo/`, evitando que navegadores exibam JavaScript e CSS de versões anteriores após a atualização do container. Os demais recursos do site mantêm cache normal.

Verificações úteis:

```bash
curl -I http://127.0.0.1:8086/
curl -I http://127.0.0.1:8086/demo/
curl -fsS http://127.0.0.1:8086/healthz
```

## Estrutura

```text
locvia-site/
├── compose.yaml
├── Dockerfile
├── nginx.conf
├── .dockerignore
├── .gitignore
├── README.md
├── docs/                  # decisões de produto, identidade e checklist
│   ├── README.md
│   ├── identidade-visual.md
│   ├── visao-do-produto.md
│   ├── experiencia-e-regras.md
│   ├── demonstracao-e-implementacao.md
│   └── checklist-de-homologacao.md
└── site/
    ├── index.html          # landing page
    ├── styles.css
    ├── assets/
    │   ├── favicon.svg
    │   └── locvia-brand.css # wordmark institucional compartilhado
    └── demo/
        ├── index.html      # app demonstrativo
        ├── workflow.css    # tema neutro com destaque índigo
        ├── personalization.css # temas, marca e acessibilidade
        ├── calendar-notifications.css # calendário e avisos internos
        └── workflow.js     # estado, telas e disponibilidade
    └── ajuda/
        ├── index.html      # central de ajuda e dúvidas frequentes
        ├── help.css        # estilos responsivos
        └── help.js         # busca local e atalho /
```

## Direção de marca e conteúdo

Identidade visual neutra e responsiva, inspirada nos princípios do shadcn/ui: contraste bem definido, superfícies limpas, bordas discretas e componentes consistentes. Copy direta, em português do Brasil, para locadoras de itens para festas e eventos. A demonstração prioriza cinco áreas: **Hoje**, **Aluguéis**, **Meus itens**, **Clientes** e **Configurações**. A marca institucional **`locvia.`** usa **wordmark em negrito e ponto índigo fixo `#455CD4`**, aplicado no site, na demo e na Central de Ajuda. Os destaques da **interface** começam em índigo, mas o empreendedor pode alterar a cor da UI sem modificar a marca. O estilo é responsivo e neutro, inspirado em princípios de componentes do shadcn/ui. **Não é o produto operacional**.

Rodapé institucional: [Desenvolvido por ulln](https://ulln.com.br).

**Padrão de marca:** [Identidade Visual Locvia](./docs/identidade-visual.md). **Produto e regras:** [Visão do Produto](./docs/visao-do-produto.md) e [Experiência e Regras](./docs/experiencia-e-regras.md). **Validação:** [Checklist de Homologação](./docs/checklist-de-homologacao.md).

## Segurança e operação

- Nginx publica apenas arquivos estáticos e a rota local de saúde.
- Nenhuma chave, segredo ou token Cloudflare é necessário neste repositório.
- O acesso público deve ocorrer via túnel já existente, com a porta local vinculada ao loopback.
- Conteúdo demonstrativo não deve ser confundido com dados reais; nenhuma ação da demo modifica um banco de dados.
- É possível restringir a demo pelo Cloudflare Access no futuro, se necessário.

© Locvia. Desenvolvido por [ulln](https://ulln.com.br).


## Calendário e avisos na demonstração

Em **Aluguéis**, alterne entre **Lista** e **Calendário** para acompanhar os compromissos por mês e por dia. Busca e filtros operam nos dois modos. O calendário compacto no celular usa marcadores de status.

O sino no cabeçalho apresenta **avisos internos** para separação, retirada, devolução próxima e devolução atrasada. As categorias e a antecedência de devoluções podem ser configuradas em **Configurações → Notificações**. Desativar o sino não remove tarefas de **Hoje**.

São recursos **somente demonstrativos**, sem push, WhatsApp, e-mail, SMS, sincronização ou notificações em segundo plano. Tudo retorna ao exemplo após atualizar a página. Consulte [Experiência e regras](./docs/experiencia-e-regras.md).
