# Orçamentos na demonstração — interface, emissão e contrato futuro

**Estado:** fluxo de front-end implementado na demo, sem API, autenticação, banco, persistência nem envio a clientes. Arquivos principais: `site/demo/quotes.js`, `site/demo/quotes.css`, `site/demo/workflow.js` e `site/demo/index.html`.

## Fluxo homologável

1. Entre em **Demo → Aluguéis** (`/demo/#alugueis`). A ação **Novo orçamento** aparece ao lado de **Novo aluguel**, inclusive no celular.
2. Selecione um cliente já cadastrado, retirada e devolução previstas, data de validade, itens e quantidades.
3. Edite o preço unitário quando necessário e informe serviços/entrega, desconto e observações; o total é calculado na tela.
4. Clique em **Emitir orçamento**. A demo registra uma proposta **emitida** numerada como `ORC-1001`, `ORC-1002` etc. por cenário.
5. O documento abre no próprio modal. Use **Imprimir / Salvar PDF** para acionar a impressão do navegador, com layout A4. Escolha **Salvar como PDF** na janela de impressão para gerar o PDF localmente.
6. Feche a prévia e reabra qualquer proposta na seção **Orçamentos emitidos**, abaixo da lista/calendário de aluguéis.

Os orçamentos ficam **somente em memória** por cenário de negócio e são reiniciados ao recarregar ou restaurar o cenário. A listagem respeita a função de ocultação visual de valores do Financeiro; o documento aberto e a impressão mostram os valores, pois são necessários para o orçamento.

**Regras:** um orçamento não cria aluguel, não ocupa estoque, não bloqueia disponibilidade, não altera o Financeiro, não gera conta a receber, não envia mensagens e não se converte automaticamente em locação. A disponibilidade definitiva precisa ser conferida no momento futuro de conversão/registro do aluguel. O documento inclui o aviso **“DEMONSTRAÇÃO · SEM VALIDADE COMERCIAL”** para não ser confundido com proposta operacional ou documento fiscal.

## Dados e regras desta versão

- Clientes e itens são obtidos da mesma fonte fictícia já usada nos aluguéis, respeitando o cenário selecionado.
- Número `ORC-{sequência}` não é identidade global e **não representa** numeração oficial.
- O conteúdo emitido guarda um **snapshot** do nome da locadora, logo em memória, nome do cliente, descrições e preços; editar cadastros após emitir não altera o documento anterior.
- Quantidades são inteiras entre 1 e 9.999. Preços, taxas e descontos são validados com até duas casas decimais (conversão para **centavos inteiros** no documento). Desconto não pode superar subtotal + serviços.
- Datas de retirada e validade começam a partir do dia corrente; devolução deve ser igual ou posterior à retirada. Isso é regra **da demo**, a ser refinada comercialmente.
- Clientes/itens referenciados por orçamentos emitidos não podem ser excluídos enquanto houver histórico no cenário, seguindo a lógica de preservação aplicada aos aluguéis.
- O layout de A4 é gerado por HTML/CSS e **`window.print()`**; a função não produz PDF binário no servidor.
- Não inserir dados reais de clientes, dados fiscais, assinaturas, chaves ou credenciais. A impressão gerada é deliberadamente demonstrativa.

## Preparação da integração REST/JSON (PHP)

A interface usa um módulo `window.LocviaQuotes` isolado com estado de demonstração e funções de acesso `repository.list(segment)` / `repository.get(segment,id)` / `repository.create(segment,payload)` / `repository.reset(segment)`. Para integrar o produto real, substituir esse adaptador por um serviço HTTP com tratamento de carregamento, falhas, autorização e autenticação. Não conectar diretamente o banco à UI.

**Base de planejamento (ainda inexistente):** `https://api.locvia.com.br/api/v1`, acessível via HTTPS e com autenticação/sessão válida. Exemplo de endpoints:

| Ação | Endpoint proposto | Observações |
| --- | --- | --- |
| Listar propostas | `GET /quotes?status=&page=&search=` | Escopo da organização autenticada, paginação |
| Criar e emitir proposta | `POST /quotes` | Payload validado; idempotência por chave de requisição |
| Consultar orçamento | `GET /quotes/{id}` | Documento com snapshot e histórico |
| Obter PDF oficial | `GET /quotes/{id}/pdf` | Backend ou worker PHP; resposta binária autorizada |
| Enviar ao cliente (futuro) | `POST /quotes/{id}/send` | Opt-in explícito, fila e rastreabilidade |
| Converter em aluguel (futuro) | `POST /quotes/{id}/convert` | Transação revalida estoque, preços e políticas; retorna `rentalId` |

