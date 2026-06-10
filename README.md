# Bingo Generator — Chá de Bebê

Gerador de cartelas de bingo para chá de bebê. Crie cartelas com design aquarela, personalize o layout e exporte em PDF pronto para impressão.

## Funcionalidades

- **Cartelas 4×4** com 16 palavras sorteadas de uma lista de 48 itens do universo do bebê
- **Design aquarela** como template padrão, com opção de trocar a imagem de fundo
- **Ajuste de posição** das palavras na prévia (arrastar e soltar)
- **PDF em A4** com 2 ou 4 cartelas por folha
- **Até 100 cartelas únicas** geradas de uma vez, sem repetição de combinações

## Início rápido

```bash
npm install
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173), configure a quantidade de cartelas e o layout do PDF, e clique em **Gerar PDF**.

## Scripts

| Comando              | Descrição                                        |
| -------------------- | ------------------------------------------------ |
| `npm run dev`        | Servidor de desenvolvimento (Vite)               |
| `npm run build`      | Build de produção                                |
| `npm run preview`    | Prévia do build                                  |
| `npm test`           | Testes (Vitest)                                  |
| `npm run test:watch` | Testes em modo watch                             |
| `npm run lint`       | ESLint                                           |
| `npm run format`     | Prettier (escreve nos arquivos)                  |
| `npm run check`      | Lint + format check + testes (mesmo fluxo do CI) |

## Stack

- React 18 + Vite 7
- Tailwind CSS
- jsPDF (exportação)
- Vitest + Testing Library
- Husky + lint-staged (pre-commit)

## Estrutura do projeto

```
src/
├── App.jsx              # Interface principal e fluxo de geração
├── components/
│   └── BingoCard.jsx    # Cartela com drag das palavras
├── data/
│   ├── words.js         # Lista de palavras do bingo
│   └── template.js      # Coordenadas das células no design
├── lib/
│   ├── bingo.js         # Embaralhamento e cartelas únicas
│   ├── cellTextLayout.js # Ajuste de tamanho do texto na célula
│   └── pdf.js           # Montagem e exportação do PDF
└── assets/              # Imagens do design aquarela
```

## Personalização

- **Palavras:** edite `src/data/words.js` (mínimo de 16 itens).
- **Layout das células:** ajuste `src/data/template.js` se mudar o design base.
- **Posições na prévia:** arraste as palavras na cartela de preview; as posições são aplicadas no PDF gerado.

## CI

Push na `main` e pull requests rodam `npm run check` (lint, Prettier e testes) via GitHub Actions.
