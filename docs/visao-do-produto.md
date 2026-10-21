# Visão do produto e posicionamento

## Objetivo

**Locvia** é concebido como um **organizador prático de aluguéis de itens**. Deve permitir ao empreendedor de pequeno porte controlar seus itens e compromissos sem depender da memória, de conversas espalhadas ou de planilhas difíceis de conferir.

Frase-guia interna: **“O que tenho livre, com quem está e o que preciso fazer hoje?”**

A landing page conserva a proposta “Tudo no lugar. Do orçamento à devolução.” O texto da UI deve privilegiar ações de **alugar** em vez de uma terminologia administrativa excessiva.

## Público inicial

Empreendedor(a) individual ou pequena empresa que aluga produtos para festas e eventos: decoração, painéis, mesas, cadeiras e acessórios. Problemas observados na operação real:

- Dificuldade para saber **qual item foi alugado e para quem**.
- Risco de alugar novamente um item que **não foi devolvido**.
- Esquecimento de **separar**, **entregar**, **conferir** ou **cobrar devolução**.
- Pouco tempo para alimentar um sistema complexo.

A arquitetura e os conceitos devem permitir evolução para **aluguel de livros, ferramentas, equipamentos e veículos**. Para bens individualizados (veículo, câmera, equipamento), poderá ser necessário identificar unidade física/placa/número de série; a demo atual controla sobretudo **quantidades por item**.

## Princípios de experiência

1. **Uma ação principal por contexto.** Em **Meus itens**, a ação é **Novo item**; em **Aluguéis**, **Novo aluguel**.
2. **Hoje é uma lista de trabalho**, não apenas um dashboard de métricas.
3. **Consultar antes de prometer:** selecionar datas e ver disponibilidade no período.
4. **Visibilidade do vínculo:** descobrir rapidamente quem está com cada item.
5. **Lembretes in-app:** separar, retirar/entregar, devolver e lidar com atrasos.
6. **Poucas telas, detalhes sob demanda:** abrir produto ou aluguel para aprofundar ações.
7. **Linguagem natural e controles que parecem clicáveis:** indicador “Detalhes ›” nos produtos.
8. **Neutralidade visual:** interface leve com destaque de cor; responsividade e acessibilidade são prioridades.

## Organização pretendida

- **Hoje:** tarefas e pendências da rotina.
- **Aluguéis:** criar reserva, acompanhar status, retirada e devolução.
- **Meus itens:** cadastro e disponibilidade; cartões compactos ou lista.
- **Clientes:** cadastro e histórico.
- **Configurações:** nome/logotipo do negócio, preferências de período, aparência e demonstração.
- **Central de Ajuda:** instruções, FAQ e busca; `/ajuda/`.

## Evolução do negócio e escopo

O objetivo de longo prazo é um **software comercializável**, potencialmente **SaaS multiempresa**, com isolamento de organizações, contas, regras consistentes no backend e persistência. O posicionamento inicial é orientado ao empreendedor solo; isso não impede multiusuário no futuro.

**Não confundir com a entrega atual:** este repositório apresenta uma **landing page** e uma **demo front-end estática**. Autenticação, banco de dados, pagamentos reais, notificações automáticas, operações concorrentes e sincronização multiempresa **não estão implementados**.

## Prioridades para o MVP operacional

1. Disponibilidade transacional sem duplicidade de reservas.
2. Cadastro de itens, quantidades e clientes.
3. Linha do tempo do aluguel com retirada, devolução e atraso.
4. Visão “Hoje” confiável e simples.
5. Auditoria/histórico e mecanismos de correção de erro.
6. Em seguida: financeiro, políticas de contrato, notificações e integrações, de acordo com validação dos primeiros clientes.


## Refinamento: gestão financeira e identidade

O módulo **Financeiro** foi incluído para apoiar decisões diárias: cobrar aluguéis pendentes, controlar despesas e entender entradas e saídas efetivas, sem transformar o produto em um ERP contábil. Priorizam-se indicadores de caixa simples e ações rápidas.

**Minha conta** é o espaço da pessoa usuária para credenciais e assinatura do SaaS, separado de **Configurações do negócio**. O backend operacional será uma **API PHP** com HTTPS/REST, autenticação e validação de domínio; WebSockets e processamento assíncrono entram somente onde fizerem diferença operacional. O frontend pode continuar em HTML/CSS/JavaScript puros.

Ver [Arquitetura PHP](./arquitetura-api-php.md) e [Fluxos financeiro e de conta](./financeiro-conta-contatos.md).