Exemplo de contrato **conceitual** de criação (não é uma requisição real nem uma especificação OpenAPI final):

```json
{
  "clientId": "customer-uuid",
  "pickupDate": "2026-11-12",
  "returnDate": "2026-11-13",
  "validUntil": "2026-11-01",
  "lines": [
    {"itemId": "item-uuid", "quantity": 3, "unitPriceCents": 6500}
  ],
  "serviceFeeCents": 2500,
  "discountCents": 1000,
  "notes": "Entrega a combinar."
}
```

A resposta do backend precisará incluir `id`, `number`, `status`, `issuedAt`, `version`, totais calculados no servidor e snapshot do emitente, cliente e itens. **O servidor é a autoridade dos cálculos, permissões e transições**; a UI mostra apenas um cálculo de prévia. Clientes, itens e orçamento sempre limitados ao tenant autenticado.

Sugestão para o domínio: `quotes` separado de `rentals` e `finance`. O orçamento pode ter ciclo `draft → issued → accepted/rejected/expired → converted`, com transições de negócio auditáveis. **Nesta demo só há criação/ emissão `issued`; nenhum outro status ou operação foi implementado.**

O PDF definitivo, envio por e-mail/WhatsApp, numeração por empresa, tributação e identidade comercial devem ser definidos no backend. Se necessário, usar worker PHP para gerar documento, publicar evento `quote.issued` e avisar via WSS. A geração e a emissão não podem depender da entrega de eventos WebSocket.

## Mapa de UI para API futura

| Tela/componente | Ação de UI | Responsável atual | Responsável futuro |
| --- | --- | --- | --- |
| Aluguéis / barra principal | Abrir Novo orçamento | `newQuote()` em `quotes.js` | Lista de clientes/itens por REST |
| Formulário de orçamento | Incluir/remover e ajustar linhas | Estado local `draft` | Formulário no cliente e validação final no servidor |
| Formulário de orçamento | Emitir orçamento | `emit()` e armazenamento em memória | `POST /quotes` com autenticação, validação e idempotência |
| Aluguéis / Orçamentos emitidos | Listar/consultar | `listMarkup()` e `viewer()` | `GET /quotes`, `GET /quotes/{id}` |
| Prévia | Imprimir / Salvar PDF | `window.print()` | PDF oficial de `GET /quotes/{id}/pdf` |
| Cadastro de clientes/itens | Impedir exclusão com vínculo histórico | `references()` em `quotes.js` | Regras transacionais no serviço de cadastros |

## Checklist de homologação manual

- [ ] Abrir `/demo/#alugueis` em Full HD e no celular: sem rolagem horizontal da página; botão visível.
- [ ] Criar orçamento com 2 itens, 2 quantidades, preço alterado, entrega e desconto. Conferir as contas.
- [ ] Tentar emitir sem itens, com quantidade inválida, valores negativos e desconto maior que o total: operação bloqueada.
- [ ] Emitir; conferir número, nome do negócio/cliente, datas, linhas, preço e ressalva de demonstração.
- [ ] Reabrir o orçamento emitido; imprimir e salvar como PDF em A4, incluindo layout claro quando a UI estiver no modo escuro.
- [ ] Confirmar que quantidade disponível, registros de aluguéis e Financeiro não mudam ao emitir.
- [ ] Alternar cenários: cada um mantém orçamentos próprios na aba; recarregar reinicia todos.
- [ ] Testar tentativa de excluir cliente/item com orçamento emitido: a UI bloqueia preservando histórico.
- [ ] Ativar **ocultar valores** no Financeiro; voltar a Aluguéis para verificar listagem mascarada e impressão explícita com valores.
- [ ] Restaurar cenário: seus orçamentos somem e o próximo número recomeça na sequência fictícia.

## Atualizar no homelab

Na pasta real do checkout do repositório `uillaneduardo/locvia-site`:

```bash
git pull --ff-only
docker compose up -d --build
docker compose ps
curl -fsS http://127.0.0.1:8086/healthz
```

Se estiver usando `sudo` para Docker, prefixe os comandos Compose com `sudo`. A configuração existente de Cloudflare Tunnel e da rede Docker não precisa mudar para este recurso estático. Veja também `README.md` e `docs/arquitetura-api-php.md`.
