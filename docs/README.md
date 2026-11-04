# Documentação — GiraMesa

Índice dos documentos técnicos, materiais acadêmicos e evidências de validação do GiraMesa, utilizados no trabalho em formato ABNT e na apresentação do sistema.

Dados de demonstração: [execução de `seed:demo` e critérios dos dados](banco/seed-demo.md). Resultados e roteiro de validação no [checkpoint 12.1](checkpoints/12.1-seed-demonstracao.md).

Instalação nova: [README do projeto](../README.md) e [SQL de estrutura e dados iniciais fictícios](banco/instalacao-inicial.sql). Roteiros, resultados atuais e limites das evidências em [TESTES.md](TESTES.md).

Ambiente 12.4: banco em Docker Compose, Node/Vite locais. Preparação, persistência, migração e retorno no [README](../README.md#migração-persistência-e-retorno). Importação, configuração, perfis HTTP e persistência aprovados por scripts; aceite visual mínimo aprovado em 29/10/2026. A porta antiga 3308 está ocupada pelo EstoqueFacil e não deve ser reutilizada sem identificar a origem. Situação em STATUS.

Fluxo financeiro e contrato dos pedidos: [pedidos e pagamentos](api/pedidos.md). Proteções e schemas: [segurança e validações](api/seguranca-validacoes.md). Evolução do banco: [migrations e backup](banco/migracoes.md). Testes repetíveis: npm test em backend/, com resultado atual em TESTES.

## Documentos de trabalho

- [STATUS.md](STATUS.md): estado real, bloqueios e próxima ação; curto e reescrito.
- [Plano de construção](plano-construcao.md): prioridades e calendário até a entrega de 20/11/2026 e apresentação de 24/11/2026.
- [TESTES.md](TESTES.md): uma matriz viva com roteiros reutilizáveis e a última execução registrada por cenário.
- Git e PRs: histórico das mudanças e revisões. Os relatórios já versionados em `checkpoints/` são mantidos como arquivo; não são exigidos novos relatórios por checkpoint.

## Estrutura

```
docs/
├── README.md                  (este arquivo: índice e checklist)
├── plano-construcao.md        (checkpoints e commits)
├── STATUS.md                  (estado atual e retomada)
├── TESTES.md                  (roteiros e resultados atuais)
├── abnt/                      (textos do trabalho: resumo, introdução, objetivos, caso de uso, DER, telas...)
├── diagramas/                 (caso de uso, DER: imagens e arquivos-fonte)
├── telas/
│   ├── desktop/               (prints)
│   └── mobile/                (prints)
├── banco/                     (scripts SQL e schema atual)
├── api/                       (documentação da API e coleção do Thunder Client)
├── checkpoints/               (relatórios históricos já versionados)
├── apresentacao/              (slides, roteiro, vídeo demo)
├── referencias/               (material de aula, links e fontes consultadas)
└── codex/                     (prompt inicial e modelos de solicitação)
```

## Checklist de materiais e evidências da entrega

### A. Informações da faculdade (definem o formato do trabalho)
- [ ] Conferir os modelos UniSENAI e o feedback do professor já disponíveis em `referencias/institucional/` e definir o modelo aplicável (capa, sumário, estrutura mínima); essa pasta permanece local e ignorada pelo Git
- [ ] Rubrica ou critérios de avaliação (peso de código, documentação e apresentação) → `referencias/`
- [x] Datas: entrega em 20/11/2026 e apresentação em 24/11/2026; calendário no plano de construção
- [ ] Tempo de fala e formato da apresentação (slides, demo ao vivo, vídeo)
- [ ] Dados da capa: nome(s) do(s) aluno(s), curso, turma, unidade, professor orientador, cidade, ano → `abnt/dados-capa.md`
- [ ] Confirmação do nome definitivo do projeto (GiraMesa) e logo, se existir → `diagramas/` ou `apresentacao/`

### B. Material que já existe (mover para as pastas)
- [ ] `giramesa-resumo-1sem-e-planejamento-2sem.md`, `documentacao-giramesa-topicos-iniciais.md`, `giramesa-caso-de-uso-descricao.md`, `giramesa-der-descricao.md`, `giramesa-telas-descricao.md` → `abnt/`
- [ ] `giramesa-status-e-roadmap.md` → `abnt/` (ou `referencias/`)
- [ ] `casodeuso_drawio.pdf` e o arquivo-fonte `.drawio` → `diagramas/`
- [ ] Imagem do DER exportada do drawSQL e o arquivo-fonte, se houver → `diagramas/`
- [ ] `giramesa-mysql-v1.sql` e `giramesa-mysql-v2.sql` → `banco/`

### C. Evidências de implementação e validação
- [ ] **Prints das telas**, com 1 por tela no desktop e, no mínimo, salão, pedido e checkout no mobile. Padrão de nome (segue a numeração de figuras já usada): `fig-03-login.png`, `fig-04-salao.png`, `fig-05-pedido.png`, `fig-06-checkout.png`, `fig-07-usuarios.png`, `fig-08-mesas.png`, `fig-09-produtos.png`, `fig-10-dashboard.png`; versões mobile com sufixo `-mobile`. Fazer os prints **depois** de rodar o `seed:demo` e da identidade visual (checkpoints 12.1 e 13.5), para as telas aparecerem cheias e finais → `telas/desktop/` e `telas/mobile/`
- [ ] Coleção do Thunder Client exportada → `api/`
- [ ] Schema atual do banco, sem dados (ex.: `mysqldump --no-data`, com o nome do banco do projeto) → `banco/schema-atual.sql`. Nunca incluir senhas, `.env` ou dumps com dados reais
- [ ] Referenciar commits e PRs relevantes na documentação, sem copiar o histórico inteiro para outro arquivo
- [ ] Imagem atualizada do **DER final** (com `categorias`, `pagamentos` e eventuais ajustes) e do **caso de uso** revisado → `diagramas/`
- [ ] Resultados dos testes, com cenário, ambiente, resultado esperado, última execução e evidência → `TESTES.md`; utilizar essa matriz na seção de metodologia/resultados do trabalho
- [ ] (Opcional) vídeo curto de demonstração do fluxo completo → `apresentacao/`

### D. Referências
- [ ] Lista de fontes efetivamente consultadas: slides e aulas do curso, documentação oficial (Vue, Pinia, Bootstrap, Express, Sequelize, MySQL), artigos ou sites usados na pesquisa de mercado → `referencias/fontes.md`
- [ ] Links, livros ou vídeos indicados em aula e utilizados na fundamentação do trabalho

### E. Apresentação
- [ ] Template de slides da faculdade, se houver → `apresentacao/`
- [ ] Distribuição dos tópicos da apresentação e duração de cada etapa → `apresentacao/informacoes.md`
- [ ] Ensaio com as três contas de teste (garçom, caixa, administrador), conforme `apresentacao/roteiro-demo.md` (será gerado no checkpoint 15.7)

## Regras desta pasta
- Os documentos só descrevem o que foi implementado e testado.
- Cada checkpoint que muda regra, tela, tabela ou endpoint atualiza o documento correspondente no mesmo checkpoint.
- Commits desta pasta usam o prefixo `docs:`.
