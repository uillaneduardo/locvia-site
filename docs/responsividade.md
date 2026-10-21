# Responsividade da demonstração Locvia

**Escopo:** as sete áreas **Hoje, Aluguéis, Meus itens, Clientes, Financeiro, Configurações e Minha conta**, além do cabeçalho, menu lateral, diálogos, calendário e widget de contatos rápidos.

## Decisão técnica

A estrutura da demo deve se ajustar automaticamente ao espaço disponível. O arquivo `site/demo/responsive.css` é carregado **por último** em `site/demo/index.html`, após as folhas específicas das funcionalidades, para unificar o comportamento responsivo.

### Regras

- `.shell` ocupa **100% da largura disponível**. `.sidebar` usa largura definida no desktop e vira gaveta sobreposta no mobile.
- `.main` usa flex com base zero (`flex: 1 1 0%; width: 0; min-width: 0`), evitando que o tamanho intrínseco dos filhos aumente a largura de toda a página.
- `.content` tem `width: 100%`, `max-width: 1400px` e margens automáticas, preservando respiro no Full HD sem forçar rolagem horizontal.
- Grades de cartões e painéis usam colunas `minmax(0, ...)`; colunas ficam empilhadas quando o espaço diminuir.
- **Tabelas** em Aluguéis, Clientes e Financeiro podem ser mais largas do que o painel: a rolagem horizontal acontece **dentro da tabela**, não no `body`.
- Cabeçalho, breadcrumbs, seletores, botões e barra de filtros permitem encolher/quebrar linha. Em telefones muito estreitos, o atalho de Minha conta do topo pode ser ocultado, mas a função continua no menu lateral.
- Calendário, formulários, pop-ups e diálogos respeitam a largura disponível; elementos com texto longo podem quebrar linha.
- Em Meus itens, cartões são exibidos em duas colunas em celulares comuns e adaptam-se conforme a largura. O modo lista continua disponível.
- O widget de atendimento permanece fixado ao canto direito sem aumentar o tamanho do documento.

**Não usar `overflow-x: hidden` no `body` como conserto principal.** Isso apenas esconderia conteúdo, em vez de resolver a origem do excesso de largura.

## Homologação em navegador

A alteração do CSS foi conferida por inspeção estática e **todas as sete páginas renderizaram em testes simulados do JavaScript**, mas a checagem visual nos dispositivos reais após o deploy **ainda é necessária**.

Testar em viewport CSS:

| Largura CSS | Meta |
| --- | --- |
| 1920 px | Full HD: painéis centralizados, sem barra horizontal na página |
| 1600 / 1366 px | Desktop / notebook: colunas e cabeçalho dentro da tela |
| 1024 px | Tablet horizontal: grades e barras ajustadas |
| 768 px | Tablet vertical: menu recolhível e conteúdo em uma coluna |
| 430 / 390 / 360 px | Celular: duas colunas onde cabível e ações utilizáveis |
| 320 px | Celular estreito: sem clipping na navegação e nos diálogos |

Em cada viewport, navegar pelas **sete telas** e abrir: um produto, um cliente, um aluguel, a criação de despesa, o editor de logotipo, as preferências e o painel de contato.

### Diagnóstico no DevTools do navegador

Depois de abrir a demo, execute no console:

```js
const vw = document.documentElement.clientWidth;
console.log({
  viewport: vw,
  documentWidth: document.documentElement.scrollWidth,
  overflowDaPagina: document.documentElement.scrollWidth > vw + 1
});
const elementosQueExcedem = [...document.querySelectorAll("body *")]
  .filter(el => {
    const style = getComputedStyle(el);
    if (style.position === "fixed" || style.position === "absolute") return false;
    const box = el.getBoundingClientRect();
    return box.width && (box.right > vw + 1 || box.left < -1);
  })
  .slice(0, 20)
  .map(el => ({elemento: el.tagName.toLowerCase(), classe: el.className, largura: el.getBoundingClientRect().width}));
console.table(elementosQueExcedem);
```

**Ressalva:** itens dentro de tabelas com `overflow-x:auto` podem ultrapassar visualmente o painel ao rolar internamente e isso é esperado. A condição que deve ser eliminada é o **documento inteiro** exceder o viewport.

## Organização futura

Ao criar novas telas ou componentes da API, reutilizar classes de layout e seguir os mesmos padrões. Não adicionar `min-width` fixo a grids, painéis ou tabelas fora de um contêiner rolável. Repetir a homologação de viewport após mudanças em CSS, botões ou cabeçalho.
