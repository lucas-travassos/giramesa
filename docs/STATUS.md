# STATUS — GiraMesa

> Documento vivo. **Reescrito por inteiro a cada checkpoint** (não acumular histórico: o histórico fica em `docs/checkpoints/` e no `git log`). Se divergir do git, o git vence.
> Última atualização: 20/10/2026.

## Onde estamos

- **Branch de trabalho:** `develop`, conferida com o Git; `main` só recebe Pull Request.
- **Último checkpoint concluído:** 12.2 — Verificação do frontend, concluída sem alteração do código da aplicação.
- **Último commit:** fechamento `docs: registra verificacao do frontend no checkpoint 12.2`, que contém esta versão (`git log --oneline -1` fornece o hash). Seed e documentação do 12.1 publicadas em `ffca9bc` e `7b1d835`.
- **Integração:** main local em `109e749`, merge do PR #1. O trabalho do checkpoint 12 segue em develop; novo PR somente após concluir 12.1, 12.2 e 12.3.

## Validação do último checkpoint

- **12.2 — Verificação do frontend:** inspeção técnica e build concluídos. Não foram encontrados mocks, o caminho antigo de salvar/remover do CRUD ou arquivos órfãos nas verificações realizadas. Nenhuma alteração no código da aplicação.
- ESLint sem correções automáticas e build de produção passaram, sem erros ou avisos. Os 32 arquivos de src foram alcançados pelos imports locais a partir de main.js.
- Validação manual do 12.1 permanece como evidência anterior; não houve novo teste de interface no 12.2. Limites e resultados em `docs/checkpoints/12.2-verificacao-front.md`.
- Fechamento exclusivamente documental, autorizado após a apresentação das verificações e dos limites registrados.

## Próximo passo

- Aprovar o plano do 12.3 — README de instalação e execução — e definir a preparação inicial do banco antes da implementação. Abrir PR de develop para main somente após fechar o checkpoint 12 inteiro.

## Pendências e decisões abertas

- Não há SQL de criação do banco versionado, e o servidor apenas autentica a conexão. Os seeds atuais pressupõem tabelas e registros iniciais existentes. O 12.3 precisa definir como preparar uma instalação limpa.
- Autorizações pendentes para a Fase C do plano: helmet, express-rate-limit, sequelize-cli, biblioteca de validação e framework de testes. Nada disso é instalado sem aprovação.
- Reunir o material da faculdade e os prints (checklist em `docs/README.md`).

## Problemas conhecidos e atenção

- A porta 3000 pode estar ocupada por outros projetos (container Docker). A API do GiraMesa usa a **3001**; o front usa `VITE_API_URL=http://localhost:3001/api` no `.env` local.
- Testar navegando pela interface: carrinhos e demais estados de atendimento do Pinia zeram no reload; autenticação é restaurada do `localStorage`.
- Dashboard agora exige API e banco ativos; sem pedidos finalizados no período, mostra valores zerados.
- A seed exige MySQL e a conta garcom@giramesa.com ativa como garçom. Não altera credenciais nem os registros anteriores. Os dados de demonstração gerados permanecem no banco para os testes visuais.
- O fechamento existente aceita tolerância de R$ 0,01 na quitação e no limite do pagamento. Pode haver diferença entre consumo e soma dos pagamentos; não foi alterado neste checkpoint.
- Falta o campo de snapshot do nome do produto em `itens_pedido` (checkpoint 14.3); o DER em `docs/diagramas/der-giramesa.txt` registra isso como pendente.

## Mudanças recentes de ambiente ou regra

- Critério do dashboard: pedidos finalizados pela data de fechamento. Regra permanente registrada na seção 7 do `AGENTS.md`.
- Documentação e PRs seguem redação impessoal, técnica e específica ao GiraMesa, conforme seção 4 do `AGENTS.md`.
- Ao entregar um PR, informar o título sugerido para o commit de merge, no padrão do projeto e com o número do PR. Orientação registrada na seção 5 do `AGENTS.md`.
- Sem novas dependências, mudanças de schema ou mudanças de ambiente. O 12.2 não alterou o banco; os dados de demonstração preparados no 12.1 permanecem disponíveis.

## Como retomar uma sessão

1. Ler `AGENTS.md` (regras estáveis) e este arquivo.
2. Conferir com o git: `git branch --show-current`, `git status`, `git log --oneline -10`.
3. Ler `docs/plano-construcao.md` para o item "Próximo passo".
4. Apresentar o plano do checkpoint e aguardar aprovação antes de alterar qualquer arquivo.
