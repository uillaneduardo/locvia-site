# Arquitetura-alvo — API PHP, WebSockets e tarefas assíncronas

**Status: decisão arquitetural para desenvolvimento futuro, NÃO implementada nesta demo.** A demo atual utiliza HTML, CSS e JavaScript puros, com dados em memória, servidos pelo Nginx.

## Decisões estabelecidas

1. **Backend da plataforma operacional em PHP**, organizado por domínios de negócio; preferir versão do PHP mantida/atualizada e recursos nativos adequados à implantação.
2. **Frontend em HTML, CSS e JavaScript puros**, progressivamente com módulos e componentes reutilizáveis. A interface consome uma **API HTTPS pública e versionada**, como `/api/v1` no domínio `api.locvia.com.br` **apenas quando for provisionado**.
3. **Público significa acessível ao navegador pela internet, não sem autenticação**. Toda rota privada é autenticada, autorizada e validada no servidor. Nunca expor SQL, chaves de pagamento ou secrets diretamente ao cliente.
4. **REST/JSON** para CRUD, consultas e ações de domínio; **WebSockets seguros (WSS)** apenas quando atualizações em tempo real justificarem (alterações de aluguel, estoque, alertas, status de pagamento). Não usar WebSocket como substituto indiscriminado de REST.
5. Processos demorados/externos devem ser **assíncronos quando necessário**, com filas e workers PHP separados da resposta HTTP: e-mails, notificações, geração de documentos, conciliações e webhooks. Eventos devem ser idempotentes e observáveis.
6. **Banco relacional transacional** com chaves e índices por organização, isolamento multi-tenant, migrations e trilha de auditoria. Escolha de SGBD, framework PHP, fila e gateway será registrada em decisão técnica posterior.
7. Separar **Financeiro da locadora** (recebimentos, despesas, caixa) de **Faturamento Locvia** (assinatura, plano, faturas, método de pagamento). Nunca misturar estes livros.
8. Armazenar valores monetários em **centavos inteiros** ou `DECIMAL` apropriado no banco, evitando `float` para operações finais. Datas, timezone da empresa e regras de arredondamento devem ser definidas no backend.

## Autenticação e segurança

- Login/sessão revogável, hash forte de senhas; reset/troca de senha com comprovação de identidade, proteção contra enumeração, limites de tentativa e revogação de sessões.
- Preferir cookies `Secure`, `HttpOnly`, `SameSite` com proteção CSRF para browser (ou tokens curtos com estratégia explícita de renovação); CORS restrito a origens permitidas. Nunca guardar token permanente no JavaScript.
- **Toda requisição**: autenticar, resolver empresa/organização, validar autorização e dados (inclusive IDs relacionados), respeitar tenant e registrar auditoria das alterações sensíveis.
- Controle por papéis e permissões definido no backend, não em botões ocultos.
- PHP/API assume validação transacional de estoque e pagamentos. A interface apenas apresenta prévias e feedback.
- Dados pessoais segundo LGPD: finalidade, retenção, exportação/exclusão quando aplicável, privacidade e controles administrativos.
- Cobranças de assinatura: integração com provedor de pagamentos; não armazenar PAN/CVV. Método tokenizado via PSP, webhooks assinados, conferência idempotente, reembolsos por processo auditado.

## Domínios de ação e endpoints propostos

Endpoints abaixo são **especificação de planejamento**; nenhum deles foi criado ou publicado. Padrão base imaginado: `/api/v1`. Rotas de empresa ativa exigem contexto de organização validado na sessão; não confiar em `organization_id` enviado livremente pelo navegador.

