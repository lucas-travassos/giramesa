# Documentação — GiraMesa

Pasta única com tudo o que alimenta a documentação técnica (ABNT) e a apresentação do projeto.

## Estrutura

```
docs/
├── README.md                  (este arquivo: índice e checklist)
├── plano-construcao.md        (checkpoints e commits)
├── abnt/                      (textos do trabalho: resumo, introdução, objetivos, caso de uso, DER, telas...)
├── diagramas/                 (caso de uso, DER: imagens e arquivos-fonte)
├── telas/
│   ├── desktop/               (prints)
│   └── mobile/                (prints)
├── banco/                     (scripts SQL e schema atual)
├── api/                       (documentação da API e coleção do Thunder Client)
├── checkpoints/               (resumo de cada checkpoint + histórico de commits)
├── apresentacao/              (slides, roteiro, vídeo demo)
├── referencias/               (material de aula, links e fontes consultadas)
└── codex/                     (prompt inicial e modelos de solicitação)
```

## Checklist: o que o Lucas precisa colocar aqui

### A. Informações da faculdade (definem o formato do trabalho)
- [ ] Manual ou template de trabalho acadêmico da UniSENAI e exigências do professor (capa, folha de rosto, sumário, estrutura mínima) → `referencias/`
- [ ] Rubrica ou critérios de avaliação (peso de código, documentação e apresentação) → `referencias/`
- [ ] Data de entrega, data da apresentação, tempo de fala e formato (slides, demo ao vivo, vídeo) → anotar em `apresentacao/informacoes.md`
- [ ] Dados da capa: nome(s) do(s) aluno(s), curso, turma, unidade, professor orientador, cidade, ano → `abnt/dados-capa.md`
- [ ] Confirmação do nome definitivo do projeto (GiraMesa) e logo, se existir → `diagramas/` ou `apresentacao/`

### B. Material que já existe (mover para as pastas)
- [ ] `giramesa-resumo-1sem-e-planejamento-2sem.md`, `documentacao-giramesa-topicos-iniciais.md`, `giramesa-caso-de-uso-descricao.md`, `giramesa-der-descricao.md`, `giramesa-telas-descricao.md` → `abnt/`
- [ ] `giramesa-status-e-roadmap.md` → `abnt/` (ou `referencias/`)
- [ ] `casodeuso_drawio.pdf` e o arquivo-fonte `.drawio` → `diagramas/`
- [ ] Imagem do DER exportada do drawSQL e o arquivo-fonte, se houver → `diagramas/`
- [ ] `giramesa-mysql-v1.sql` e `giramesa-mysql-v2.sql` → `banco/`

### C. Evidências que você precisa gerar
- [ ] **Prints das telas**, com 1 por tela no desktop e, no mínimo, salão, pedido e checkout no mobile. Padrão de nome (segue a numeração de figuras já usada): `fig-03-login.png`, `fig-04-salao.png`, `fig-05-pedido.png`, `fig-06-checkout.png`, `fig-07-usuarios.png`, `fig-08-mesas.png`, `fig-09-produtos.png`, `fig-10-dashboard.png`; versões mobile com sufixo `-mobile`. Fazer os prints **depois** de rodar o `seed:demo` e da identidade visual (checkpoints 12.1 e 13.5), para as telas aparecerem cheias e finais → `telas/desktop/` e `telas/mobile/`
- [ ] Coleção do Thunder Client exportada → `api/`
- [ ] Schema atual do banco, sem dados (ex.: `mysqldump --no-data`, com o nome do seu banco) → `banco/schema-atual.sql`. Nunca incluir senhas, `.env` ou dumps com dados reais
- [ ] Saída de `git log --oneline` (histórico dos checkpoints) → `checkpoints/historico-commits.txt`
- [ ] Imagem atualizada do **DER final** (com `categorias`, `pagamentos` e eventuais ajustes) e do **caso de uso** revisado → `diagramas/`
- [ ] Resultado dos testes que você executou em cada checkpoint, mesmo que em anotações → `checkpoints/`
- [ ] (Opcional) vídeo curto de demonstração do fluxo completo → `apresentacao/`

### D. Referências
- [ ] Lista de fontes que você realmente consultou: slides e aulas do curso, documentação oficial (Vue, Pinia, Bootstrap, Express, Sequelize, MySQL), artigos ou sites usados na pesquisa de mercado → `referencias/fontes.md`
- [ ] Links, livros ou vídeos citados em aula que o professor espera ver nas referências

### E. Apresentação
- [ ] Template de slides da faculdade, se houver → `apresentacao/`
- [ ] Definir quem fala o quê e quanto tempo cada parte tem (se for em grupo) → `apresentacao/informacoes.md`
- [ ] Ensaio com as três contas de teste (garçom, caixa, administrador), conforme `apresentacao/roteiro-demo.md` (será gerado no checkpoint 15.7)

## Regras desta pasta
- Os documentos só descrevem o que foi implementado e testado.
- Cada checkpoint que muda regra, tela, tabela ou endpoint atualiza o documento correspondente no mesmo checkpoint.
- Commits desta pasta usam o prefixo `docs:`.
