# STATUS — GiraMesa

> Documento vivo. **Reescrito por inteiro a cada checkpoint** (não acumular histórico: o histórico fica em `docs/checkpoints/` e no `git log`). Se divergir do git, o git vence.
> Última atualização: a preencher pelo agente no primeiro diagnóstico.

## Onde estamos

- **Branch de trabalho:** `develop` (a `main` só recebe Pull Request). *Confirmar com `git branch --show-current`.*
- **Último checkpoint concluído:** 11.7 (integração de produtos e categorias) + ajuste da porta da API. *Confirmar no `git log`.*
- **Último commit:** a preencher (`git log --oneline -1`).

## Em andamento

- Nenhum. O primeiro diagnóstico do Codex deve confirmar se o 11.8 já foi iniciado.

## Próximo passo

- **11.8 — Dashboard real** (endpoint de agregação só para administrador + integração dos gráficos). Detalhes em `docs/plano-construcao.md`.

## Pendências e decisões abertas

- Confirmar se o checkpoint 11.8 foi iniciado em outra sessão.
- Validar no navegador o login dos três perfis após o ajuste da porta (roteiro em `docs/checkpoints/ajuste-porta-api.md`).
- Autorizações pendentes para a Fase C do plano: helmet, express-rate-limit, sequelize-cli, biblioteca de validação e framework de testes. Nada disso é instalado sem aprovação.
- Reunir o material da faculdade e os prints (checklist em `docs/README.md`).

## Problemas conhecidos e atenção

- A porta 3000 pode estar ocupada por outros projetos (container Docker). A API do GiraMesa usa a **3001**; o front usa `VITE_API_URL=http://localhost:3001/api` no `.env` local.
- O estado do Pinia zera no reload: testar navegando pela interface, não por URL direta.
- Dashboard ainda com dados fictícios até o 11.8.
- Falta o campo de snapshot do nome do produto em `itens_pedido` (checkpoint 14.3); o DER em `docs/diagramas/der-giramesa.txt` registra isso como pendente.

## Mudanças recentes de ambiente ou regra

- API movida de 3000 para 3001 (documentado em `docs/checkpoints/ajuste-porta-api.md`).
- Fluxo de branches: trabalho em `develop`, integração na `main` por Pull Request ao fim de cada fase.
- Padrão de commits: `feat:`, `fix:` e `docs:`, sem acento, com push imediato após cada commit.

## Como retomar uma sessão

1. Ler `AGENTS.md` (regras estáveis) e este arquivo.
2. Conferir com o git: `git branch --show-current`, `git status`, `git log --oneline -10`.
3. Ler `docs/plano-construcao.md` para o item "Próximo passo".
4. Apresentar o plano do checkpoint e aguardar aprovação antes de alterar qualquer arquivo.
