# Demonstração — implementação e limites

## Estado atual

A demonstração é um **protótipo navegável e interativo**, produzido com **HTML, CSS e JavaScript puros**, servido estaticamente pelo Nginx em Docker. **Não existe API, banco de dados ou persistência nesta demo.**

| Endereço | Conteúdo |
| --- | --- |
| `/` | Landing page |
| `/demo/` | Aplicação demonstrativa |
| `/ajuda/` | Central de Ajuda / FAQ |
| `/healthz` | Health check HTTP local |

O domínio público pode ser servido via **Cloudflare Tunnel** apontando para o mesmo serviço do container; `ajuda.locvia.com.br` é opcional e exige configuração adicional de hostname no Tunnel.

## Arquivos principais

| Arquivo | Responsabilidade |
| --- | --- |
| `site/index.html`, `site/styles.css` | Landing page |
| `site/assets/locvia-brand.css` | Wordmark oficial compartilhado (`locvia.`) |
| `site/assets/favicon.svg` | Ícone reduzido |
| `site/demo/index.html` | Estrutura da aplicação |
| `site/demo/workflow.css` | Componentes da demo |
| `site/demo/personalization.css` | Cores, tema escuro, controles visuais, acessibilidade |
| `site/demo/workflow.js` | Estado, cenários, disponibilidade, formulários, modais e personalização |
| `site/ajuda/index.html` | FAQ por assuntos |
| `site/ajuda/help.css`, `help.js` | Estilos e busca local |
| `nginx.conf` | Rotas, cache e headers de segurança |

## Cenários fictícios

O menu **Testar com** alterna entre **Festas e decoração**, **Livros**, **Equipamentos** e **Veículos**. Cada cenário possui exemplos independentes de clientes, itens, aluguéis e preferências. A base vive **somente na memória da aba**. O recarregamento retorna ao padrão.

CRUDs de clientes e itens, reservas, retiradas, devoluções e preferências modificam apenas o estado local da página. Não usar a demo para administrar negócios reais nem inserir dados pessoais sensíveis.

## Upload e recorte de logotipo

Na demo, o empreendedor pode:

1. Selecionar PNG, JPG ou WebP.
2. Validar **até 5 MiB**, **mínimo 128 × 128 px** e **máximo 4096 × 4096 px** por dimensão. Recomendação 512 × 512.
3. Recortar em **1:1**, arrastando imagem e alterando zoom no `canvas`.
4. Produzir um PNG quadrado de **320 × 320 px**, guardado em memória como Data URL.
5. Ver, substituir ou remover a imagem.

O logotipo empresarial aparece na navegação/identificação do negócio e prévia, **não na marca institucional Locvia**. O arquivo não sai do navegador nesta demo. Não há upload para servidor nem armazenamento seguro de arquivo na nuvem.

## Personalização da interface

- **Marca institucional fixa:** `locvia.`, ponto índigo `#455CD4`.
- **Cor de destaque do negócio:** oito cores sugeridas ou hexadecimal com seis dígitos; mudança imediata dos tokens de UI.
- **Tema:** claro/escuro. Em escuro, o texto do wordmark pode ser claro, mas o ponto permanece índigo.
- **Acessibilidade:** reforço visual de foco, legibilidade, controles e redução de movimento. **Não equivale a conformidade WCAG comprovada.**
- Preferências por cenário **não persistem** após refresh.

## Limitações que não devem ser ocultadas

- Sem conta/logon, equipes, multiempresa real ou permissão RBAC.
- Sem banco, persistência, API, fila, notificações push ou pagamentos.
- Sem segurança de concorrência entre usuários/dispositivos.
- Sem edição completa de aluguéis confirmados, devolução parcial ou controle individual por número de série.
- Sem garantia de conformidade legal, contábil, fiscal ou de acessibilidade.

## Executar e atualizar

```bash
cd ~/homelab/apps/locvia-site
git pull --ff-only
sudo docker compose up -d --build
sudo docker compose ps
curl -fsS http://127.0.0.1:8086/healthz
```

A porta `8086` é o padrão e pode ser alterada via `LOCVIA_PORT`. O bind no host é `127.0.0.1`; o Cloudflare Tunnel deve alcançar o serviço conforme sua topologia de rede. Não publicar a porta Docker na internet desnecessariamente.

A demo e ajuda usam `Cache-Control: no-store` na configuração atual do Nginx para não reter CSS/JS antigos depois de atualização.

## Próximo estágio técnico

No SaaS operacional: construir **API + banco de dados + autenticação + isolamento entre empresas + regras transacionais de estoque + histórico/auditoria**. A demo atual é referência de experiência de uso, **não** backend reutilizável diretamente.
