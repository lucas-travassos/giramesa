# STATUS — GiraMesa

> Documento vivo. **Reescrito por inteiro a cada checkpoint** (não acumular histórico: o histórico fica em `docs/checkpoints/` e no `git log`). Se divergir do git, o git vence.
> Última atualização: 20/10/2026.

## Onde estamos

- **Branch de trabalho:** `develop`, conferida com o Git; `main` só recebe Pull Request.
- **Último checkpoint concluído:** 11.8 — Dashboard real, implementado e validado pelo Lucas.
- **Último commit:** fechamento `docs: fecha checkpoint 11.8 e atualiza status do projeto`, que contém esta versão (`git log --oneline -1` fornece o hash).
- **Commits de implementação:** `d565fa1` (backend) e `174d3eb` (frontend), publicados em `origin/develop`.
- **Integração:** [PR #1 — develop para main](https://github.com/lucas-travassos/giramesa/pull/1) aberto; inclui também `c00a528` e `632dcab`. Revisão e merge dependem do Lucas.

## Validação do último checkpoint

- **11.8 — Dashboard real:** endpoint `GET /api/dashboard` protegido para administrador e front integrado, sem dados aleatórios.
- Passaram: build, sintaxe, HTTP com banco simulado, store Pinia e integração SQL com MySQL real usando somente registros novos em transação revertida.
- Lucas confirmou que todos os testes do roteiro passaram, incluindo navegação pelos três perfis, totais do dashboard e falha/recuperação de rede.
- Roteiro e resultados em `docs/checkpoints/11.8-dashboard-real.md`; contrato em `docs/api/dashboard.md`.

## Próximo passo

- Lucas revisar e aprovar o PR #1; nenhum merge automático.
- **12.1 — seed:demo idempotente:** apresentar plano e aguardar aprovação antes de implementar. Não iniciado.

## Pendências e decisões abertas

- Autorizações pendentes para a Fase C do plano: helmet, express-rate-limit, sequelize-cli, biblioteca de validação e framework de testes. Nada disso é instalado sem aprovação.
- Reunir o material da faculdade e os prints (checklist em `docs/README.md`).

## Problemas conhecidos e atenção

- A porta 3000 pode estar ocupada por outros projetos (container Docker). A API do GiraMesa usa a **3001**; o front usa `VITE_API_URL=http://localhost:3001/api` no `.env` local.
- Testar navegando pela interface: carrinhos e demais estados de atendimento do Pinia zeram no reload; autenticação é restaurada do `localStorage`.
- Dashboard agora exige API e banco ativos; sem pedidos finalizados no período, mostra valores zerados.
- O fechamento existente aceita tolerância de R$ 0,01 na quitação e no limite do pagamento. Pode haver diferença entre consumo e soma dos pagamentos; não foi alterado neste checkpoint.
- Falta o campo de snapshot do nome do produto em `itens_pedido` (checkpoint 14.3); o DER em `docs/diagramas/der-giramesa.txt` registra isso como pendente.

## Mudanças recentes de ambiente ou regra

- Lucas aprovou o 11.8 com a opção A: pedidos finalizados pela data de fechamento. Regra permanente registrada na seção 7 do `AGENTS.md`.
- Sem novas dependências, mudanças de schema ou mudanças de ambiente. Registros de integração foram revertidos; dados de demonstração preservados.

## Como retomar uma sessão

1. Ler `AGENTS.md` (regras estáveis) e este arquivo.
2. Conferir com o git: `git branch --show-current`, `git status`, `git log --oneline -10`.
3. Ler `docs/plano-construcao.md` para o item "Próximo passo".
4. Apresentar o plano do checkpoint e aguardar aprovação antes de alterar qualquer arquivo.
