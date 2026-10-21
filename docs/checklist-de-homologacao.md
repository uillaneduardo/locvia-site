# Checklist de homologação — site, demo e identidade visual

Use este roteiro **após atualizar o container**, verificando em navegador desktop e mobile. Não marque como concluído sem execução real. Os testes de código/simulação não substituem inspeção visual ou teste em aparelho.

## Marca e consistência visual

- [ ] Wordmark `locvia.` no cabeçalho da landing page, prévia, rodapé, menu da demo e Central de Ajuda.
- [ ] Palavra em negrito, minúsculas, sem ícone quadrado obrigatório ao lado.
- [ ] Ponto final **`#455CD4`** em todas as superfícies.
- [ ] Ponto não muda quando o negócio altera a cor de destaque.
- [ ] Wordmark legível nos temas claro e escuro.
- [ ] Favicon carrega com ponto índigo.

## Demo: ações principais

- [ ] **Hoje:** ver separações, retiradas, devoluções e atrasos; avançar estados.
- [ ] **Meus itens:** botão **Novo item**, cadastro, edição e exclusão com confirmação.
- [ ] Tocar em cartão/linha abre **Detalhes**; indicador “Detalhes ›” aparece.
- [ ] Mobile: dois cartões por linha (ou largura adaptativa adequada); opção lista.
- [ ] Desktop: grade com várias colunas e alternância para lista.
- [ ] Filtro por datas e quantidade disponível conforme período.
- [ ] Item com devolução atrasada permanece indisponível.
- [ ] Item vinculado a aluguel não pode ser excluído.
- [ ] **Clientes:** criar, visualizar, editar e excluir sem quebrar aluguéis associados.
- [ ] **Aluguéis:** confirmar reserva, separar, registrar retirada, devolver e bloquear conflito.
- [ ] **Configurações:** nome da empresa e preferências salvas no estado da sessão.

## Personalização e acessibilidade

- [ ] Upload PNG/JPG/WebP válido abre recorte quadrado 1:1.
- [ ] Arquivos maiores que 5 MiB, menores que 128 px ou maiores que 4096 px por lado exibem orientação.
- [ ] Arrastar e ampliar imagem funciona com mouse e toque.
- [ ] Confirmar recorte gera logo quadrado; visualizar, substituir e remover funcionam.
- [ ] Logo da locadora aparece na navegação e no mobile, sem substituir `locvia.`.
- [ ] Paleta e cor HEX válida mudam os destaques; HEX inválido é rejeitado.
- [ ] Tema claro/escuro funciona em listas, formulários e modais (sem texto ilegível).
- [ ] Modo de acessibilidade aumenta alvos, texto e foco visível.
- [ ] Navegação por teclado e fechamento de modal via Esc.
- [ ] Troca de cenário preserva preferências do cenário anterior durante a sessão.
- [ ] Recarregar a página volta aos exemplos e aparência padrão.

## Central de Ajuda e publicação

- [ ] Ícone `?` na demo abre `/ajuda/`.
- [ ] Busca de perguntas encontra termos sem diferenciar acentos.
- [ ] FAQ explica os recursos de logo, cor, tema, itens, clientes e aluguéis.
- [ ] O Nginx responde `/healthz`; `/demo/` e `/ajuda/` carregam arquivos atuais.
- [ ] Landing page preserva texto e links após alteração de marca.
- [ ] Verificar nas larguras ~360, 390, 768, 1366 e 1920 px.

## Critério de aceite

Não registrar “homologado em produção” só por atualização no GitHub ou checks automatizados. Registrar manualmente **data**, **navegador**, **dispositivo**, **resultado** e **pendências** após o deploy.


## Novo — calendário e avisos

- [ ] Alternar **Lista / Calendário** sem perder busca e filtros.
- [ ] Navegar entre meses, voltar a Hoje e selecionar um dia com aluguéis.
- [ ] Abrir um aluguel pelo calendário; alterar seu estado e conferir o resultado.
- [ ] Testar os marcadores e a lista de aluguéis do dia no celular.
- [ ] Conferir indicação de atraso no dia atual sem liberar o estoque pendente.
- [ ] Abrir o sino, entrar em **Configurações → Notificações** e escolher categorias.
- [ ] Conferir a antecedência de devolução de 0 a 7 dias e o contador atualizado.
- [ ] Desativar os avisos: o contador some, mas as tarefas de **Hoje** continuam.
- [ ] Recarregar: preferências e dados do cenário demonstrativo retornam ao padrão.
- [ ] Confirmar que não há solicitação de permissão push, notificações externas ou serviço em segundo plano.


## Novo — Financeiro, Minha conta e contatos

- [ ] Navegação **Financeiro** tem o mesmo padrão visual dos demais itens do menu.
- [ ] Resumo financeiro distingue **recebido**, **despesa paga**, **saldo** e **a receber** por mês, sem dupla contagem.
- [ ] Registrar pagamento parcial de aluguel e impedir recebimento superior ao valor devido.
- [ ] Criar despesa, alternar filtro e marcar como paga; o saldo do mês do pagamento muda.
- [ ] Navegar meses anterior/próximo/atual e conferir rótulos e resultados.
- [ ] Botão de olho oculta e exibe valores apresentados em todas as telas relevantes.
- [ ] **Configurações → Privacidade financeira** aplica a preferência padrão ao negócio.
- [ ] **Minha conta** permite nome, foto e e-mail demonstrativos sem armazenar senha.
- [ ] Tela de assinatura apresenta estados verdadeiros de demonstração, sem faturas ou cartões falsos.
- [ ] **Ajuda** abre em nova aba pelo ícone `?` e pelo link no menu.
- [ ] Botão flutuante abre e fecha painel de contatos, inclusive pelo teclado e em mobile.
- [ ] WhatsApp e Telegram utilizam cores fixas verde e azul; canais sem destino ficam inativos.
- [ ] Contato ativo configurado usa link válido, sem expor credenciais.
- [ ] Em modo escuro, modo acessibilidade e viewport pequeno não há corte de conteúdo.
- [ ] Recarregar desfaz pagamentos, despesas, foto/e-mail e preferências da demo.
