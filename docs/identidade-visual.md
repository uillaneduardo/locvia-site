# Identidade visual — Locvia

**Status:** padrão de marca adotado.  
**Referência:** wordmark aprovado pelo responsável pelo projeto em 21/10/2026.

## 1. Assinatura institucional

A assinatura principal é **`locvia.`**:

- Escrita **exatamente em minúsculas**, sem espaço antes do ponto.
- Palavra **locvia** em **negrito forte (aproximadamente 800–850)**, com espaçamento ligeiramente condensado.
- **Ponto final índigo `#455CD4`**, em todas as aplicações institucionais.
- Texto grafite **`#111827`** sobre fundos claros.
- Texto quase branco **`#F8FAFC`** em interfaces escuras; **o ponto continua `#455CD4`**.
- Sem gradientes, sombras pesadas, contornos ou deformações. Não substituir o ponto por um círculo separado da linha de base.

O wordmark textual tem precedência sobre a composição anterior que incluía o ícone quadrado ao lado da palavra. O ícone reduzido fica reservado aos contextos em que um símbolo é necessário, como favicon, não como prefixo obrigatório do wordmark.

### Uso oficial no front-end

**Fonte de estilo compartilhada:** `site/assets/locvia-brand.css`.

```html
<link rel="stylesheet" href="/assets/locvia-brand.css">

<strong class="locvia-wordmark">
  locvia<span class="locvia-dot">.</span>
</strong>
```

Esta classe define a família tipográfica de interface, peso forte, espaçamento e cores próprios. Ajuste o **tamanho do contêiner**, não reimplemente as cores em cada página.

A família de referência é **Inter** com substitutas de sistema (Segoe UI/sans-serif), sem incluir arquivos de fonte proprietária neste repositório. O aspecto exato do desenho das letras pode variar conforme as fontes disponíveis no navegador; uma futura versão vetorial finalizada, com curvas tipográficas, deve ser aprovada separadamente antes do uso em impressão ou produção gráfica.

## 2. Cores oficiais e tokens

| Uso | Cor | Hex |
| --- | --- | --- |
| Ponto do wordmark / índigo institucional | Índigo | `#455CD4` |
| Texto do wordmark, fundo claro | Grafite profundo | `#111827` |
| Texto do wordmark, fundo escuro | Quase branco | `#F8FAFC` |
| Fundo institucional claro | Branco | `#FFFFFF` |

Tokens definidos em `site/assets/locvia-brand.css`:

```css
--locvia-brand-ink: #111827;
--locvia-brand-indigo: #455CD4;
--locvia-brand-ink-on-dark: #F8FAFC;
```

**Separação obrigatória:** `--locvia-brand-indigo` é um valor de marca **fixo**. A demo utiliza `--primary`, `--primary-pale`, `--brand-ink` e afins para a interface que o empreendedor pode personalizar. **Não vincular a cor do ponto do wordmark a `--primary`.**

Não é obrigatório que todos os botões da empresa cliente usem índigo; o produto deve reconhecer cores de destaque configuráveis sem descaracterizar a marca Locvia.

## 3. Aplicações

| Superfície | Aplicação |
| --- | --- |
| Site institucional | Wordmark no cabeçalho, na prévia do produto e no rodapé |
| Demo | Wordmark no cabeçalho/menu lateral; independente do logotipo enviado pela locadora |
| Ajuda / FAQ | Wordmark na navegação, seguido por `/ ajuda` como indicação de seção |
| Favicon | Ícone reduzido em `site/assets/favicon.svg`, com ponto harmonizado ao índigo |
| SaaS futuro | Reutilizar o wordmark em login, onboarding, comunicação e navegação conforme os componentes forem criados |

O favicon atual é um **símbolo reduzido de apoio** já existente no projeto, não uma aprovação definitiva de um monograma novo. Revisar seu desenho numa futura etapa específica de design se for desejado um ícone para PWA/lojas.

### Logo da locadora ≠ logo Locvia

Em **Configurações → Dados do negócio**, a locadora pode carregar seu próprio logotipo; ele aparece em **identificação do negócio**, **cabeçalho mobile** e **prévia de Configurações**. **Nunca substitui o wordmark institucional da Locvia.**

## 4. Regras de consistência

- Escrever **Locvia** em texto corrido, e **`locvia.`** quando for o logo.
- Preservar as proporções e a distinção cromática do ponto.
- Respeitar espaço visual ao redor da assinatura.
- Usar bom contraste e não apoiar a marca sobre fundos muito carregados.
- Não deixar as preferências de tema/cor de destaque do cliente modificarem o ponto índigo.
- Não apresentar logotipos ou monogramas novos como oficiais sem aprovação explícita.

## 5. Critério de revisão

Conferir desktop e mobile, nos temas claro e escuro, no **site**, na **demo** e na **Ajuda**. A cor do ponto deve ser `#455CD4` em todas as superfícies, e a palavra precisa manter legibilidade em ambos os temas.
