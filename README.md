# Locvia — site institucional e demonstração

Site de apresentação da **Locvia**, plataforma de gestão de locações para eventos, com uma demonstração interativa **estática**.

- Landing page: `/`
- Demonstração: `/demo/`
- Health check: `/healthz`
- Implementação: HTML, CSS e JavaScript puro; Nginx; Docker Compose
- Não exige banco de dados, Node.js, API, credenciais ou etapa de compilação.

> **Importante:** a demonstração utiliza dados fictícios que existem apenas na sessão do navegador. Ela não cadastra clientes reais, não envia orçamentos, não processa pagamentos e não se conecta ao SaaS de produção. A landing page apresenta a proposta do produto; funcionalidades do SaaS devem ser validadas antes de sua comercialização.

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
└── site/
    ├── index.html          # landing page
    ├── styles.css
    ├── assets/
    │   └── favicon.svg
    └── demo/
        ├── index.html      # app demonstrativo
        ├── demo.css
        └── demo.js
```

## Direção de marca e conteúdo

Identidade visual neutra e responsiva, inspirada nos princípios do shadcn/ui: contraste bem definido, superfícies limpas, bordas discretas e componentes consistentes. Copy direta, em português do Brasil, para locadoras de itens para festas e eventos. A demo ilustra acervo, locações, clientes e financeiro; **não é o produto operacional**.

Rodapé institucional: [Desenvolvido por ulln](https://ulln.com.br).

## Segurança e operação

- Nginx publica apenas arquivos estáticos e a rota local de saúde.
- Nenhuma chave, segredo ou token Cloudflare é necessário neste repositório.
- O acesso público deve ocorrer via túnel já existente, com a porta local vinculada ao loopback.
- Conteúdo demonstrativo não deve ser confundido com dados reais; nenhuma ação da demo modifica um banco de dados.
- É possível restringir a demo pelo Cloudflare Access no futuro, se necessário.

© Locvia. Desenvolvido por [ulln](https://ulln.com.br).
