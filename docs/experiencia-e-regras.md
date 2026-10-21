# Experiência, telas e regras de aluguel

Este documento registra o **comportamento esperado** e distingue o que a **demonstração simula** do que precisará de validação no servidor da aplicação real.

## Jornada essencial

1. **Cadastrar o cliente** em Clientes.
2. **Cadastrar o item** com categoria, quantidade total e valor de referência.
3. **Consultar disponibilidade** em Meus itens: período inicial e final.
4. **Novo aluguel:** selecionar cliente, datas, item(ns), quantidade(s) e confirmar.
5. **Separar:** preparar itens para entrega/retirada e marcar como separados.
6. **Registrar retirada:** o sistema passa a mostrar os itens como **Com cliente**.
7. **Registrar devolução:** encerrar a ocupação e disponibilizar novamente as unidades, conforme as condições do retorno.

## Navegação principal

| Área | Tarefa principal | Observações |
| --- | --- | --- |
| Hoje | Resolver pendências | Separação, retirada e devolução; mostrar atrasos |
| Aluguéis | Novo aluguel e acompanhamento | Status, busca e filtros |
| Meus itens | Novo item e consulta | Cartões compactos no celular ou lista; sinal “Detalhes ›” |
| Clientes | Novo cliente e histórico | Criar, editar, consultar e excluir quando sem referências |
| Configurações | Ajustes do negócio | Nome, logotipo, cor, tema, acessibilidade, antecedência e duração sugerida |
| Ajuda | Tirar dúvidas | Ícone `?` na demo; `/ajuda/` com pesquisa |

**A barra de navegação deve ser coesa:** Configurações usa o mesmo padrão visual das demais opções, sem uma divisão artificial de “Gerenciamento”.

## Itens e disponibilidade

- O cadastro do item inclui **nome, categoria, quantidade total e preço por aluguel**.
- A consulta considera um **intervalo inclusivo de datas**.
- A disponibilidade é `estoque total - maior quantidade simultaneamente comprometida dentro do intervalo`, e não a soma de todas as reservas sem verificar interseção.
- Aluguéis **Reservados**, **Separados** e **Com cliente** ocupam estoque enquanto aplicável.
- Item **Com cliente** que ainda não teve devolução registrada continua ocupado mesmo após a data prevista. O atraso não libera automaticamente a unidade.
- Aluguéis **Devolvidos** e **Cancelados** não bloqueiam novas datas na demo.
- O usuário vê quantidades, reservas relacionadas e o nome do cliente ao abrir **Detalhes**.
- Não excluir itens vinculados a aluguéis existentes: preservar histórico. Não reduzir estoque abaixo das quantidades já comprometidas.
- O **preço aplicado em um aluguel** deve continuar registrado naquele aluguel mesmo que o preço do item mude depois.

**Na aplicação operacional**, a disponibilidade precisa ser recalculada e garantida no backend sob concorrência; um aviso do front-end sozinho não evita dupla reserva. Avaliar também intervalos de montagem, limpeza, manutenção, devoluções parciais e avarias.

## Estados do aluguel

```text
Reservado → Separado → Com cliente → Devolvido
     ↘ Cancelado ← [enquanto Reservado/Separado, na demo]
```

- **Atrasado** é um indicador do estado **Com cliente** quando a data prevista passou, não uma devolução implícita.
- O painel **Hoje** mostra pendências acionáveis com botões ligados ao próximo estado.
- Na demo, o usuário não edita datas/itens de um aluguel já confirmado. Para correção, pode cancelar uma reserva ainda não entregue e criar outra.
- Regras para edições, transferências e alterações de pedidos serão aprofundadas no produto operacional.

## Apresentação dos itens

- **Mobile:** grade de **duas colunas**, com três em larguras intermediárias quando couber; modo lista alternável.
- **Desktop:** grade flexível com várias colunas e modo lista alternável.
- **Sinalização:** indicador visível **“Detalhes ›”** (ou seta em telas reduzidas). O cartão/linha inteiro é clicável.
- **Detalhes:** disponibilidade, clientes associados, histórico e ações **Editar**/**Excluir**.

## Clientes

O cadastro demonstrativo permite nome, telefone, e-mail e observações. A exclusão fica bloqueada quando existe histórico de aluguel vinculado, inclusive concluído ou cancelado.

## Configurações e identidade da empresa

- **Nome do negócio**, aplicado na interface da demo.
- **Logotipo da locadora**, recortado 1:1, presente na identificação da empresa; não substitui a marca Locvia.
- **Cor de destaque** selecionada em paleta ou HEX `#RRGGBB`, aplicada à UI, não à cor institucional do ponto em `locvia.`.
- **Modo claro/escuro** e **modo de acessibilidade** para legibilidade e alvos de interação maiores.
- **Antecedência de separação** e **duração sugerida** para novos aluguéis.
- **Restaurar exemplo**, com confirmação.

**Limitação da demo:** configurações, cadastros e aluguéis são independentes por cenário, mas não persistem após recarregar a página. A versão operacional precisará de salvamento seguro, autenticação e histórico.


## Calendário de aluguéis — decisão adicional

A área **Aluguéis** alterna entre **Lista** e **Calendário**, compartilhando filtros de situação e busca por cliente/item/número. O calendário é mensal, usa início da semana no domingo, navegação de meses e botão **Hoje**. Selecionar um dia mostra os aluguéis previstos para o intervalo (inclusivo) e permite abrir seus detalhes. No celular, cada compromisso é representado por um marcador compacto.

Uma devolução atrasada também aparece **no dia de hoje** como alerta. Isso não significa liberação do item: o estoque continua ocupado até registrar a devolução. Evita-se repetir visualmente uma devolução atrasada por todos os dias futuros.

## Avisos internos — decisão adicional

O sino do cabeçalho mostra **avisos gerados localmente a partir dos aluguéis**; não há notificações externas. Em **Configurações → Notificações**, é possível ativar/desativar o sino e selecionar categorias independentes: separação, retirada, devolução próxima e devolução atrasada. A antecedência das devoluções pode ser de **0, 1, 2, 3, 5 ou 7 dias**. A antecedência da separação usa o prazo já definido em Configurações.

**Desativar o sino não oculta tarefas na tela Hoje** nem altera reservas ou devoluções. Os avisos são atualizados ao registrar novas ações, são separados por cenário fictício e não persistem após recarregar.
