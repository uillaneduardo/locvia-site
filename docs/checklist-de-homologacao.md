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
