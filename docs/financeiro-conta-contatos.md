# Financeiro, Minha conta e contato rápido

**Status:** recursos navegáveis em demo estática; ações de dinheiro são apenas simulações, sem banco nem PSP.

## Financeiro — ferramenta de rotina

A tela **Financeiro** apresenta quatro números principais por mês:

| Indicador | Cálculo na demo |
| --- | --- |
| Recebido | Soma de pagamentos efetivamente registrados na data do mês consultado |
| Despesas pagas | Soma de despesas com pagamento registrado na data do mês |
| Saldo do período | Recebido menos despesas pagas, **não** saldo bancário |
| A receber | Saldo ainda pendente dos aluguéis cuja retirada prevista é no mês consultado |

Também exibe despesas em aberto cujo vencimento é no mês, com ações imediatas:

- **Registrar recebimento** de um aluguel (parcial ou integral), sem ultrapassar saldo pendente.
- **Nova despesa** com descrição, categoria, valor, vencimento e status paga/a pagar.
- **Marcar despesa como paga**, que passa a compor o caixa do mês do pagamento.
- Consultar por **mês anterior/próximo/atual** e filtrar recebimentos, despesas e pendências.
- Abrir aluguel relacionado a partir do Financeiro.
- **Ocultar/exibir valores** na interface pelo botão de olho.

**Cuidado:** valores de exemplos não representam operação real, impostos, lucro, conciliação bancária nem DRE. Formulários precisam mostrar os números digitados mesmo quando o modo de privacidade está ativo. O controle de privacidade mascara exibição, **não autoriza ou restringe acesso**.

### Configurações → Privacidade financeira

A opção **Iniciar com valores ocultos** define como o negócio deve apresentar valores quando seu cenário é selecionado/reiniciado. O botão de olho permite alternar manualmente durante a sessão. Não depende de servidor e retorna ao padrão após recarregar a demo.

**Dependência de domínio:** pagamentos do negócio ficam vinculados aos aluguéis, preservando os valores de referência usados no pedido. Cancelamento de aluguel com pagamento registrado deve passar por estorno/conferência; a demo impede simplesmente cancelá-lo sem tratar o dinheiro.

## Minha conta

Nova tela separada de **Configurações do negócio**:

- **Perfil:** nome de exibição e foto de avatar. Foto processada localmente como PNG quadrado 160 px; aceita PNG/JPG/WebP até 2 MiB e dimensões entre 64 e 4096 px.
- **Acesso e segurança:** exibe e-mail demonstrativo e permite modificá-lo apenas no estado da aba. Alteração de senha mostra o fluxo de segurança planejado **sem solicitar senhas reais**.
- **Assinatura Locvia:** identifica o cenário **sem plano contratado**, apresenta que não há forma de pagamento cadastrada e oferece canal de consulta comercial.
- **Histórico da assinatura:** estado vazio honesto, sem inventar faturas, pagamentos ou cartões.

Não confundir **faturas da assinatura SaaS** com o dinheiro de aluguéis registrado pelo negócio.

A versão operacional deverá incluir verificações de e-mail, troca segura de senha, gestão de sessões, métodos tokenizados de pagamento, recibos e faturas reais consumidos da API.

## Contatos rápidos

Um botão flutuante, no **canto inferior direito** da demo, utiliza **verde WhatsApp fixo**. Ao tocar, abre um pequeno painel com quatro canais: WhatsApp (**verde**), Telegram (**azul**), E-mail e Telefone.

**Configuração atual:** `site/assets/contact-config.js`.

```js
window.LocviaContactConfig = Object.freeze({
  email: "uillaneduardo@ulln.com.br",
  phone: "",
  whatsapp: "",
  telegram: "",
  subject: "Dúvida sobre o Locvia"
});
```

Os canais sem destino configurado são exibidos como **Não configurado**, sem links falsos. Preencha `phone` e `whatsapp` com DDI e DDD, por exemplo `+55...` (sem inserir número fictício como valor real). `telegram` aceita username público ou URL `https://t.me/usuario`. O widget só abre endereço válido; links externos usam nova aba com `noopener noreferrer`. O e-mail atual usa `mailto:` e não transmite conversas a terceiros pelo servidor da demo.

No SaaS, as opções de suporte devem vir de **configuração gerenciável pelo administrador da plataforma**, oferecida por endpoint público limitado a dados explicitamente divulgáveis. Não colocar segredos em arquivos servidos ao navegador.

## Ajuda

Os acessos da demo a `/ajuda/` (ícone `?` e link **Central de Ajuda**) abrem em **nova aba**, mantendo o trabalho atual do empreendedor.

## Estado dos dados

Todos os valores e alterações fictícios ficam somente na memória da aba. Atualizar a página restaura o conjunto inicial. Nenhuma operação financeira real, senha ou cobrança de assinatura é executada.

**Arquitetura PHP escolhida para o futuro:** consulte [arquitetura-api-php.md](./arquitetura-api-php.md).