| Domínio | Recursos/ações de interface | Endpoints planejados (REST HTTPS) |
| --- | --- | --- |
| Auth | Entrar, sessão, sair, redefinir senha | `POST /auth/login`, `GET /auth/session`, `POST /auth/logout`, `POST /auth/password-reset/request`, `POST /auth/password-reset/confirm` |
| Minha conta | Perfil, foto, e-mail de login, senha, sessões | `GET/PATCH /me`, `POST /me/avatar`, `DELETE /me/avatar`, `POST /me/email-change/request`, `POST /me/email-change/confirm`, `POST /me/password-change`, `GET/DELETE /me/sessions` |
| Assinatura Locvia | Plano, faturas, método de pagamento, troca/cancelamento | `GET /account/subscription`, `GET /account/invoices`, `GET /account/invoices/{id}`, `POST /account/payment-method/setup-session`, `POST /account/subscription/change-plan`, `POST /account/subscription/cancel` |
| Negócio | Nome, logotipo, cores, tema, contato | `GET/PATCH /business/settings`, `POST /business/logo`, `DELETE /business/logo`, `GET /public/support-channels` |
| Clientes | Lista, criar, consultar, editar, arquivar | `GET/POST /customers`, `GET/PATCH /customers/{id}`, `DELETE /customers/{id}` (conforme vínculos/política) |
| Itens e estoque | Lista, busca, disponibilidade, CRUD | `GET/POST /items`, `GET/PATCH /items/{id}`, `DELETE /items/{id}`, `GET /items/{id}/availability?from=&to=`, `GET /items/{id}/rentals` |
| Aluguéis | Lista/calendário, criar, detalhes, ações de status | `GET/POST /rentals`, `GET/PATCH /rentals/{id}`, `POST /rentals/{id}/prepare`, `POST /rentals/{id}/pickup`, `POST /rentals/{id}/return`, `POST /rentals/{id}/cancel` |
| Financeiro do negócio | Resumo, extrato, recebimentos, despesas | `GET /finance/summary?month=`, `GET /finance/transactions?month=&status=`, `POST /rentals/{id}/payments`, `GET/POST /finance/expenses`, `GET/PATCH /finance/expenses/{id}`, `POST /finance/expenses/{id}/settle` |
| Alertas e notificações | Sino, preferências e leitura | `GET /notifications`, `GET/PATCH /notification-preferences`, `POST /notifications/{id}/read` |
| Suporte público | Canais definidos pela operação | `GET /public/support-channels` (somente dados destinados à divulgação) |

Paginação/filtros, erros HTTP padronizados, ordenação e busca devem ser consistentes. Preferir comandos de domínio (`/prepare`, `/return`, `/settle`) a permitir alteração arbitrária de status.

### Regra crítica: reservar estoque

`POST /rentals` deve verificar disponibilidade **dentro de uma transação** que previna concorrência sobre a mesma quantidade/período. Uma consulta prévia de `/availability` serve apenas como indicação, não como garantia. A operação deve ser idempotente para retries quando conveniente. Registrando devolução, associar quantidades devolvidas, avarias e histórico de eventos.

### Financeiro

Um aluguel cria **direito a receber**; pagamento confirmado registra **entrada de caixa**. Despesa cria **obrigação a pagar**; somente despesa liquidada registra saída. Não somar valores previstos com pagos como se fossem entradas independentes. Possibilitar pagamento parcial, múltiplos lançamentos, referência/conciliação, reversões e auditoria. Mudanças de aluguel já pago exigem lógica própria de estorno ou crédito.

A tela `Financeiro` não administra pagamentos da assinatura Locvia; esses pertencem ao domínio `account/subscription`.

### WebSocket / eventos

Um worker PHP persistente expõe **WSS autenticado**, com autorização por tenant e tópicos delimitados (ex.: `org:{id}:rentals`, `org:{id}:finance`, `user:{id}:notifications`). Eventos recomendados:

- `rental.created`, `rental.status_changed`, `rental.returned`
- `item.availability_changed`
- `finance.payment_recorded`, `finance.expense_settled`
- `notification.created`, `account.subscription_updated`

Não enviar segredos ou números completos de cartão em eventos. Enviar IDs/versões e dados mínimos. REST continua como fonte de verdade; evento notifica a UI para reconsultar quando apropriado. Suportar reconexão, deduplicação e ordenação dentro do contexto relevante.

### Fluxos assíncronos

```text
Browser HTML/CSS/JS ──HTTPS──> API PHP ──transação──> Banco
                                  │
                                  └── evento/outbox → fila → worker PHP
                                                         ├─ avisos/e-mail
                                                         ├─ documentos
                                                         ├─ conciliação/gateway
                                                         └─ publicação WSS
```

Definir entregas/retries/backoff, dead-letter, idempotência e logs de auditoria. **Nunca** depender de uma conexão WebSocket aberta para confirmar dinheiro ou reservar estoque.

## Contratos e teste

- Versionar a API com **OpenAPI** antes da ligação do frontend.
- Testes por domínio, integração, concorrência, segurança multiempresa, WebSocket e idempotência.
- Mapeamento tela→ação→endpoint→permissão conforme cada tela for homologada.
- Fluxos de assinatura: confirmação externa via webhook, prazos de pagamento, falhas, cancelamento e estorno sob decisões comerciais e jurídicas.

## Ordem de implementação recomendada

1. Autenticação, contas, organizações, isolamentos e permissões.
2. Clientes, itens e reserva transacional.
3. Estados do aluguel com auditoria.
4. Financeiro de negócio com recebimentos e despesas.
5. Identidade/Configurações, preferências, Central de Ajuda e canais gerenciáveis.
6. Assinatura Locvia e PSP, notificações externas e WebSockets quando houver necessidade real.
